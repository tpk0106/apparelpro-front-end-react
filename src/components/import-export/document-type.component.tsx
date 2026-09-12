import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import { toast } from "react-toastify";
import { DASHBOARD_COLORS } from "../dashboard/dashboard-theme";
import { primaryActionButtonSx, themedButtonLabelStyle } from "../../themes/workspace-theme";
import { useDropdownTheme } from "../../themes/useDropdownTheme";
import {
  useGetDocumentTypes,
  useSaveDocumentType,
  useDeleteDocumentType,
} from "../../tanstack-hooks/import-export/document-type.hooks";
import type { DocumentType } from "../../interfaces/import-export/ImportExport";
import ConfirmDialog from "../common/confirm-dialog";

type DocumentTypeFormValues = Omit<DocumentType, "id"> & { id?: number };

const EMPTY_FORM: DocumentTypeFormValues = { docNo: "", docTypeCode: "", description: "" };

// DocumentType is the one CUSDEC reference master keyed by an auto Id instead
// of Code - composite-unique on (DocNo, DocTypeCode) - so Doc No/Doc Type
// stay editable even when editing an existing row (unlike the Code-keyed
// masters, where Code is locked once editing).
const DocumentTypePage = () => {
  const { fieldSx } = useDropdownTheme();
  const { data: documentTypes, isLoading } = useGetDocumentTypes();
  const saveMutation = useSaveDocumentType();
  const deleteMutation = useDeleteDocumentType();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<DocumentTypeFormValues>(EMPTY_FORM);
  const [toDelete, setToDelete] = useState<DocumentType | null>(null);

  const handleChange = (field: keyof DocumentTypeFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEditForm = (row: DocumentType) => {
    setForm({ ...row });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!form.docNo.trim() || !form.docTypeCode.trim() || !form.description.trim()) {
      toast.error("Doc No, Doc Type and Description are required.");
      return;
    }
    const { id, ...payload } = form;
    saveMutation.mutate(
      { payload, id, isNew: !id },
      {
        onSuccess: () => {
          toast.success("Document Type saved.");
          setIsFormOpen(false);
        },
        onError: (error) => toast.error(error.message || "Failed to save Document Type."),
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    deleteMutation.mutate(toDelete.id, {
      onSuccess: () => {
        toast.success("Document Type deleted.");
        setToDelete(null);
      },
      onError: (error) => toast.error(error.message || "Failed to delete Document Type."),
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 820, mx: "auto", py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 18, color: DASHBOARD_COLORS.accentStrong }}>
          Document Type
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} sx={primaryActionButtonSx} onClick={openAddForm}>
          <span style={themedButtonLabelStyle}>Add Document Type</span>
        </Button>
      </Box>

      <Box
        sx={{
          width: "100%",
          borderRadius: "14px",
          border: "1px solid rgba(139, 147, 161, 0.15)",
          overflow: "hidden",
        }}
      >
        {(documentTypes ?? []).map((row) => (
          <Box
            key={row.id}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              py: 1.75,
              px: 2.5,
              borderBottom: "1px solid rgba(139, 147, 161, 0.15)",
              "&:last-of-type": { borderBottom: "none" },
            }}
          >
            <Box>
              <Typography sx={{ fontSize: "13.5px", fontWeight: 500, color: "#ffffff" }}>
                {row.docNo} / {row.docTypeCode}
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "text.secondary" }}>{row.description}</Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => openEditForm(row)}>
                  <ModeEditOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" onClick={() => setToDelete(row)}>
                  <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ))}

        {documentTypes && documentTypes.length === 0 && (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
              No Document Types yet. Add one above.
            </Typography>
          </Box>
        )}
      </Box>

      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { backgroundColor: "#141922" } } }}
      >
        <DialogTitle sx={{ color: "#F4F6F8" }}>
          {form.id ? "Edit Document Type" : "Add Document Type"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Doc No"
                size="small"
                fullWidth
                sx={fieldSx}
                value={form.docNo}
                onChange={handleChange("docNo")}
                slotProps={{ htmlInput: { maxLength: 3 } }}
              />
              <TextField
                label="Doc Type"
                size="small"
                fullWidth
                sx={fieldSx}
                value={form.docTypeCode}
                onChange={handleChange("docTypeCode")}
                slotProps={{ htmlInput: { maxLength: 25 } }}
              />
            </Box>
            <TextField
              label="Description"
              size="small"
              fullWidth
              sx={fieldSx}
              value={form.description}
              onChange={handleChange("description")}
              slotProps={{ htmlInput: { maxLength: 40 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setIsFormOpen(false)}>Cancel</Button>
          <Button variant="contained" sx={primaryActionButtonSx} onClick={handleSave} disabled={saveMutation.isPending}>
            <span style={themedButtonLabelStyle}>Save Document Type</span>
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete Document Type"
        message={`Delete "${toDelete?.docNo} / ${toDelete?.docTypeCode} - ${toDelete?.description}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </Box>
  );
};

export default DocumentTypePage;
