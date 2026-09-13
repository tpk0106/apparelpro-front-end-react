import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Typography, CircularProgress,
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
import { useGetUnits, useGetBuyersQuery, useGetBanksQuery } from "../../tanstack-hooks/custom-hooks";
import { useGetCompanyAddresses } from "../../tanstack-hooks/import-export/company-address-setup.hooks";
import {
  useGetExportLicenses, useGetExportLicense, useSaveExportLicense, useDeleteExportLicense,
  useDownloadExportLicensePrintPdf,
} from "../../tanstack-hooks/import-export/export-license.hooks";
import ConfirmDialog from "../common/confirm-dialog";
import type { ExportLicenseHeader, ExportLicenseLine } from "../../interfaces/import-export/ImportExport";

const APPLICANT_TYPES = ["Individual", "Incorporation", "Partnership", "Sole Proprietorship", "Other"];
const LICENSE_TYPES = ["General", "Block"];
const EXCHANGE_TYPES = ["Exchange", "Non-Exchange"];
const COMMERCIAL_TYPES = ["Commercial", "Non-Commercial"];
const MODE_OF_PAYMENT_OPTIONS = ["DA", "DP", "LC", "TT", "OA"];
const MODE_OF_TRANSPORTATION_OPTIONS = ["Air Freight", "Sea Freight", "Post", "Baggage"];

const EMPTY_HEADER: ExportLicenseHeader = {
  id: 0,
  companyAddressId: 0,
  applicantType: "",
  businessRegistrationNo: "",
  vatRegistrationNo: "",
  telephone: "",
  fax: "",
  email: "",
  applicantIdOfficeUse: "",
  licenseType: "",
  exchangeType: "",
  commercialType: "",
  bankCode: "",
  modeOfPayment: "",
  modeOfTransportation: "",
  consignee1BuyerCode: null,
  consignee2BuyerCode: null,
  purposeOfExportation: "",
  useOfCommodity: "",
  signatoryDate: null,
};

const emptyLine = (itemNo: number): Omit<ExportLicenseLine, "id"> => ({
  exportLicenseHeaderId: 0,
  itemNo,
  hsNumber: "",
  description: "",
  packSize: "",
  unitCode: "",
  quantity: 0,
  unitPrice: 0,
  insurance: 0,
  freight: 0,
  totalCif: 0,
});

