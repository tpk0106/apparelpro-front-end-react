import { useEffect, useState } from "react";
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, MenuItem, TextField, Typography, CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import { toast } from "react-toastify";
import { DASHBOARD_COLORS } from "../dashboard/dashboard-theme";
import { useDropdownTheme } from "../../themes/useDropdownTheme";
import { primaryActionButtonSx, themedButtonLabelStyle, numberFieldNoSpinnerSx, dateIconFieldSx } from "../../themes/workspace-theme";
import { useGetCompanyAddresses } from "../../tanstack-hooks/import-export/company-address-setup.hooks";
import { useGetDestinations } from "../../tanstack-hooks/custom-hooks";
import {
  useGetBoatNote, useSaveBoatNote, useDeleteBoatNote, useDownloadBoatNotePrintPdf,
} from "../../tanstack-hooks/import-export/boat-note.hooks";
import ConfirmDialog from "../common/confirm-dialog";
import type { BoatNoteHeader, BoatNoteCargoLine } from "../../interfaces/import-export/ImportExport";

interface Props {
  invoiceNumber: string | null;
  onClose: () => void;
}

const WEIGHT_UNITS = ["KG", "MT", "LB", "G"];

const emptyHeader = (invoiceNumber: string): BoatNoteHeader => ({
  invoiceNumber,
  boatNoteNumber: "",
  boatNoteDateTime: null,
  customsRegNo: "",
  cusDecRef: "",
  companyAddressId: 0,
  vesselName: "",
  voyageNo: "",
  portOfLoadingCode: "",
  dischargePortCode: "",
  remarks: "",
  customsOfficerStatus: "",
  customsOfficerReference: "",
  terminalOperatorReleaseStatus: "",
  terminalOperatorReference: "",
  shipperAgentSignOffStatus: "",
  chaLicenseNo: "",
});

const emptyLine = (invoiceNumber: string, lineNo: number): Omit<BoatNoteCargoLine, "id"> => ({
  invoiceNumber,
  lineNo,
  containerNo: "",
  sealNo: "",
  packageQuantity: "",
  description: "",
  hsCode: "",
  grossWeight: 0,
  weightUnit: "KG",
});

