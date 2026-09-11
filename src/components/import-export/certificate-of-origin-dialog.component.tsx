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
import { primaryActionButtonSx, themedButtonLabelStyle, numberFieldNoSpinnerSx } from "../../themes/workspace-theme";
import { useGetCompanyAddresses } from "../../tanstack-hooks/import-export/company-address-setup.hooks";
import {
  useGetCertificateOfOrigin, useSaveCertificateOfOrigin, useDeleteCertificateOfOrigin,
  useDownloadCertificateOfOriginPrintPdf,
} from "../../tanstack-hooks/import-export/certificate-of-origin.hooks";
import type { CertificateOfOriginPrintFormat } from "../../services/import-export/certificate-of-origin.service";
import ConfirmDialog from "../common/confirm-dialog";
import type {
  CertificateOfOriginHeader, CertificateOfOriginLine,
} from "../../interfaces/import-export/ImportExport";

interface Props {
  invoiceNumber: string | null;
  onClose: () => void;
}

const emptyHeader = (invoiceNumber: string): CertificateOfOriginHeader => ({
  invoiceNumber,
  refNo: "",
  companyAddressId: 0,
  countryOfOrigin: "LK",
  portOfLoading: "",
  otherRemarks: "",
  competentAuthorityName: "",
  issuePlace: "",
  issueDate: null,
  requestSubmittedBy: "",
});

const emptyLine = (invoiceNumber: string, itemNo: number): Omit<CertificateOfOriginLine, "id"> => ({
  invoiceNumber,
  itemNo,
  shippingMarks: "",
  packageTypeQuantity: "",
  itemName: "",
  hsCode: "",
  nettWeight: 0,
  grossWeight: 0,
});