// Matches the real Sri Lanka "Application for an Export Control License"
// form (Department of Imports & Exports Control) the user supplied - NOT a
// migration of legacy ie_elic2.prg, which is a quota-based print artifact
// for the old MFA quota system (industry-dead). Standalone document (own
// list) since the real form has no Invoice No. field - it's a general
// license application, not scoped to a specific shipment.
const ExportLicenseListPage = () => {
  const { fieldSx, listboxSx } = useDropdownTheme();
  const modalSelectMenuProps = { MenuProps: { slotProps: { paper: { sx: listboxSx } } } };

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { data: pageData, isLoading } = useGetExportLicenses({ pageNumber: pageIndex, pageSize });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [header, setHeader] = useState<ExportLicenseHeader>(EMPTY_HEADER);
  const [lines, setLines] = useState<Omit<ExportLicenseLine, "id">[]>([]);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const { data: editingDetail, isFetching: isEditingDetailLoading } = useGetExportLicense(editingId);
  const saveMutation = useSaveExportLicense();
  const deleteMutation = useDeleteExportLicense();
  const printMutation = useDownloadExportLicensePrintPdf();

  const { data: companyAddresses } = useGetCompanyAddresses();
  const { data: buyersPage } = useGetBuyersQuery({
    pageIndex: 0, pageSize: 999, sortColumn: "name", sortOrder: "asc", filterColumn: null, filterQuery: null,
  });
  const buyers = useMemo(() => buyersPage?.items || [], [buyersPage]);
  const { data: banksPage } = useGetBanksQuery({
    pageIndex: 0, pageSize: 999, sortColumn: "bankCode", sortOrder: "asc", filterColumn: null, filterQuery: null,
  });
  const banks = useMemo(() => banksPage?.items || [], [banksPage]);
  const { data: unitsPage } = useGetUnits({
    pageIndex: 0, pageSize: 999, sortColumn: "code", sortOrder: "asc", filterColumn: null, filterQuery: null,
  });
  const units = useMemo(() => unitsPage?.items || [], [unitsPage]);

  const openCreateDialog = () => {
    setEditingId(null);
    setHeader(EMPTY_HEADER);
    setLines([]);
    setDialogOpen(true);
  };

  const openEditDialog = (id: number) => {
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

  // Real effect (syncing fetched data into local state), not a derived
  // value - see [[feedback_reason_before_layout_fixes]]: a conditional
  // setState in the render body only fires once per id change, so
  // reselecting the SAME id after closing (if editingId weren't reset by
  // closeDialog) would never re-sync the form.
  useEffect(() => {
    if (editingDetail && editingId) {
      setHeader(editingDetail.header);
      setLines(editingDetail.lines);
    }
  }, [editingDetail, editingId]);

  const setField = <K extends keyof ExportLicenseHeader>(field: K, value: ExportLicenseHeader[K]) => {
    setHeader((p) => ({ ...p, [field]: value }));
  };

  const handleAddLine = () => setLines((prev) => [...prev, emptyLine(prev.length + 1)]);
  const handleLineChange = (
    index: number, field: keyof Omit<ExportLicenseLine, "id" | "exportLicenseHeaderId">, value: string | number,
  ) => setLines((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  const handleDeleteLine = (index: number) => setLines((prev) => prev.filter((_, i) => i !== index));

  const handleSave = () => {
    if (!header.companyAddressId) {
      toast.error("Select the Applicant (Company) address.");
      return;
    }
    saveMutation.mutate(
      { header, lines: lines.map((l, i) => ({ ...l, id: 0, itemNo: i + 1 })) },
      {
        onSuccess: () => { toast.success("Export License saved."); closeDialog(); },
        onError: (error) => toast.error(error.message || "Failed to save Export License."),
      },
    );
  };

  const handlePrint = (id: number) => {
    printMutation.mutate({ id }, {
      onSuccess: () => toast.success("Export License printed."),
      onError: (error) => toast.error(error.message || "Failed to print Export License."),
    });
  };

  const handleDelete = (id: number) => setDeleteTargetId(id);
  const handleConfirmDelete = () => {
    if (!deleteTargetId) return;
    deleteMutation.mutate(deleteTargetId, {
      onSuccess: () => { toast.success("Export License deleted."); setDeleteTargetId(null); },
      onError: (error) => toast.error(error.message || "Failed to delete Export License."),
    });
  };

  const companyNameById = useMemo(
    () => new Map((companyAddresses ?? []).map((a) => [a.id, a.companyName])),
    [companyAddresses],
  );

  const columns = useMemo<MRT_ColumnDef<ExportLicenseHeader>[]>(
    () => [
      { accessorKey: "id", header: "ID", size: 70 },
      {
        accessorKey: "companyAddressId", header: "Applicant", size: 200,
        Cell: ({ cell }) => companyNameById.get(cell.getValue<number>()) ?? cell.getValue<number>(),
      },
      { accessorKey: "applicantType", header: "Applicant Type", size: 130 },
      { accessorKey: "licenseType", header: "License Type", size: 110 },
      { accessorKey: "modeOfTransportation", header: "Transportation", size: 120 },
    ],
    [companyNameById],
  );

  const table = useApparelProTable<ExportLicenseHeader>({
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
        <IconButton size="small" onClick={() => handlePrint(row.original.id)} disabled={printMutation.isPending}>
          <PrintIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error" onClick={() => handleDelete(row.original.id)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Button variant="contained" size="small" startIcon={<PostAddIcon />} onClick={openCreateDialog} sx={primaryActionButtonSx}>
        <span style={themedButtonLabelStyle}>New Export License</span>
      </Button>
    ),
  });

  return (
    <Box sx={{ p: 2 }}>
      <Typography sx={{ fontWeight: 700, fontSize: 18, color: DASHBOARD_COLORS.accentStrong, mb: 2 }}>
        Export License Application
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
          Export License Application
        </DialogTitle>
        <DialogContent>
          {isEditingDetailLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 4, justifyContent: "center" }}>
              <CircularProgress size={22} />
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Loading...</Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <Typography sx={{ fontWeight: 600, color: DASHBOARD_COLORS.textPrimary }}>Applicant Details</Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField select label="01. Type of Applicant" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  slotProps={{ select: modalSelectMenuProps }}
                  value={header.applicantType || ""} onChange={(e) => setField("applicantType", e.target.value)}>
                  {APPLICANT_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
                <TextField select label="02. Company Name / Address" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  slotProps={{ select: modalSelectMenuProps }}
                  value={header.companyAddressId || ""} onChange={(e) => setField("companyAddressId", Number(e.target.value))}>
                  {(companyAddresses ?? []).map((a) => <MenuItem key={a.id} value={a.id}>{a.addressNo}. {a.companyName}</MenuItem>)}
                </TextField>
                <TextField label="Applicant ID (Office Use Only)" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  value={header.applicantIdOfficeUse || ""} onChange={(e) => setField("applicantIdOfficeUse", e.target.value)} />
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField label="03. Business Registration No. (or NIC/Passport No.)" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  value={header.businessRegistrationNo || ""} onChange={(e) => setField("businessRegistrationNo", e.target.value)} />
                <TextField label="04. VAT Registration No." size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  value={header.vatRegistrationNo || ""} onChange={(e) => setField("vatRegistrationNo", e.target.value)} />
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField label="06. Telephone" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  value={header.telephone || ""} onChange={(e) => setField("telephone", e.target.value)} />
                <TextField label="Fax" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  value={header.fax || ""} onChange={(e) => setField("fax", e.target.value)} />
                <TextField label="07. E-mail" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  value={header.email || ""} onChange={(e) => setField("email", e.target.value)} />
              </Box>

              <Typography sx={{ fontWeight: 600, mt: 1, color: DASHBOARD_COLORS.textPrimary }}>Basic Information</Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField select label="08. License Type" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  slotProps={{ select: modalSelectMenuProps }}
                  value={header.licenseType || ""} onChange={(e) => setField("licenseType", e.target.value)}>
                  {LICENSE_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
                <TextField select label="09. Exchange Type" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  slotProps={{ select: modalSelectMenuProps }}
                  value={header.exchangeType || ""} onChange={(e) => setField("exchangeType", e.target.value)}>
                  {EXCHANGE_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
                <TextField select label="10. Commercial Type" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  slotProps={{ select: modalSelectMenuProps }}
                  value={header.commercialType || ""} onChange={(e) => setField("commercialType", e.target.value)}>
                  {COMMERCIAL_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField select label="11. Name of the Bank" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  slotProps={{ select: modalSelectMenuProps }}
                  value={header.bankCode || ""} onChange={(e) => setField("bankCode", e.target.value)}>
                  {banks.map((b) => <MenuItem key={b.bankCode} value={b.bankCode}>{b.bankCode} - {b.name}</MenuItem>)}
                </TextField>
                <TextField select label="12. Mode of Payment" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  slotProps={{ select: modalSelectMenuProps }}
                  value={header.modeOfPayment || ""} onChange={(e) => setField("modeOfPayment", e.target.value)}>
                  {MODE_OF_PAYMENT_OPTIONS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
                <TextField select label="13. Mode of Transportation" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  slotProps={{ select: modalSelectMenuProps }}
                  value={header.modeOfTransportation || ""} onChange={(e) => setField("modeOfTransportation", e.target.value)}>
                  {MODE_OF_TRANSPORTATION_OPTIONS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
              </Box>

              <Typography sx={{ fontWeight: 600, mt: 1, color: DASHBOARD_COLORS.textPrimary }}>
                14. Movement of Goods - Name and Address of the Consignees
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField select label="Consignee 1" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  slotProps={{ select: modalSelectMenuProps }}
                  value={header.consignee1BuyerCode || ""} onChange={(e) => setField("consignee1BuyerCode", Number(e.target.value))}>
                  {buyers.map((b) => <MenuItem key={b.buyerCode} value={b.buyerCode}>{b.buyerCode} - {b.name}</MenuItem>)}
                </TextField>
                <TextField select label="Consignee 2" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
                  slotProps={{ select: modalSelectMenuProps }}
                  value={header.consignee2BuyerCode || ""} onChange={(e) => setField("consignee2BuyerCode", Number(e.target.value))}>
                  {buyers.map((b) => <MenuItem key={b.buyerCode} value={b.buyerCode}>{b.buyerCode} - {b.name}</MenuItem>)}
                </TextField>
              </Box>

              <Typography sx={{ fontWeight: 600, mt: 1, color: DASHBOARD_COLORS.textPrimary }}>15. Goods Detail</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {lines.map((line, index) => (
                  <Box key={index} sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                    <TextField label="HS Number" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 100 }}
                      value={line.hsNumber || ""} onChange={(e) => handleLineChange(index, "hsNumber", e.target.value)} />
                    <TextField label="Description" size="small" sx={{ ...fieldSx, flex: 2, minWidth: 160 }}
                      value={line.description} onChange={(e) => handleLineChange(index, "description", e.target.value)} />
                    <TextField label="Pack Size" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 90 }}
                      value={line.packSize || ""} onChange={(e) => handleLineChange(index, "packSize", e.target.value)} />
                    <TextField select label="UOM" size="small" sx={{ ...fieldSx, flex: 1, minWidth: 90 }}
                      slotProps={{ select: modalSelectMenuProps }}
                      value={line.unitCode || ""} onChange={(e) => handleLineChange(index, "unitCode", e.target.value)}>
                      {units.map((u) => <MenuItem key={u.code} value={u.code}>{u.code}</MenuItem>)}
                    </TextField>
                    <TextField label="Quantity" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, flex: 1, minWidth: 90 }}
                      value={line.quantity} onChange={(e) => handleLineChange(index, "quantity", Number(e.target.value))} />
                    <TextField label="Unit Price" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, flex: 1, minWidth: 90 }}
                      value={line.unitPrice} onChange={(e) => handleLineChange(index, "unitPrice", Number(e.target.value))} />
                    <TextField label="Insurance" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, flex: 1, minWidth: 90 }}
                      value={line.insurance} onChange={(e) => handleLineChange(index, "insurance", Number(e.target.value))} />
                    <TextField label="Freight" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, flex: 1, minWidth: 90 }}
                      value={line.freight} onChange={(e) => handleLineChange(index, "freight", Number(e.target.value))} />
                    <TextField label="Total CIF" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, flex: 1, minWidth: 90 }}
                      value={line.totalCif} onChange={(e) => handleLineChange(index, "totalCif", Number(e.target.value))} />
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
                <TextField label="16. Purpose of Exportation (If NFE Basis)" size="small" fullWidth sx={fieldSx}
                  value={header.purposeOfExportation || ""} onChange={(e) => setField("purposeOfExportation", e.target.value)} />
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField label="17. Use of the Commodity/Raw Material" size="small" fullWidth sx={fieldSx}
                  value={header.useOfCommodity || ""} onChange={(e) => setField("useOfCommodity", e.target.value)} />
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField type="date" label="Declaration Date" size="small" sx={{ ...(fieldSx as Record<string, unknown>), ...(dateIconFieldSx as Record<string, unknown>), flex: 1, minWidth: 0 }}
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={header.signatoryDate?.split("T")[0] || ""} onChange={(e) => setField("signatoryDate", e.target.value || null)} />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" sx={primaryActionButtonSx} onClick={handleSave} disabled={saveMutation.isPending}>
            <span style={themedButtonLabelStyle}>Save Export License</span>
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTargetId}
        title="Delete Export License"
        message="Delete this Export License application? This cannot be undone."
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </Box>
  );
};

export default ExportLicenseListPage;
