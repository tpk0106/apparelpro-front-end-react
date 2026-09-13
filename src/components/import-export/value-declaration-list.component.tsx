import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Typography, Checkbox, FormControlLabel, CircularProgress,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-toastify";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PrintIcon from "@mui/icons-material/Print";
import PostAddIcon from "@mui/icons-material/PostAdd";
import { useApparelProTable } from "../../themes/useApparelProTable";
import { useDropdownTheme } from "../../themes/useDropdownTheme";
import { DASHBOARD_COLORS } from "../dashboard/dashboard-theme";
import { primaryActionButtonSx, themedButtonLabelStyle, numberFieldNoSpinnerSx, dateIconFieldSx } from "../../themes/workspace-theme";
import { copperTextColor } from "../../themes/button-color-themes";
import {
  useGetCurrenciesQuery, useGetCountriesQuery, useGetDestinations, useGetUnits, useGetBasis,
} from "../../tanstack-hooks/custom-hooks";
import { useGetPaymentTerms } from "../../tanstack-hooks/import-export/payment-term.hooks";
import { useGetCompanyAddresses } from "../../tanstack-hooks/import-export/company-address-setup.hooks";
import {
  useGetValueDeclarations, useGetValueDeclaration, useSaveValueDeclaration, useDeleteValueDeclaration,
  useDownloadValueDeclarationPrintPdf,
} from "../../tanstack-hooks/import-export/value-declaration.hooks";
import ConfirmDialog from "../common/confirm-dialog";
import type { ValueDeclarationHeader, ValueDeclarationLine } from "../../interfaces/import-export/ImportExport";

const EMPTY_HEADER: ValueDeclarationHeader = {
  id: 0,
  year: "",
  officeCode: "",
  seriesLetter: "",
  cusDecNo: "",
  exporterName: "",
  exporterAddress: "",
  indentingAgentName: "",
  indentingAgentAddress: "",
  importerVatNo: "",
  declarantVatNo: "",
  salesContractNo: "",
  salesContractDate: null,
  invoiceNo: "",
  invoiceDate: null,
  totalInvoiceValue: 0,
  natureOfTransaction: "",
  currencyCode: "",
  termsOfDeliveryCode: "",
  isRelatedToSeller: false,
  wasValueInfluencedByRelationship: false,
  isSaleSubjectToConditions: false,
  hasPreviousImportsLast3Months: false,
  brokerageCommission: 0,
  costOfContainers: 0,
  packingCosts: 0,
  costOfGoodsSuppliedByBuyer: 0,
  royaltiesLicenseFees: 0,
  proceedsToSeller: 0,
  loadingHandlingCharges: 0,
  insurance: 0,
  freight: 0,
  otherPayments: 0,
  termsOfPaymentCode: "",
  portOfShipmentCode: "",
  awbBlNo: "",
  awbBlDate: null,
  importerCompanyAddressId: 0,
  signatoryName: "",
  signatoryTitle: "",
  signatoryDate: null,
  signatoryCompanyName: "",
  continuationSheetsCount: 0,
  appraiserComments: "",
  scComments: "",
  valuationReferenceNo: "",
  centralValuationEndorsement: "",
};

const SERIES_LETTERS = ["I", "R", "S"];

const emptyLine = (itemNo: number): Omit<ValueDeclarationLine, "id"> => ({
  valueDeclarationHeaderId: 0,
  itemNo,
  description: "",
  brand: "",
  model: "",
  size: "",
  countryOfOriginCode: "",
  unitCode: "",
  quantity: 0,
  value: 0,
  hsCode: "",
  weight: 0,
});

