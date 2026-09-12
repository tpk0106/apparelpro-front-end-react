import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, MenuItem, TextField, Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import { DASHBOARD_COLORS } from "../dashboard/dashboard-theme";
import { useDropdownTheme } from "../../themes/useDropdownTheme";
import { primaryActionButtonSx, themedButtonLabelStyle, numberFieldNoSpinnerSx } from "../../themes/workspace-theme";
import {
  useGetPackingList, useSavePackingList, useGetStyleColorSizeMatrix, useDownloadPackingListPrintPdf,
} from "../../tanstack-hooks/import-export/packing-list.hooks";

interface Props {
  invoiceNumber: string | null;
  buyerCode: number | null;
  order: string | null;
  typeCode: number | null;
  styleCode: string | null;
  newOrder: string | null;
  packingMedia: string | null; // "1" Carton, "2" Container
  onClose: () => void;
}

// A carton/string "group" row plus one qty value per real size for that
// style - the UI's editable unit. Flattened to one row per size (matching
// the backend's flat storage, same as legacy ie_pack2/ie_pack3) on save,
// and grouped back into this shape on load.
interface GroupRow {
  key: string; // stable React key, not persisted
  fromNo: string; // FromCartonNo or BarNo depending on media
  toNo: string; // ToCartonNo or FromStringNo
  toNo2: string; // (Container only) ToStringNo
  color: string;
  noOfCartons: string; // Carton only
  qtyBySize: Record<string, string>;
}

const emptyGroup = (sizes: string[]): GroupRow => ({
  key: crypto.randomUUID(), fromNo: "", toNo: "", toNo2: "", color: "", noOfCartons: "",
  qtyBySize: Object.fromEntries(sizes.map((s) => [s, ""])),
});

// Legacy (ie_pack1.prg) starts a brand-new packing grid fully blank - the
// order's own color/size allocation is only ever used there to validate a
// typed color, never to pre-fill quantities, since how many pieces land in
// which physical carton/string isn't derivable from the order total. We
// improve on that: seed one starting row per color, holding that color's
// full ordered quantity in every size (as if everything were one carton/
// string), which the user then splits apart into the real physical groups -
// still fully editable, just a better starting point than a blank row.
const starterGroupsFromOrder = (
  sizes: string[], matrix: { color: string; size: string; qty: number }[],
): GroupRow[] => {
  const colorsInOrder = Array.from(new Set(matrix.map((r) => r.color)));
  if (colorsInOrder.length === 0) return [emptyGroup(sizes)];
  return colorsInOrder.map((color) => ({
    key: crypto.randomUUID(), fromNo: "", toNo: "", toNo2: "", color, noOfCartons: "",
    qtyBySize: Object.fromEntries(sizes.map((s) => {
      const match = matrix.find((r) => r.color === color && r.size === s);
      return [s, match?.qty ? String(match.qty) : ""];
    })),
  }));
};