// Matches a real Sri Lanka Customs e-CDN "Boat Note for Goods Passed out of
// Customs Control" sample - not legacy ie_shp (IE_SHPN1-3.PRG)'s DOS-era
// "Shipping Note/Boat Note", which this migration deliberately does not
// reproduce. One Boat Note per Commercial Invoice, opened from Commercial
// Invoice's row actions - same pattern as Certificate of Origin.
const BoatNoteDialog = ({ invoiceNumber, onClose }: Props) => {
  const { fieldSx, listboxSx } = useDropdownTheme();
  const modalSelectMenuProps = { select: { MenuProps: { slotProps: { paper: { sx: listboxSx } } } } };

  const { data: addresses } = useGetCompanyAddresses();
  const { data: portsPage } = useGetDestinations({
    pageIndex: 0, pageSize: 999, sortColumn: "code", sortOrder: "asc", filterColumn: null, filterQuery: null,
  });
  const ports = portsPage?.items ?? [];
  const { data: existing, isFetching: isLoadingExisting } = useGetBoatNote(invoiceNumber);
  const saveMutation = useSaveBoatNote();
  const deleteMutation = useDeleteBoatNote();
  const downloadPrintMutation = useDownloadBoatNotePrintPdf();

  const [header, setHeader] = useState<BoatNoteHeader>(emptyHeader(invoiceNumber ?? ""));
  const [lines, setLines] = useState<Omit<BoatNoteCargoLine, "id">[]>([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (!invoiceNumber) return;
    if (existing) {
      setHeader(existing.header);
      setLines(existing.lines);
    } else {
      setHeader(emptyHeader(invoiceNumber));
      setLines([]);
    }
  }, [existing, invoiceNumber]);

  const handleAddLine = () => {
    setLines((prev) => [...prev, emptyLine(invoiceNumber ?? "", prev.length + 1)]);
  };

  const handleLineChange = (
    index: number, field: keyof Omit<BoatNoteCargoLine, "id" | "invoiceNumber">, value: string | number,
  ) => {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  };

  const handleDeleteLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!header.companyAddressId) {
      toast.error("Select the Shipper address.");
      return;
    }
    saveMutation.mutate(
      { header, lines: lines.map((l, i) => ({ ...l, id: 0, lineNo: i + 1 })) },
      {
        onSuccess: () => { toast.success("Boat Note saved."); onClose(); },
        onError: (error) => toast.error(error.message || "Failed to save Boat Note."),
      },
    );
  };

  const handlePrint = () => {
    if (!invoiceNumber) return;
    downloadPrintMutation.mutate(
      { invoiceNumber },
      {
        onSuccess: () => toast.success(`Boat Note ${invoiceNumber} printed.`),
        onError: (error) => toast.error(error.message || "Failed to print Boat Note."),
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!invoiceNumber) return;
    deleteMutation.mutate(invoiceNumber, {
      onSuccess: () => { toast.success("Boat Note deleted."); setIsDeleteConfirmOpen(false); onClose(); },
      onError: (error) => toast.error(error.message || "Failed to delete Boat Note."),
    });
  };

  return (
    <Dialog
      open={!!invoiceNumber}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{ paper: { sx: { backgroundColor: DASHBOARD_COLORS.cardBg } } }}
    >
      <DialogTitle sx={{ color: DASHBOARD_COLORS.accentStrong }}>
        Boat Note - Invoice {invoiceNumber}
      </DialogTitle>
      <DialogContent>
        {isLoadingExisting ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 4, justifyContent: "center" }}>
            <CircularProgress size={22} />
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Loading...</Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Boat Note No." size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                value={header.boatNoteNumber || ""} onChange={(e) => setHeader((p) => ({ ...p, boatNoteNumber: e.target.value }))}
              />
              <TextField
                type="datetime-local" label="Date/Time" size="small"
                sx={{ ...(fieldSx as Record<string, unknown>), ...(dateIconFieldSx as Record<string, unknown>), flex: 1, minWidth: 0 }}
                slotProps={{ inputLabel: { shrink: true } }}
                value={header.boatNoteDateTime ? header.boatNoteDateTime.slice(0, 16) : ""}
                onChange={(e) => setHeader((p) => ({ ...p, boatNoteDateTime: e.target.value || null }))}
              />
              <TextField
                label="Customs Reg No." size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                value={header.customsRegNo || ""} onChange={(e) => setHeader((p) => ({ ...p, customsRegNo: e.target.value }))}
              />
              <TextField
                label="ASYCUDA CusDec Ref" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                value={header.cusDecRef || ""} onChange={(e) => setHeader((p) => ({ ...p, cusDecRef: e.target.value }))}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                select label="Shipper" size="small" fullWidth sx={fieldSx}
                slotProps={modalSelectMenuProps}
                value={header.companyAddressId || ""}
                onChange={(e) => setHeader((p) => ({ ...p, companyAddressId: Number(e.target.value) }))}
              >
                {(addresses ?? []).map((a) => (
                  <MenuItem key={a.id} value={a.id}>{a.addressNo}. {a.companyName}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="M/Vessel Name" size="small" fullWidth sx={fieldSx}
                value={header.vesselName || ""} onChange={(e) => setHeader((p) => ({ ...p, vesselName: e.target.value }))}
              />
              <TextField
                label="Voyage No." size="small" fullWidth sx={fieldSx}
                value={header.voyageNo || ""} onChange={(e) => setHeader((p) => ({ ...p, voyageNo: e.target.value }))}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                select label="Port of Loading" size="small" fullWidth sx={fieldSx}
                slotProps={modalSelectMenuProps}
                value={header.portOfLoadingCode || ""} onChange={(e) => setHeader((p) => ({ ...p, portOfLoadingCode: e.target.value }))}
              >
                {ports.map((d) => (
                  <MenuItem key={`${d.countryCode}-${d.code}`} value={d.code}>{d.code} - {d.destinationName}</MenuItem>
                ))}
              </TextField>
              <TextField
                select label="Discharge Port" size="small" fullWidth sx={fieldSx}
                slotProps={modalSelectMenuProps}
                value={header.dischargePortCode || ""} onChange={(e) => setHeader((p) => ({ ...p, dischargePortCode: e.target.value }))}
              >
                {ports.map((d) => (
                  <MenuItem key={`${d.countryCode}-${d.code}`} value={d.code}>{d.code} - {d.destinationName}</MenuItem>
                ))}
              </TextField>
            </Box>
            <TextField
              label="Remarks" size="small" fullWidth multiline minRows={2} sx={fieldSx}
              value={header.remarks || ""} onChange={(e) => setHeader((p) => ({ ...p, remarks: e.target.value }))}
            />

            <Typography sx={{ fontWeight: 600, mt: 1, color: DASHBOARD_COLORS.textPrimary }}>Cargo Summary</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {lines.map((line, index) => (
                <Box key={index} sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                  <TextField
                    label="Container No." size="small" sx={{ ...fieldSx, width: 140 }}
                    value={line.containerNo} onChange={(e) => handleLineChange(index, "containerNo", e.target.value)}
                  />
                  <TextField
                    label="Seal No." size="small" sx={{ ...fieldSx, width: 120 }}
                    value={line.sealNo || ""} onChange={(e) => handleLineChange(index, "sealNo", e.target.value)}
                  />
                  <TextField
                    label="No. of Pkgs." size="small" sx={{ ...fieldSx, width: 130 }}
                    value={line.packageQuantity} onChange={(e) => handleLineChange(index, "packageQuantity", e.target.value)}
                  />
                  <TextField
                    label="Description of Goods" size="small" sx={{ ...fieldSx, flexGrow: 1, minWidth: 200 }}
                    value={line.description} onChange={(e) => handleLineChange(index, "description", e.target.value)}
                  />
                  <TextField
                    label="HS Code" size="small" sx={{ ...fieldSx, width: 110 }}
                    value={line.hsCode || ""} onChange={(e) => handleLineChange(index, "hsCode", e.target.value)}
                  />
                  <TextField
                    label="Gross Wt" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 100 }}
                    value={line.grossWeight} onChange={(e) => handleLineChange(index, "grossWeight", Number(e.target.value))}
                  />
                  <TextField
                    select label="Unit" size="small" sx={{ ...fieldSx, width: 90 }}
                    slotProps={modalSelectMenuProps}
                    value={line.weightUnit} onChange={(e) => handleLineChange(index, "weightUnit", e.target.value)}
                  >
                    {WEIGHT_UNITS.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                  </TextField>
                  <IconButton size="small" color="error" onClick={() => handleDeleteLine(index)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              <Button size="small" onClick={handleAddLine} sx={{ alignSelf: "flex-start" }}>
                + Add Container
              </Button>
            </Box>

            <Typography sx={{ fontWeight: 600, mt: 1, color: DASHBOARD_COLORS.textPrimary }}>Digital Verifications &amp; Releases</Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Customs Officer Status" size="small" fullWidth sx={fieldSx}
                value={header.customsOfficerStatus || ""} onChange={(e) => setHeader((p) => ({ ...p, customsOfficerStatus: e.target.value }))}
              />
              <TextField
                label="Customs Officer Ref./ID" size="small" fullWidth sx={fieldSx}
                value={header.customsOfficerReference || ""} onChange={(e) => setHeader((p) => ({ ...p, customsOfficerReference: e.target.value }))}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Terminal Operator Release" size="small" fullWidth sx={fieldSx}
                value={header.terminalOperatorReleaseStatus || ""} onChange={(e) => setHeader((p) => ({ ...p, terminalOperatorReleaseStatus: e.target.value }))}
              />
              <TextField
                label="Terminal Operator Ref." size="small" fullWidth sx={fieldSx}
                value={header.terminalOperatorReference || ""} onChange={(e) => setHeader((p) => ({ ...p, terminalOperatorReference: e.target.value }))}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Shipper/Agent Sign-off" size="small" fullWidth sx={fieldSx}
                value={header.shipperAgentSignOffStatus || ""} onChange={(e) => setHeader((p) => ({ ...p, shipperAgentSignOffStatus: e.target.value }))}
              />
              <TextField
                label="CHA License No." size="small" fullWidth sx={fieldSx}
                value={header.chaLicenseNo || ""} onChange={(e) => setHeader((p) => ({ ...p, chaLicenseNo: e.target.value }))}
              />
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button
            variant="contained" color="error"
            disabled={!existing || isLoadingExisting}
            onClick={() => setIsDeleteConfirmOpen(true)}
          >
            <span style={themedButtonLabelStyle}>Delete</span>
          </Button>
          <Button
            variant="contained" startIcon={<PrintIcon />} sx={primaryActionButtonSx}
            disabled={!existing || isLoadingExisting || downloadPrintMutation.isPending}
            onClick={handlePrint}
          >
            <span style={themedButtonLabelStyle}>Print</span>
          </Button>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={onClose} variant="contained" sx={primaryActionButtonSx}>
            <span style={themedButtonLabelStyle}>Cancel</span>
          </Button>
          <Button
            onClick={handleSave} variant="contained" sx={primaryActionButtonSx}
            disabled={saveMutation.isPending || isLoadingExisting}
          >
            <span style={themedButtonLabelStyle}>Save Boat Note</span>
          </Button>
        </Box>
      </DialogActions>

      <ConfirmDialog
        open={isDeleteConfirmOpen}
        title="Delete Boat Note"
        message={`Delete the Boat Note for Invoice ${invoiceNumber}? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </Dialog>
  );
};

export default BoatNoteDialog;
