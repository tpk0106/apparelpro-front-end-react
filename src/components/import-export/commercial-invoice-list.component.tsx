import { useEffect, useMemo, useState } from "react";
import {
  Box, IconButton, TextField, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Typography, Checkbox, FormControlLabel, CircularProgress,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-toastify";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PostAddIcon from "@mui/icons-material/PostAdd";
import { useApparelProTable } from "../../themes/useApparelProTable";
import { useDropdownTheme } from "../../themes/useDropdownTheme";
import { DASHBOARD_COLORS } from "../dashboard/dashboard-theme";
import {
  primaryActionButtonSx, themedButtonLabelStyle, numberFieldNoSpinnerSx, dateIconFieldSx,
} from "../../themes/workspace-theme";
import { useGetBuyersQuery, useGetCurrenciesQuery, useGetDestinations, useGetUnits } from "../../tanstack-hooks/custom-hooks";
import {
  useGetCommercialInvoices, useGetCommercialInvoice, useSaveCommercialInvoice, useDeleteCommercialInvoice,
  useGetOpenPartShipmentsByBuyer, useDownloadCommercialInvoicePrintPdf,
} from "../../tanstack-hooks/import-export/commercial-invoice.hooks";
import PrintIcon from "@mui/icons-material/Print";
import ConfirmDialog from "../common/confirm-dialog";
import type { CommercialInvoicePrintFormat } from "../../services/import-export/commercial-invoice.service";
import type {
  CommercialInvoiceHeader, CommercialInvoiceLine, CommercialInvoiceDetail,
} from "../../interfaces/import-export/ImportExport";

const EMPTY_HEADER: CommercialInvoiceHeader = {
  invoiceNumber: "",
  invoiceDate: new Date().toISOString().split("T")[0],
  buyerCode: 0,
  currencyCode: "",
  destinationCode: "",
  carrierCode: "",
  shipDate: "",
  remark1: "",
  remark2: "",
  remark3: "",
};

const EMPTY_LINE: Omit<CommercialInvoiceLine, "id" | "invoiceNumber"> = {
  buyerCode: 0,
  order: "",
  typeCode: 0,
  styleCode: "",
  newOrder: "",
  unit: "PCS",
  quantity: 0,
  balance: 0,
  quotaCategory: "",
  fromYearMonth: "",
  toYearMonth: "",
  quotaCountry: "",
  packingMedia: "",
};

const CommercialInvoiceListPage = () => {
  const { fieldSx, theme: dropdownTheme } = useDropdownTheme();
  const modalSelectMenuProps = {
    slotProps: {
      paper: {
        sx: {
          backgroundColor: `${dropdownTheme.panelBg} !important`,
          border: `1px solid ${dropdownTheme.panelBorder}`,
        },
      },
    },
  };
  // Colors each option's text/hover/selected state explicitly - without
  // this, a MenuItem falls back to the ambient (often invisible-on-dark)
  // text color, which is what made the Destination dropdown's chosen value
  // unreadable.
  const modalMenuItemSx = {
    color: `${dropdownTheme.optionText} !important`,
    "&:hover": { backgroundColor: `${dropdownTheme.optionHoverBg} !important` },
    "&.Mui-selected": {
      backgroundColor: `${dropdownTheme.optionSelectedBg} !important`,
      color: `${dropdownTheme.optionSelectedText} !important`,
    },
  };

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const { data: pageData, isLoading } = useGetCommercialInvoices({
    pageNumber: pageIndex, pageSize,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInvoiceNumber, setEditingInvoiceNumber] = useState<string | null>(null);
  const [header, setHeader] = useState<CommercialInvoiceHeader>(EMPTY_HEADER);
  const [lines, setLines] = useState<CommercialInvoiceLine[]>([]);
  const [deleteTargetInvoiceNumber, setDeleteTargetInvoiceNumber] = useState<string | null>(null);

  // Same "Pre-printed Commercial Invoice... Yes/No" choice legacy asks at
  // print time (ie_coin2.prg) - nothing is stored, it's picked fresh per print.
  // "full" mirrors legacy's own layout; "fedex"/"srilanka" redraw the two
  // real-world pre-printed templates the user supplied.
  const [printInvoiceNumber, setPrintInvoiceNumber] = useState<string | null>(null);
  const [printFormat, setPrintFormat] = useState<CommercialInvoicePrintFormat>("full");
  const [printAssessmentNo, setPrintAssessmentNo] = useState(true);
  const downloadPrintMutation = useDownloadCommercialInvoicePrintPdf();

  const { data: editingDetail, isFetching: isEditingDetailLoading } = useGetCommercialInvoice(editingInvoiceNumber);
  const saveMutation = useSaveCommercialInvoice();
  const deleteMutation = useDeleteCommercialInvoice();

  const { data: buyersPage } = useGetBuyersQuery({
    pageIndex: 0, pageSize: 999, sortColumn: "name", sortOrder: "asc", filterColumn: null, filterQuery: null,
  });
  const buyers = useMemo(() => buyersPage?.items || [], [buyersPage]);

  const { data: destinationsPage } = useGetDestinations({
    pageIndex: 0, pageSize: 999, sortColumn: "code", sortOrder: "asc", filterColumn: null, filterQuery: null,
  });
  const destinations = useMemo(() => destinationsPage?.items || [], [destinationsPage]);

  const { data: currenciesPage } = useGetCurrenciesQuery({
    pageIndex: 0, pageSize: 999, sortColumn: "code", sortOrder: "asc", filterColumn: null, filterQuery: null,
  });
  const currencies = useMemo(() => currenciesPage?.items || [], [currenciesPage]);

  const { data: unitsPage } = useGetUnits({
    pageIndex: 0, pageSize: 999, sortColumn: "code", sortOrder: "asc", filterColumn: null, filterQuery: null,
  });
  const units = useMemo(() => unitsPage?.items || [], [unitsPage]);

  const buyerNameByCode = useMemo(
    () => new Map(buyers.map((b) => [b.buyerCode, b.name])),
    [buyers],
  );

  // Legacy (ie_coin1.prg) never free-types Order/Type/Style for a line - the
  // user picks from the buyer's open (undelivered) Part Shipment balances,
  // and Order/Type/Style/New Order/Unit/Balance come from that record.
  const { data: openPartShipments } = useGetOpenPartShipmentsByBuyer(header.buyerCode);
  const partShipmentOptions = openPartShipments || [];

  const openCreateDialog = () => {
    setEditingInvoiceNumber(null);
    setHeader(EMPTY_HEADER);
    setLines([]);
    setDialogOpen(true);
  };

  const openEditDialog = (invoiceNumber: string) => {
    // Clear the previous invoice's data immediately - otherwise the dialog
    // briefly (or, if the fetch is cached/instant, indefinitely) shows the
    // prior invoice's header/lines until this one's query resolves.
    setHeader(EMPTY_HEADER);
    setLines([]);
    setEditingInvoiceNumber(invoiceNumber);
    setDialogOpen(true);
  };

  const openPrintDialog = (invoiceNumber: string) => {
    setPrintInvoiceNumber(invoiceNumber);
    setPrintFormat("full");
    setPrintAssessmentNo(true);
  };

  const handleConfirmPrint = () => {
    if (!printInvoiceNumber) return;
    downloadPrintMutation.mutate(
      { invoiceNumber: printInvoiceNumber, format: printFormat, printAssessmentNo },
      {
        onSuccess: () => { toast.success(`Invoice ${printInvoiceNumber} printed.`); setPrintInvoiceNumber(null); },
        onError: (error) => toast.error(error.message || "Failed to print invoice."),
      },
    );
  };

  // Loads the detail into the form once useGetCommercialInvoice resolves for
  // the invoice number being edited. This is a real effect (syncing fetched
  // data into local state), not a derived value - useMemo doesn't guarantee
  // its callback re-runs on every dependency change the way an effect does,
  // which is what let a stale previous invoice's data stick around here.
  useEffect(() => {
    if (editingDetail && editingInvoiceNumber) {
      setHeader(editingDetail.header);
      setLines(editingDetail.lines);
    }
  }, [editingDetail, editingInvoiceNumber]);

  const handleDelete = (invoiceNumber: string) => {
    setDeleteTargetInvoiceNumber(invoiceNumber);
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetInvoiceNumber) return;
    deleteMutation.mutate(deleteTargetInvoiceNumber, {
      onSuccess: () => {
        toast.success(`Invoice ${deleteTargetInvoiceNumber} deleted.`);
        setDeleteTargetInvoiceNumber(null);
      },
      onError: (error) => toast.error(error.message || "Failed to delete invoice."),
    });
  };

  const handleAddLine = () => {
    setLines((prev) => [
      ...prev,
      { ...EMPTY_LINE, id: -(prev.length + 1), invoiceNumber: header.invoiceNumber },
    ]);
  };

  const handleLineChange = (index: number, field: keyof CommercialInvoiceLine, value: string | number) => {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, [field]: value } : line)));
  };

  // Selecting a Part Shipment fills Order/Type/Style/New Order/Unit/Balance
  // from that record - Quantity stays a manual field, capped to its balance,
  // same as the legacy "over quota" guard on ie_coin1's shipment picker.
  const handlePickPartShipment = (index: number, partShipmentId: number) => {
    const picked = partShipmentOptions.find((p) => p.id === partShipmentId);
    if (!picked) return;
    setLines((prev) => prev.map((line, i) => (i === index ? {
      ...line,
      buyerCode: picked.buyerCode,
      order: picked.order,
      typeCode: picked.typeCode,
      styleCode: picked.styleCode,
      newOrder: picked.newOrder,
      unit: picked.unit,
      balance: picked.balance,
      quantity: Math.min(line.quantity, picked.balance),
    } : line)));
  };

  const handleDeleteLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveInvoice = () => {
    if (!header.invoiceNumber.trim() || !header.buyerCode) {
      toast.error("Invoice Number and Buyer are required.");
      return;
    }
    const payload: CommercialInvoiceDetail = {
      header,
      lines: lines.map((l) => ({ ...l, invoiceNumber: header.invoiceNumber })),
    };
    saveMutation.mutate(payload, {
      onSuccess: () => {
        toast.success(`Invoice ${header.invoiceNumber} saved.`);
        setDialogOpen(false);
      },
      onError: (error) => toast.error(error.message || "Failed to save invoice."),
    });
  };

  const columns = useMemo<MRT_ColumnDef<CommercialInvoiceHeader>[]>(
    () => [
      { accessorKey: "invoiceNumber", header: "Invoice No.", size: 120 },
      {
        accessorKey: "invoiceDate", header: "Date", size: 100,
        Cell: ({ cell }) => (cell.getValue() ? String(cell.getValue()).split("T")[0] : ""),
      },
      {
        accessorKey: "buyerCode", header: "Buyer", size: 140,
        Cell: ({ cell }) => buyerNameByCode.get(cell.getValue<number>()) ?? cell.getValue<number>(),
      },
      { accessorKey: "currencyCode", header: "Currency", size: 80 },
      { accessorKey: "destinationCode", header: "Destination", size: 90 },
    ],
    [buyerNameByCode],
  );

  const table = useApparelProTable<CommercialInvoiceHeader>({
    columns,
    data: pageData?.items || [],
    state: { isLoading, pagination: { pageIndex, pageSize } },
    enableEditing: false,
    manualPagination: true,
    rowCount: pageData?.totalItems ?? 0,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function"
        ? updater({ pageIndex, pageSize })
        : updater;
      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
    },
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <IconButton size="small" onClick={() => openEditDialog(row.original.invoiceNumber)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => openPrintDialog(row.original.invoiceNumber)}>
          <PrintIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error" onClick={() => handleDelete(row.original.invoiceNumber)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Button variant="contained" size="small" startIcon={<PostAddIcon />} onClick={openCreateDialog} sx={primaryActionButtonSx}>
        <span style={themedButtonLabelStyle}>New Invoice</span>
      </Button>
    ),
  });

  return (
    <Box sx={{ p: 2 }}>
      <Typography sx={{ fontWeight: 700, fontSize: 18, color: DASHBOARD_COLORS.accentStrong, mb: 2 }}>
        Commercial (Export) Invoice
      </Typography>
      <MaterialReactTable table={table} />

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              backgroundColor: DASHBOARD_COLORS.cardBg,
              border: `1px solid ${DASHBOARD_COLORS.border}`,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.accentStrong }}>
          {editingInvoiceNumber ? `Edit Invoice ${editingInvoiceNumber}` : "New Commercial Invoice"}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: DASHBOARD_COLORS.border }}>
          {editingInvoiceNumber && isEditingDetailLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 4, justifyContent: "center" }}>
              <CircularProgress size={22} />
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Loading invoice {editingInvoiceNumber}...</Typography>
            </Box>
          ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Invoice No." size="small" fullWidth sx={fieldSx}
                value={header.invoiceNumber}
                disabled={!!editingInvoiceNumber}
                onChange={(e) => setHeader((p) => ({ ...p, invoiceNumber: e.target.value.toUpperCase() }))}
              />
              <TextField
                type="date" label="Invoice Date" size="small" fullWidth
                sx={{ ...(fieldSx as Record<string, unknown>), ...(dateIconFieldSx as Record<string, unknown>) }}
                slotProps={{ inputLabel: { shrink: true } }}
                value={header.invoiceDate?.split("T")[0] || ""}
                onChange={(e) => setHeader((p) => ({ ...p, invoiceDate: e.target.value }))}
              />
              <TextField
                select label="Buyer" size="small" fullWidth sx={fieldSx}
                slotProps={{ select: { MenuProps: modalSelectMenuProps } }}
                value={header.buyerCode || ""}
                onChange={(e) => setHeader((p) => ({ ...p, buyerCode: Number(e.target.value) }))}
              >
                {buyers.map((b) => (
                  <MenuItem key={b.buyerCode} value={b.buyerCode} sx={modalMenuItemSx}>{b.buyerCode} - {b.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                select label="Consignee (blank = same as Buyer)" size="small" fullWidth sx={fieldSx}
                slotProps={{ select: { MenuProps: modalSelectMenuProps } }}
                value={header.consigneeCode || ""}
                onChange={(e) => setHeader((p) => ({ ...p, consigneeCode: e.target.value || null }))}
              >
                <MenuItem value="" sx={modalMenuItemSx}><em>Same as Buyer</em></MenuItem>
                {buyers.map((b) => (
                  <MenuItem key={b.buyerCode} value={String(b.buyerCode)} sx={modalMenuItemSx}>{b.buyerCode} - {b.name}</MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                select label="Destination" size="small" fullWidth sx={fieldSx}
                slotProps={{ select: { MenuProps: modalSelectMenuProps } }}
                value={header.destinationCode || ""}
                onChange={(e) => setHeader((p) => ({ ...p, destinationCode: e.target.value }))}
              >
                {destinations.map((d) => (
                  <MenuItem key={`${d.countryCode}-${d.code}`} value={d.code} sx={modalMenuItemSx}>{d.code} - {d.destinationName}</MenuItem>
                ))}
              </TextField>
              <TextField
                select label="Currency" size="small" fullWidth sx={fieldSx}
                slotProps={{ select: { MenuProps: modalSelectMenuProps } }}
                value={header.currencyCode || ""}
                onChange={(e) => setHeader((p) => ({ ...p, currencyCode: e.target.value }))}
              >
                {currencies.map((c) => (
                  <MenuItem key={c.id} value={c.code} sx={modalMenuItemSx}>{c.code} - {c.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Carrier" size="small" fullWidth sx={fieldSx}
                value={header.carrierCode || ""}
                onChange={(e) => setHeader((p) => ({ ...p, carrierCode: e.target.value }))}
              />
              <TextField
                type="date" label="Ship Date" size="small" fullWidth
                sx={{ ...(fieldSx as Record<string, unknown>), ...(dateIconFieldSx as Record<string, unknown>) }}
                slotProps={{ inputLabel: { shrink: true } }}
                value={header.shipDate?.split("T")[0] || ""}
                onChange={(e) => setHeader((p) => ({ ...p, shipDate: e.target.value }))}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField label="Remark 1" size="small" fullWidth sx={fieldSx}
                value={header.remark1 || ""} onChange={(e) => setHeader((p) => ({ ...p, remark1: e.target.value }))} />
              <TextField label="Remark 2" size="small" fullWidth sx={fieldSx}
                value={header.remark2 || ""} onChange={(e) => setHeader((p) => ({ ...p, remark2: e.target.value }))} />
              <TextField label="Remark 3" size="small" fullWidth sx={fieldSx}
                value={header.remark3 || ""} onChange={(e) => setHeader((p) => ({ ...p, remark3: e.target.value }))} />
            </Box>

            <Typography sx={{ fontWeight: 600, mt: 1 }}>Line Items</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {!header.buyerCode && (
                <Typography sx={{ fontSize: 12.5, color: "text.secondary", fontStyle: "italic" }}>
                  Select a Buyer above to see their open shipment balances.
                </Typography>
              )}
              {lines.map((line, index) => {
                // Order/Type/Style/New Order aren't typed - legacy (ie_coin1)
                // only ever lets the user select one of the buyer's open Part
                // Shipment balances, which is what these three fields identify.
                const selectedPartShipment = partShipmentOptions.find(
                  (p) => p.order === line.order && p.typeCode === line.typeCode
                    && p.styleCode === line.styleCode && p.newOrder === line.newOrder,
                );
                return (
                  <Box key={line.id} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <TextField
                      select label="Part Shipment" size="small" sx={{ ...fieldSx, width: 260 }}
                      slotProps={{ select: { MenuProps: modalSelectMenuProps } }}
                      value={selectedPartShipment?.id ?? ""}
                      disabled={!header.buyerCode}
                      onChange={(e) => handlePickPartShipment(index, Number(e.target.value))}
                    >
                      {partShipmentOptions.map((p) => (
                        <MenuItem key={p.id} value={p.id} sx={modalMenuItemSx}>
                          {p.order} · {p.styleCode} · {p.newOrder} - Bal: {p.balance}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select label="Unit" size="small" sx={{ ...fieldSx, width: 90 }}
                      slotProps={{ select: { MenuProps: modalSelectMenuProps } }}
                      value={line.unit}
                      disabled={!selectedPartShipment}
                      onChange={(e) => handleLineChange(index, "unit", e.target.value)}
                    >
                      {units.map((u) => (
                        <MenuItem key={u.id} value={u.code} sx={modalMenuItemSx}>{u.code}</MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label="Qty" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 90 }}
                      value={line.quantity}
                      onChange={(e) => handleLineChange(index, "quantity", Math.min(Number(e.target.value), line.balance))}
                    />
                    <TextField
                      label="Balance" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 90 }}
                      value={line.balance} disabled
                    />
                    <TextField
                      select label="Packing Media" size="small" sx={{ ...fieldSx, width: 130 }}
                      slotProps={{ select: { MenuProps: modalSelectMenuProps } }}
                      value={line.packingMedia}
                      onChange={(e) => handleLineChange(index, "packingMedia", e.target.value)}
                    >
                      <MenuItem value="" sx={modalMenuItemSx}>-</MenuItem>
                      <MenuItem value="1" sx={modalMenuItemSx}>Carton</MenuItem>
                      <MenuItem value="2" sx={modalMenuItemSx}>Container</MenuItem>
                    </TextField>
                    <IconButton size="small" color="error" onClick={() => handleDeleteLine(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                );
              })}
              <Button size="small" onClick={handleAddLine} disabled={!header.buyerCode} sx={{ alignSelf: "flex-start" }}>
                + Add Line
              </Button>
            </Box>
          </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} variant="contained" sx={primaryActionButtonSx}>
            <span style={themedButtonLabelStyle}>Cancel</span>
          </Button>
          <Button
            onClick={handleSaveInvoice} variant="contained" sx={primaryActionButtonSx}
            disabled={saveMutation.isPending || (!!editingInvoiceNumber && isEditingDetailLoading)}
          >
            <span style={themedButtonLabelStyle}>Save Invoice</span>
          </Button>
        </DialogActions>
      </Dialog>

      {/* Same choice legacy asks at print time (ie_coin2.prg's "Pre printed
          Commercial Invoice... Yes/No" and, if pre-printed, "Not to print
          Ass. No." Yes/No) - nothing is stored, picked fresh per print. Three
          formats instead of legacy's two, since two different real-world
          pre-printed templates are now supported (see CommercialInvoicePrintEngine). */}
      <Dialog
        open={!!printInvoiceNumber}
        onClose={() => setPrintInvoiceNumber(null)}
        slotProps={{
          paper: {
            sx: { backgroundColor: DASHBOARD_COLORS.cardBg, border: `1px solid ${DASHBOARD_COLORS.border}` },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.accentStrong }}>
          Print Invoice {printInvoiceNumber}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: DASHBOARD_COLORS.border, minWidth: 320 }}>
          <TextField
            select label="Print Format" size="small" fullWidth sx={fieldSx}
            slotProps={{ select: { MenuProps: modalSelectMenuProps } }}
            value={printFormat}
            onChange={(e) => setPrintFormat(e.target.value as CommercialInvoicePrintFormat)}
          >
            <MenuItem value="full" sx={modalMenuItemSx}>Full Format (legacy layout)</MenuItem>
            <MenuItem value="fedex" sx={modalMenuItemSx}>Pre-printed - International</MenuItem>
            <MenuItem value="srilanka" sx={modalMenuItemSx}>Pre-printed - Sri Lanka Customs</MenuItem>
          </TextField>
          {printFormat !== "full" && (
            <FormControlLabel
              sx={{ mt: 1 }}
              control={<Checkbox checked={printAssessmentNo} onChange={(e) => setPrintAssessmentNo(e.target.checked)} />}
              label="Print Assessment No."
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPrintInvoiceNumber(null)} variant="contained" sx={primaryActionButtonSx}>
            <span style={themedButtonLabelStyle}>Cancel</span>
          </Button>
          <Button onClick={handleConfirmPrint} variant="contained" sx={primaryActionButtonSx} disabled={downloadPrintMutation.isPending}>
            <span style={themedButtonLabelStyle}>Print</span>
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTargetInvoiceNumber}
        title="Delete Commercial Invoice"
        message={`Delete Commercial Invoice ${deleteTargetInvoiceNumber}?`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetInvoiceNumber(null)}
      />
    </Box>
  );
};

export default CommercialInvoiceListPage;