// Matches legacy IE_PACK1.PRG - Packing List is built per Commercial
// Invoice line, with a free-text Detail memo plus one of two breakdown
// grid shapes depending on that line's own Packaging Media (Carton vs
// Container/Hanging Garments) - both grids share the same dynamic
// per-size columns, driven by the style's real color/size matrix.
const PackingListDialog = ({
  invoiceNumber, buyerCode, order, typeCode, styleCode, newOrder, packingMedia, onClose,
}: Props) => {
  const { fieldSx, listboxSx } = useDropdownTheme();
  const modalSelectMenuProps = { MenuProps: { slotProps: { paper: { sx: listboxSx } } } };
  const open = !!invoiceNumber && !!buyerCode && !!order && !!styleCode && !!newOrder;

  const lineKey = open
    ? { invoiceNumber: invoiceNumber!, buyerCode: buyerCode!, order: order!, typeCode: typeCode ?? 0, styleCode: styleCode!, newOrder: newOrder! }
    : null;
  const { data: existing, isFetching: isLoadingExisting } = useGetPackingList(lineKey);
  const { data: colorSizeMatrix } = useGetStyleColorSizeMatrix(buyerCode, order, typeCode, styleCode);
  const saveMutation = useSavePackingList();
  const printMutation = useDownloadPackingListPrintPdf();

  const sizes = useMemo(
    () => Array.from(new Set((colorSizeMatrix ?? []).map((r) => r.size))),
    [colorSizeMatrix],
  );
  const colors = useMemo(
    () => Array.from(new Set((colorSizeMatrix ?? []).map((r) => r.color))),
    [colorSizeMatrix],
  );

  const [detail, setDetail] = useState("");
  const [groups, setGroups] = useState<GroupRow[]>([]);

  useEffect(() => {
    if (!open || sizes.length === 0) return;
    setDetail(existing?.detail ?? "");

    if (packingMedia === "1") {
      const byGroup = new Map<string, GroupRow>();
      for (const row of existing?.cartonRows ?? []) {
        const groupKey = `${row.fromCartonNo}|${row.toCartonNo}|${row.color}`;
        let group = byGroup.get(groupKey);
        if (!group) {
          group = {
            key: groupKey, fromNo: String(row.fromCartonNo), toNo: String(row.toCartonNo), toNo2: "",
            color: row.color, noOfCartons: String(row.noOfCartons), qtyBySize: Object.fromEntries(sizes.map((s) => [s, ""])),
          };
          byGroup.set(groupKey, group);
        }
        group.qtyBySize[row.size] = String(row.qty || "");
      }
      setGroups(byGroup.size > 0 ? Array.from(byGroup.values()) : starterGroupsFromOrder(sizes, colorSizeMatrix ?? []));
    } else if (packingMedia === "2") {
      const byGroup = new Map<string, GroupRow>();
      for (const row of existing?.stringRows ?? []) {
        const groupKey = `${row.barNo}|${row.fromStringNo}|${row.toStringNo}|${row.color}`;
        let group = byGroup.get(groupKey);
        if (!group) {
          group = {
            key: groupKey, fromNo: String(row.barNo), toNo: String(row.fromStringNo), toNo2: String(row.toStringNo),
            color: row.color, noOfCartons: "", qtyBySize: Object.fromEntries(sizes.map((s) => [s, ""])),
          };
          byGroup.set(groupKey, group);
        }
        group.qtyBySize[row.size] = String(row.qty || "");
      }
      setGroups(byGroup.size > 0 ? Array.from(byGroup.values()) : starterGroupsFromOrder(sizes, colorSizeMatrix ?? []));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing, open, packingMedia, sizes.length]);

  const handleAddGroup = () => setGroups((p) => [...p, emptyGroup(sizes)]);
  const handleDeleteGroup = (key: string) => setGroups((p) => p.filter((g) => g.key !== key));
  const updateGroup = (key: string, patch: Partial<GroupRow>) =>
    setGroups((p) => p.map((g) => (g.key === key ? { ...g, ...patch } : g)));
  const updateQty = (key: string, size: string, value: string) =>
    setGroups((p) => p.map((g) => (g.key === key ? { ...g, qtyBySize: { ...g.qtyBySize, [size]: value } } : g)));

  // Legacy (ie_pack1.prg's fun_pac1/fun_pac2 qty field handlers) never
  // checks entered quantities against the order's own color/size
  // allocation either - this is a deliberate improvement over legacy,
  // warning only (not blocking Save) since under-packing or a mid-
  // correction state is normal, not necessarily a mistake.
  const overpackedWarnings = useMemo(() => {
    const orderedByColorSize = new Map<string, number>();
    for (const row of colorSizeMatrix ?? []) {
      const key = `${row.color}|${row.size}`;
      orderedByColorSize.set(key, (orderedByColorSize.get(key) ?? 0) + row.qty);
    }
    const packedByColorSize = new Map<string, number>();
    for (const g of groups) {
      for (const s of sizes) {
        const qty = Number(g.qtyBySize[s]) || 0;
        if (qty <= 0 || !g.color) continue;
        const key = `${g.color}|${s}`;
        packedByColorSize.set(key, (packedByColorSize.get(key) ?? 0) + qty);
      }
    }
    const warnings: { color: string; size: string; packed: number; ordered: number }[] = [];
    for (const [key, packed] of packedByColorSize) {
      const ordered = orderedByColorSize.get(key) ?? 0;
      if (packed > ordered) {
        const [color, size] = key.split("|");
        warnings.push({ color, size, packed, ordered });
      }
    }
    return warnings;
  }, [groups, sizes, colorSizeMatrix]);

  const handlePrint = (format: "cartons" | "hanging") => {
    if (!lineKey) return;
    printMutation.mutate({ ...lineKey, format }, {
      onError: (error) => toast.error(error.message || "Failed to generate Packing List print PDF."),
    });
  };

  const handleSave = () => {
    if (!lineKey) return;
    if (packingMedia !== "1" && packingMedia !== "2") {
      toast.error("Set Packing Media (Carton/Container) on this invoice line before building its Packing List.");
      return;
    }

    const cartonRows = packingMedia === "1" ? groups.flatMap((g) =>
      sizes.filter((s) => g.qtyBySize[s]).map((s) => ({
        id: 0, fromCartonNo: Number(g.fromNo) || 0, toCartonNo: Number(g.toNo) || 0,
        color: g.color, size: s, qty: Number(g.qtyBySize[s]) || 0, noOfCartons: Number(g.noOfCartons) || 0,
      }))) : [];

    const stringRows = packingMedia === "2" ? groups.flatMap((g) =>
      sizes.filter((s) => g.qtyBySize[s]).map((s) => ({
        id: 0, barNo: Number(g.fromNo) || 0, fromStringNo: Number(g.toNo) || 0, toStringNo: Number(g.toNo2) || 0,
        color: g.color, size: s, qty: Number(g.qtyBySize[s]) || 0,
      }))) : [];

    saveMutation.mutate(
      { ...lineKey, detail, cartonRows, stringRows },
      {
        onSuccess: () => { toast.success("Packing List saved."); onClose(); },
        onError: (error) => toast.error(error.message || "Failed to save Packing List."),
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth
      slotProps={{ paper: { sx: { backgroundColor: DASHBOARD_COLORS.cardBg } } }}>
      <DialogTitle sx={{ color: DASHBOARD_COLORS.accentStrong }}>
        Packing List - {styleCode} / {newOrder}
      </DialogTitle>
      <DialogContent>
        {isLoadingExisting ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 4, justifyContent: "center" }}>
            <CircularProgress size={22} />
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Loading...</Typography>
          </Box>
        ) : packingMedia !== "1" && packingMedia !== "2" ? (
          <Typography sx={{ py: 3, fontSize: 13, color: "text.secondary" }}>
            Set Packing Media (Carton or Container) on this invoice line first, then reopen the Packing List.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Detail (Marks & Nos. / Description of Goods / Quantity / Unit / Weight / Measurement)"
              size="small" multiline minRows={4} fullWidth sx={fieldSx}
              slotProps={{ htmlInput: { maxLength: 4000 } }}
              value={detail} onChange={(e) => setDetail(e.target.value)}
            />

            <Typography sx={{ fontWeight: 600 }}>
              {packingMedia === "1" ? "Carton Breakdown" : "Container / Hanging Garments Breakdown"}
            </Typography>

            {overpackedWarnings.length > 0 && (
              <Box sx={{
                border: "1px solid #C9803D", borderRadius: 1, px: 2, py: 1,
                backgroundColor: "rgba(201, 128, 61, 0.1)",
              }}>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#C9803D" }}>
                  Packed quantity exceeds ordered quantity:
                </Typography>
                {overpackedWarnings.map((w) => (
                  <Typography key={`${w.color}-${w.size}`} sx={{ fontSize: 12, color: "text.secondary" }}>
                    Color {w.color} / Size {w.size}: packed {w.packed}, ordered {w.ordered}
                  </Typography>
                ))}
              </Box>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {groups.map((g) => (
                <Box key={g.key} sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                  {packingMedia === "1" ? (
                    <>
                      <TextField label="Carton No. From" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 130 }}
                        value={g.fromNo} onChange={(e) => updateGroup(g.key, { fromNo: e.target.value })} />
                      <TextField label="Carton No. To" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 130 }}
                        value={g.toNo} onChange={(e) => updateGroup(g.key, { toNo: e.target.value })} />
                      <TextField label="No. of Cartons" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 130 }}
                        value={g.noOfCartons} onChange={(e) => updateGroup(g.key, { noOfCartons: e.target.value })} />
                    </>
                  ) : (
                    <>
                      <TextField label="Bar No." size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 100 }}
                        value={g.fromNo} onChange={(e) => updateGroup(g.key, { fromNo: e.target.value })} />
                      <TextField label="String No. From" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 130 }}
                        value={g.toNo} onChange={(e) => updateGroup(g.key, { toNo: e.target.value })} />
                      <TextField label="String No. To" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 130 }}
                        value={g.toNo2} onChange={(e) => updateGroup(g.key, { toNo2: e.target.value })} />
                    </>
                  )}
                  <TextField select label="Color" size="small" sx={{ ...fieldSx, width: 140 }} slotProps={{ select: modalSelectMenuProps }}
                    value={g.color} onChange={(e) => updateGroup(g.key, { color: e.target.value })}>
                    {colors.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </TextField>
                  {sizes.map((s) => (
                    <TextField key={s} label={s} size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 90 }}
                      value={g.qtyBySize[s] ?? ""} onChange={(e) => updateQty(g.key, s, e.target.value)} />
                  ))}
                  <IconButton size="small" color="error" onClick={() => handleDeleteGroup(g.key)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              <Button size="small" onClick={handleAddGroup} sx={{ alignSelf: "flex-start" }}>
                + Add {packingMedia === "1" ? "Carton Group" : "String Group"}
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onClose}>Cancel</Button>
        {(packingMedia === "1" || packingMedia === "2") && (
          <Button
            variant="outlined"
            onClick={() => handlePrint(packingMedia === "1" ? "cartons" : "hanging")}
            disabled={printMutation.isPending}
          >
            {printMutation.isPending ? "Generating..." : "Print"}
          </Button>
        )}
        <Button variant="contained" sx={primaryActionButtonSx} onClick={handleSave} disabled={saveMutation.isPending}>
          <span style={themedButtonLabelStyle}>Save Packing List</span>
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PackingListDialog;