// Matches the real Ceylon Chamber of Commerce "Certificate of Origin" (EXP
// 5) form's boxes 1-13 (boxes 6/14/17 are chamber/official-use only, not
// entered here). Opened from Commercial Invoice's row actions - one
// certificate per invoice.
const CertificateOfOriginDialog = ({ invoiceNumber, onClose }: Props) => {
  const { fieldSx, listboxSx } = useDropdownTheme();
  const modalSelectMenuProps = { select: { MenuProps: { slotProps: { paper: { sx: listboxSx } } } } };

  const { data: addresses } = useGetCompanyAddresses();
  const { data: existing, isFetching: isLoadingExisting } = useGetCertificateOfOrigin(invoiceNumber);
  const saveMutation = useSaveCertificateOfOrigin();
  const deleteMutation = useDeleteCertificateOfOrigin();
  const downloadPrintMutation = useDownloadCertificateOfOriginPrintPdf();

  const [header, setHeader] = useState<CertificateOfOriginHeader>(emptyHeader(invoiceNumber ?? ""));
  const [lines, setLines] = useState<Omit<CertificateOfOriginLine, "id">[]>([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [printFormat, setPrintFormat] = useState<CertificateOfOriginPrintFormat>("full");

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
    index: number, field: keyof Omit<CertificateOfOriginLine, "id" | "invoiceNumber">, value: string | number,
  ) => {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  };

  const handleDeleteLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!header.companyAddressId) {
      toast.error("Select the Consignor/Exporter address.");
      return;
    }
    saveMutation.mutate(
      { header, lines: lines.map((l, i) => ({ ...l, id: 0, itemNo: i + 1 })) },
      {
        onSuccess: () => { toast.success("Certificate of Origin saved."); onClose(); },
        onError: (error) => toast.error(error.message || "Failed to save Certificate of Origin."),
      },
    );
  };

  const handlePrint = () => {
    if (!invoiceNumber) return;
    downloadPrintMutation.mutate(
      { invoiceNumber, format: printFormat },
      {
        onSuccess: () => toast.success(`Certificate of Origin ${invoiceNumber} printed.`),
        onError: (error) => toast.error(error.message || "Failed to print Certificate of Origin."),
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!invoiceNumber) return;
    deleteMutation.mutate(invoiceNumber, {
      onSuccess: () => { toast.success("Certificate of Origin deleted."); setIsDeleteConfirmOpen(false); onClose(); },
      onError: (error) => toast.error(error.message || "Failed to delete Certificate of Origin."),
    });
  };

  return (
    <Dialog
      open={!!invoiceNumber}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { backgroundColor: DASHBOARD_COLORS.cardBg } } }}
    >
      <DialogTitle sx={{ color: DASHBOARD_COLORS.accentStrong }}>
        Certificate of Origin - Invoice {invoiceNumber}
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
                label="Ref. No." size="small" fullWidth sx={fieldSx}
                value={header.refNo} onChange={(e) => setHeader((p) => ({ ...p, refNo: e.target.value }))}
              />
              <TextField
                select label="Consignor / Exporter" size="small" fullWidth sx={fieldSx}
                slotProps={modalSelectMenuProps}
                value={header.companyAddressId || ""}
                onChange={(e) => setHeader((p) => ({ ...p, companyAddressId: Number(e.target.value) }))}
              >
                {(addresses ?? []).map((a) => (
                  <MenuItem key={a.id} value={a.id}>{a.addressNo}. {a.companyName}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Country of Origin" size="small" sx={{ ...fieldSx, width: 160 }}
                value={header.countryOfOrigin} onChange={(e) => setHeader((p) => ({ ...p, countryOfOrigin: e.target.value }))}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Port of Loading" size="small" fullWidth sx={fieldSx}
                value={header.portOfLoading || ""} onChange={(e) => setHeader((p) => ({ ...p, portOfLoading: e.target.value }))}
              />
              <TextField
                label="Request Submitted By" size="small" fullWidth sx={fieldSx}
                value={header.requestSubmittedBy || ""} onChange={(e) => setHeader((p) => ({ ...p, requestSubmittedBy: e.target.value }))}
              />
            </Box>
            <TextField
              label="Other Remarks" size="small" fullWidth multiline minRows={2} sx={fieldSx}
              value={header.otherRemarks || ""} onChange={(e) => setHeader((p) => ({ ...p, otherRemarks: e.target.value }))}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Competent Authority (Name)" size="small" fullWidth sx={fieldSx}
                value={header.competentAuthorityName || ""}
                onChange={(e) => setHeader((p) => ({ ...p, competentAuthorityName: e.target.value }))}
              />
              <TextField
                label="Issue Place" size="small" fullWidth sx={fieldSx}
                value={header.issuePlace || ""} onChange={(e) => setHeader((p) => ({ ...p, issuePlace: e.target.value }))}
              />
              <TextField
                type="date" label="Issue Date" size="small" fullWidth sx={fieldSx}
                slotProps={{ inputLabel: { shrink: true } }}
                value={header.issueDate?.split("T")[0] || ""}
                onChange={(e) => setHeader((p) => ({ ...p, issueDate: e.target.value || null }))}
              />
            </Box>

            <Typography sx={{ fontWeight: 600, mt: 1 }}>Items</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {lines.map((line, index) => (
                <Box key={index} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <TextField
                    label="Shipping Marks" size="small" sx={{ ...fieldSx, width: 160 }}
                    value={line.shippingMarks} onChange={(e) => handleLineChange(index, "shippingMarks", e.target.value)}
                  />
                  <TextField
                    label="Package Type/Qty" size="small" sx={{ ...fieldSx, width: 140 }}
                    value={line.packageTypeQuantity} onChange={(e) => handleLineChange(index, "packageTypeQuantity", e.target.value)}
                  />
                  <TextField
                    label="Item Name" size="small" sx={{ ...fieldSx, flexGrow: 1 }}
                    value={line.itemName} onChange={(e) => handleLineChange(index, "itemName", e.target.value)}
                  />
                  <TextField
                    label="H.S. Code" size="small" sx={{ ...fieldSx, width: 110 }}
                    value={line.hsCode} onChange={(e) => handleLineChange(index, "hsCode", e.target.value)}
                  />
                  <TextField
                    label="Nett Wt" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 90 }}
                    value={line.nettWeight} onChange={(e) => handleLineChange(index, "nettWeight", Number(e.target.value))}
                  />
                  <TextField
                    label="Gross Wt" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 90 }}
                    value={line.grossWeight} onChange={(e) => handleLineChange(index, "grossWeight", Number(e.target.value))}
                  />
                  <IconButton size="small" color="error" onClick={() => handleDeleteLine(index)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              <Button size="small" onClick={handleAddLine} sx={{ alignSelf: "flex-start" }}>
                + Add Item
              </Button>
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
          <TextField
            select label="Print Format" size="small" sx={{ ...fieldSx, width: 200 }}
            slotProps={modalSelectMenuProps}
            value={printFormat}
            disabled={!existing || isLoadingExisting}
            onChange={(e) => setPrintFormat(e.target.value as CertificateOfOriginPrintFormat)}
          >
            <MenuItem value="full">Full Document</MenuItem>
            <MenuItem value="chamber">Pre-printed - Ceylon Chamber of Commerce</MenuItem>
          </TextField>
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
            <span style={themedButtonLabelStyle}>Save Certificate</span>
          </Button>
        </Box>
      </DialogActions>

      <ConfirmDialog
        open={isDeleteConfirmOpen}
        title="Delete Certificate of Origin"
        message={`Delete the Certificate of Origin for Invoice ${invoiceNumber}? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </Dialog>
  );
};

export default CertificateOfOriginDialog;