// Matches the real Sri Lanka Customs 308A "Value Declaration" (VDF) form the
// user supplied - an IMPORT customs valuation declaration, not a migration
// of legacy ie_dec (a Country-of-Origin/manufacturing declaration for EXPORT
// goods, a different document entirely). Standalone document (own list),
// since it values an import from an overseas exporter, not tied to
// CommercialInvoiceHeader (our own export invoice).
const ValueDeclarationListPage = () => {
  const { fieldSx, listboxSx } = useDropdownTheme();
  const modalSelectMenuProps = { MenuProps: { slotProps: { paper: { sx: listboxSx } } } };

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { data: pageData, isLoading } = useGetValueDeclarations({
    pageNumber: pageIndex, pageSize,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [header, setHeader] = useState<ValueDeclarationHeader>(EMPTY_HEADER);
  const [lines, setLines] = useState<Omit<ValueDeclarationLine, "id">[]>([]);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const { data: editingDetail, isFetching: isEditingDetailLoading } = useGetValueDeclaration(editingId);
  const saveMutation = useSaveValueDeclaration();
  const deleteMutation = useDeleteValueDeclaration();
  const printMutation = useDownloadValueDeclarationPrintPdf();

  const { data: currenciesPage } = useGetCurrenciesQuery({
    pageIndex: 0, pageSize: 999, sortColumn: "code", sortOrder: "asc", filterColumn: null, filterQuery: null,
  });
  const currencies = currenciesPage?.items ?? [];
  const { data: basisPage } = useGetBasis({
    pageIndex: 0, pageSize: 999, sortColumn: "code", sortOrder: "asc", filterColumn: null, filterQuery: null,
  });
  const basisList = basisPage?.items ?? [];
  const { data: countriesPage } = useGetCountriesQuery({
    pageIndex: 0, pageSize: 999, sortColumn: "name", sortOrder: "asc", filterColumn: null, filterQuery: null,
  });
  const countries = countriesPage?.items ?? [];
  const { data: portsPage } = useGetDestinations({
    pageIndex: 0, pageSize: 999, sortColumn: "code", sortOrder: "asc", filterColumn: null, filterQuery: null,
  });
  const ports = portsPage?.items ?? [];
  const { data: unitsPage } = useGetUnits({
    pageIndex: 0, pageSize: 999, sortColumn: "code", sortOrder: "asc", filterColumn: null, filterQuery: null,
  });
  const units = unitsPage?.items ?? [];
  const { data: paymentTerms } = useGetPaymentTerms();
  const { data: companyAddresses } = useGetCompanyAddresses();

  const openCreateDialog = () => {
    setEditingId(null);
    setHeader(EMPTY_HEADER);
    setLines([]);
    setDialogOpen(true);
  };

  const openEditDialog = (id: number) => {
    // Clear the previous record immediately - otherwise the dialog briefly
    // (or, if the fetch is cached/instant, indefinitely) shows the prior
    // record's header/lines until this one's query resolves. Also fully
    // reset editingId on close (see closeDialog below) so reselecting the
    // SAME id later still re-triggers this load-effect.
    setHeader(EMPTY_HEADER);
    setLines([]);
    setEditingId(id);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setHeader(EMPTY_HEADER);
    setLines([]);
  };

  // Loads the detail into the form once useGetValueDeclaration resolves for
  // the id being edited. This is a real effect (syncing fetched data into
  // local state), not a derived value - see [[feedback_reason_before_layout_fixes]]
  // and the Commercial Invoice dialog bug this same shape caused: a
  // conditional setState in the render body only fires once per id change,
  // so reselecting the SAME id after closing (which left editingId
  // unchanged) would never re-sync the form.
  useEffect(() => {
    if (editingDetail && editingId) {
      setHeader(editingDetail.header);
      setLines(editingDetail.lines);
    }
  }, [editingDetail, editingId]);

  const setField = <K extends keyof ValueDeclarationHeader>(field: K, value: ValueDeclarationHeader[K]) => {
    setHeader((p) => ({ ...p, [field]: value }));
  };

  // Copper checkbox (not MUI's default blue) with an explicitly visible
  // label color - same fix as the section headings below, and the same
  // established pattern as letter-of-credit-covering-letter-dialog's own
  // checkbox() helper.
  const vdfCheckbox = (label: string, checked: boolean | null | undefined, onChange: (checked: boolean) => void) => (
    <FormControlLabel
      sx={{ "& .MuiFormControlLabel-label": { color: DASHBOARD_COLORS.textPrimary, fontSize: 13 } }}
      control={
        <Checkbox
          checked={!!checked}
          onChange={(e) => onChange(e.target.checked)}
          sx={{ color: copperTextColor, "&.Mui-checked": { color: copperTextColor } }}
        />
      }
      label={label}
    />
  );

  const handleAddLine = () => setLines((prev) => [...prev, emptyLine(prev.length + 1)]);
  const handleLineChange = (
    index: number, field: keyof Omit<ValueDeclarationLine, "id" | "valueDeclarationHeaderId">, value: string | number,
  ) => setLines((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  const handleDeleteLine = (index: number) => setLines((prev) => prev.filter((_, i) => i !== index));

  const handleSave = () => {
    if (!header.exporterName.trim() || !header.invoiceNo.trim()) {
      toast.error("Exporter Name and Invoice No. are required.");
      return;
    }
    saveMutation.mutate(
      { header, lines: lines.map((l, i) => ({ ...l, id: 0, itemNo: i + 1 })) },
      {
        onSuccess: () => { toast.success("Value Declaration saved."); closeDialog(); },
        onError: (error) => toast.error(error.message || "Failed to save Value Declaration."),
      },
    );
  };

  const handlePrint = (id: number, invoiceNo: string) => {
    printMutation.mutate({ id, invoiceNo }, {
      onSuccess: () => toast.success(`Value Declaration ${invoiceNo} printed.`),
      onError: (error) => toast.error(error.message || "Failed to print Value Declaration."),
    });
  };

  const handleDelete = (id: number) => setDeleteTargetId(id);
  const handleConfirmDelete = () => {
    if (!deleteTargetId) return;
    deleteMutation.mutate(deleteTargetId, {
      onSuccess: () => { toast.success("Value Declaration deleted."); setDeleteTargetId(null); },
      onError: (error) => toast.error(error.message || "Failed to delete Value Declaration."),
    });
  };

  const columns = useMemo<MRT_ColumnDef<ValueDeclarationHeader>[]>(
    () => [
      { accessorKey: "invoiceNo", header: "Invoice No.", size: 120 },
      {
        accessorKey: "invoiceDate", header: "Date", size: 100,
        Cell: ({ cell }) => (cell.getValue() ? String(cell.getValue()).split("T")[0] : ""),
      },
      { accessorKey: "exporterName", header: "Exporter", size: 200 },
      { accessorKey: "currencyCode", header: "Currency", size: 90 },
      {
        accessorKey: "totalInvoiceValue", header: "Total Invoice Value", size: 130,
        Cell: ({ cell }) => cell.getValue<number>()?.toLocaleString(undefined, { minimumFractionDigits: 2 }),
      },
    ],
    [],
  );

  const table = useApparelProTable<ValueDeclarationHeader>({
    columns,
    data: pageData?.items || [],
    state: { isLoading, pagination: { pageIndex, pageSize } },
    enableEditing: false,
    manualPagination: true,
    rowCount: pageData?.totalItems ?? 0,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater;
      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
    },
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <IconButton size="small" onClick={() => openEditDialog(row.original.id)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => handlePrint(row.original.id, row.original.invoiceNo)} disabled={printMutation.isPending}>
          <PrintIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error" onClick={() => handleDelete(row.original.id)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Button variant="contained" size="small" startIcon={<PostAddIcon />} onClick={openCreateDialog} sx={primaryActionButtonSx}>
        <span style={themedButtonLabelStyle}>New Value Declaration</span>
      </Button>
    ),
  });

  return (
    <Box sx={{ p: 2 }}>
      <Typography sx={{ fontWeight: 700, fontSize: 18, color: DASHBOARD_COLORS.accentStrong, mb: 2 }}>
        Value Declaration Form (Customs 308A)
      </Typography>
      <MaterialReactTable table={table} />

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="lg"
        fullWidth
        slotProps={{ paper: { sx: { backgroundColor: DASHBOARD_COLORS.cardBg } } }}
      >
        <DialogTitle sx={{ color: DASHBOARD_COLORS.accentStrong }}>
          Value Declaration Form {header.invoiceNo ? `- Invoice ${header.invoiceNo}` : ""}
        </DialogTitle>
        <DialogContent>
          {isEditingDetailLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 4, justifyContent: "center" }}>
              <CircularProgress size={22} />
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Loading...</Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField label="Year" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  value={header.year || ""} onChange={(e) => setField("year", e.target.value)} />
                <TextField label="Office Code" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  value={header.officeCode || ""} onChange={(e) => setField("officeCode", e.target.value)} />
                <TextField select label="S/L" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  slotProps={{ select: modalSelectMenuProps }}
                  value={header.seriesLetter || ""} onChange={(e) => setField("seriesLetter", e.target.value)}>
                  {SERIES_LETTERS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
                <TextField label="CusDec No." size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  value={header.cusDecNo || ""} onChange={(e) => setField("cusDecNo", e.target.value)} />
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField label="Exporter's Name" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  value={header.exporterName} onChange={(e) => setField("exporterName", e.target.value)} />
                <TextField label="Exporter's Address" size="small" multiline minRows={1} sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  value={header.exporterAddress || ""} onChange={(e) => setField("exporterAddress", e.target.value)} />
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField label="Indenting Agent's Name" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  value={header.indentingAgentName || ""} onChange={(e) => setField("indentingAgentName", e.target.value)} />
                <TextField label="Indenting Agent's Address" size="small" multiline minRows={1} sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  value={header.indentingAgentAddress || ""} onChange={(e) => setField("indentingAgentAddress", e.target.value)} />
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField label="Importer VAT No." size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  value={header.importerVatNo || ""} onChange={(e) => setField("importerVatNo", e.target.value)} />
                <TextField label="Declarant VAT No." size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  value={header.declarantVatNo || ""} onChange={(e) => setField("declarantVatNo", e.target.value)} />
                <TextField label="Sales Contract No." size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  value={header.salesContractNo || ""} onChange={(e) => setField("salesContractNo", e.target.value)} />
                <TextField type="date" label="Sales Contract Date" size="small" sx={{ ...(fieldSx as Record<string, unknown>), ...(dateIconFieldSx as Record<string, unknown>), flex: 1, minWidth: 0 }}
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={header.salesContractDate?.split("T")[0] || ""} onChange={(e) => setField("salesContractDate", e.target.value || null)} />
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField label="Invoice No." size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  value={header.invoiceNo} onChange={(e) => setField("invoiceNo", e.target.value)} />
                <TextField type="date" label="Invoice Date" size="small" sx={{ ...(fieldSx as Record<string, unknown>), ...(dateIconFieldSx as Record<string, unknown>), flex: 1, minWidth: 0 }}
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={header.invoiceDate?.split("T")[0] || ""} onChange={(e) => setField("invoiceDate", e.target.value || null)} />
                <TextField label="Total Invoice Value" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, flex: 1, minWidth: 0 }}
                  value={header.totalInvoiceValue} onChange={(e) => setField("totalInvoiceValue", Number(e.target.value))} />
                <TextField label="Nature of Transaction" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  value={header.natureOfTransaction || ""} onChange={(e) => setField("natureOfTransaction", e.target.value)} />
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField select label="Currency of Payment" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  slotProps={{ select: modalSelectMenuProps }}
                  value={header.currencyCode || ""} onChange={(e) => setField("currencyCode", e.target.value)}>
                  {currencies.map((c) => <MenuItem key={c.code} value={c.code}>{c.code} - {c.name}</MenuItem>)}
                </TextField>
                <TextField select label="Terms of Delivery" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  slotProps={{ select: modalSelectMenuProps }}
                  value={header.termsOfDeliveryCode || ""} onChange={(e) => setField("termsOfDeliveryCode", e.target.value)}>
                  {basisList.map((b) => <MenuItem key={b.code} value={b.code}>{b.code} - {b.description}</MenuItem>)}
                </TextField>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {vdfCheckbox(
                  "12. Are you related to the seller in terms of Article 9 of Schedule E of the Customs Ordinance :",
                  header.isRelatedToSeller, (checked) => setField("isRelatedToSeller", checked),
                )}
                {vdfCheckbox(
                  "13. If related, was the value influenced by the relationship ?",
                  header.wasValueInfluencedByRelationship, (checked) => setField("wasValueInfluencedByRelationship", checked),
                )}
                {vdfCheckbox(
                  "14. Is the sale subject any conditions or restriction imposed by the seller ?",
                  header.isSaleSubjectToConditions, (checked) => setField("isSaleSubjectToConditions", checked),
                )}
                {vdfCheckbox(
                  "15. Previous imports of identical/similar goods, if any (within last three months)",
                  header.hasPreviousImportsLast3Months, (checked) => setField("hasPreviousImportsLast3Months", checked),
                )}
              </Box>

              <Typography sx={{ fontWeight: 600, mt: 1, color: DASHBOARD_COLORS.textPrimary }}>
                11. Declare any of the following costs & services not included in the invoice value in terms of article 8 (1) & 8 (2) of Schedule E of the Customs Ordinance
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <TextField label="Brokerage & Commissions" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, flex: 1, minWidth: 150 }}
                  value={header.brokerageCommission} onChange={(e) => setField("brokerageCommission", Number(e.target.value))} />
                <TextField label="Cost of Containers" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, flex: 1, minWidth: 150 }}
                  value={header.costOfContainers} onChange={(e) => setField("costOfContainers", Number(e.target.value))} />
                <TextField label="Packing Costs" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, flex: 1, minWidth: 150 }}
                  value={header.packingCosts} onChange={(e) => setField("packingCosts", Number(e.target.value))} />
                <TextField label="Goods/Services Supplied by Buyer" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, flex: 1, minWidth: 150 }}
                  value={header.costOfGoodsSuppliedByBuyer} onChange={(e) => setField("costOfGoodsSuppliedByBuyer", Number(e.target.value))} />
                <TextField label="Royalties & License Fees" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, flex: 1, minWidth: 150 }}
                  value={header.royaltiesLicenseFees} onChange={(e) => setField("royaltiesLicenseFees", Number(e.target.value))} />
                <TextField label="Proceeds to Seller" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, flex: 1, minWidth: 150 }}
                  value={header.proceedsToSeller} onChange={(e) => setField("proceedsToSeller", Number(e.target.value))} />
                <TextField label="Loading/Handling Charges" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, flex: 1, minWidth: 150 }}
                  value={header.loadingHandlingCharges} onChange={(e) => setField("loadingHandlingCharges", Number(e.target.value))} />
                <TextField label="Insurance" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, flex: 1, minWidth: 150 }}
                  value={header.insurance} onChange={(e) => setField("insurance", Number(e.target.value))} />
                <TextField label="Freight" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, flex: 1, minWidth: 150 }}
                  value={header.freight} onChange={(e) => setField("freight", Number(e.target.value))} />
                <TextField label="Other Payments" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, flex: 1, minWidth: 150 }}
                  value={header.otherPayments} onChange={(e) => setField("otherPayments", Number(e.target.value))} />
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField select label="Terms of Payment" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  slotProps={{ select: modalSelectMenuProps }}
                  value={header.termsOfPaymentCode || ""} onChange={(e) => setField("termsOfPaymentCode", e.target.value)}>
                  {(paymentTerms ?? []).map((p) => <MenuItem key={p.code} value={p.code}>{p.code} - {p.description}</MenuItem>)}
                </TextField>
                <TextField select label="Port of Shipment" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  slotProps={{ select: modalSelectMenuProps }}
                  value={header.portOfShipmentCode || ""} onChange={(e) => setField("portOfShipmentCode", e.target.value)}>
                  {ports.map((d) => <MenuItem key={`${d.countryCode}-${d.code}`} value={d.code}>{d.code} - {d.destinationName}</MenuItem>)}
                </TextField>
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField label="AWB/BL No." size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  value={header.awbBlNo || ""} onChange={(e) => setField("awbBlNo", e.target.value)} />
                <TextField type="date" label="AWB/BL Date" size="small" sx={{ ...(fieldSx as Record<string, unknown>), ...(dateIconFieldSx as Record<string, unknown>), flex: 1, minWidth: 0 }}
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={header.awbBlDate?.split("T")[0] || ""} onChange={(e) => setField("awbBlDate", e.target.value || null)} />
                <TextField select label="Importer's Name and Address" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  slotProps={{ select: modalSelectMenuProps }}
                  value={header.importerCompanyAddressId || ""} onChange={(e) => setField("importerCompanyAddressId", Number(e.target.value))}>
                  {(companyAddresses ?? []).map((a) => <MenuItem key={a.id} value={a.id}>{a.addressNo}. {a.companyName}</MenuItem>)}
                </TextField>
              </Box>

              <Typography sx={{ fontWeight: 600, mt: 1, color: DASHBOARD_COLORS.textPrimary }}>Complete Description of Goods</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {lines.map((line, index) => (
                  <Box key={index} sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                    <TextField label="Description" size="small" sx={{ ...fieldSx, flex: 2, minWidth: 160 }}
                      value={line.description} onChange={(e) => handleLineChange(index, "description", e.target.value)} />
                    <TextField label="Brand" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 90 }}
                      value={line.brand || ""} onChange={(e) => handleLineChange(index, "brand", e.target.value)} />
                    <TextField label="Model" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 90 }}
                      value={line.model || ""} onChange={(e) => handleLineChange(index, "model", e.target.value)} />
                    <TextField label="Size" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 70 }}
                      value={line.size || ""} onChange={(e) => handleLineChange(index, "size", e.target.value)} />
                    <TextField select label="CO" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 90 }}
                      slotProps={{ select: modalSelectMenuProps }}
                      value={line.countryOfOriginCode || ""} onChange={(e) => handleLineChange(index, "countryOfOriginCode", e.target.value)}>
                      {countries.map((c) => <MenuItem key={c.code} value={c.code}>{c.code}</MenuItem>)}
                    </TextField>
                    <TextField select label="UOM" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 90 }}
                      slotProps={{ select: modalSelectMenuProps }}
                      value={line.unitCode || ""} onChange={(e) => handleLineChange(index, "unitCode", e.target.value)}>
                      {units.map((u) => <MenuItem key={u.code} value={u.code}>{u.code}</MenuItem>)}
                    </TextField>
                    <TextField label="Quantity" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, flex: 1, minWidth: 90 }}
                      value={line.quantity} onChange={(e) => handleLineChange(index, "quantity", Number(e.target.value))} />
                    <TextField label="Value" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, flex: 1, minWidth: 90 }}
                      value={line.value} onChange={(e) => handleLineChange(index, "value", Number(e.target.value))} />
                    <TextField label="HS Code" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 100 }}
                      value={line.hsCode || ""} onChange={(e) => handleLineChange(index, "hsCode", e.target.value)} />
                    <TextField label="Weight" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, flex: 1, minWidth: 90 }}
                      value={line.weight ?? ""} onChange={(e) => handleLineChange(index, "weight", Number(e.target.value))} />
                    <IconButton size="small" color="error" onClick={() => handleDeleteLine(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                <Button size="small" onClick={handleAddLine} sx={{ alignSelf: "flex-start" }}>
                  + Add Item
                </Button>
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField label="Name of Signatory" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  value={header.signatoryName || ""} onChange={(e) => setField("signatoryName", e.target.value)} />
                <TextField label="Title" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  value={header.signatoryTitle || ""} onChange={(e) => setField("signatoryTitle", e.target.value)} />
                <TextField type="date" label="Date" size="small" sx={{ ...(fieldSx as Record<string, unknown>), ...(dateIconFieldSx as Record<string, unknown>), flex: 1, minWidth: 0 }}
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={header.signatoryDate?.split("T")[0] || ""} onChange={(e) => setField("signatoryDate", e.target.value || null)} />
                <TextField label="Name of Company" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  value={header.signatoryCompanyName || ""} onChange={(e) => setField("signatoryCompanyName", e.target.value)} />
                <TextField label="No. of Continuation Sheets" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, flex: 1, minWidth: 0 }}
                  value={header.continuationSheetsCount ?? 0} onChange={(e) => setField("continuationSheetsCount", Number(e.target.value))} />
              </Box>

              <Typography sx={{ fontWeight: 600, mt: 1, color: DASHBOARD_COLORS.textPrimary }}>For Office Use</Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField label="Appraiser's Comments" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  value={header.appraiserComments || ""} onChange={(e) => setField("appraiserComments", e.target.value)} />
                <TextField label="SC's Comments" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  value={header.scComments || ""} onChange={(e) => setField("scComments", e.target.value)} />
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField label="Valuation Reference No." size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  value={header.valuationReferenceNo || ""} onChange={(e) => setField("valuationReferenceNo", e.target.value)} />
                <TextField label="Central Valuation Division Endorsement" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  value={header.centralValuationEndorsement || ""} onChange={(e) => setField("centralValuationEndorsement", e.target.value)} />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" sx={primaryActionButtonSx} onClick={handleSave} disabled={saveMutation.isPending}>
            <span style={themedButtonLabelStyle}>Save Value Declaration</span>
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTargetId}
        title="Delete Value Declaration"
        message={`Delete this Value Declaration (Invoice ${lines.length ? header.invoiceNo : ""})? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </Box>
  );
};

export default ValueDeclarationListPage;
