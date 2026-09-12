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
  useGetClearanceOffices,
  useSaveClearanceOffice,
  useDeleteClearanceOffice,
} from "../../tanstack-hooks/import-export/clearance-office.hooks";
import type { ClearanceOffice } from "../../interfaces/import-export/ImportExport";
import ConfirmDialog from "../common/confirm-dialog";

const EMPTY_FORM: ClearanceOffice = { code: "", description: "" };

// Same master table used for both "Clearance Office" and "Frontier Office" on
// the CUSDEC form - single admin screen here, both CUSDEC fields look this
// table up by code.
const ClearanceOfficePage = () => {
  const { fieldSx } = useDropdownTheme();
  const { data: clearanceOffices, isLoading } = useGetClearanceOffices();
  const saveMutation = useSaveClearanceOffice();
  const deleteMutation = useDeleteClearanceOffice();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ClearanceOffice>(EMPTY_FORM);
  const [toDelete, setToDelete] = useState<ClearanceOffice | null>(null);

  const handleChange = (field: keyof ClearanceOffice) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const openEditForm = (row: ClearanceOffice) => {
    setForm({ ...row });
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!form.code.trim() || !form.description.trim()) {
      toast.error("Code and Description are required.");
      return;
    }
    saveMutation.mutate(
      { payload: form, isNew: !isEditing },
      {
        onSuccess: () => {
          toast.success("Clearance / Frontier Office saved.");
          setIsFormOpen(false);
        },
        onError: (error) => toast.error(error.message || "Failed to save Clearance / Frontier Office."),
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    deleteMutation.mutate(toDelete.code, {
      onSuccess: () => {
        toast.success("Clearance / Frontier Office deleted.");
        setToDelete(null);
      },
      onError: (error) => toast.error(error.message || "Failed to delete Clearance / Frontier Office."),
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
          Clearance / Frontier Office
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} sx={primaryActionButtonSx} onClick={openAddForm}>
          <span style={themedButtonLabelStyle}>Add Office</span>
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
        {(clearanceOffices ?? []).map((row) => (
          <Box
            key={row.code}
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
                {row.code}
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

        {clearanceOffices && clearanceOffices.length === 0 && (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
              No Clearance / Frontier Offices yet. Add one above.
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
          {isEditing ? "Edit Clearance / Frontier Office" : "Add Clearance / Frontier Office"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Code"
              size="small"
              fullWidth
              sx={fieldSx}
              value={form.code}
              onChange={handleChange("code")}
              disabled={isEditing}
              slotProps={{ htmlInput: { maxLength: 4 } }}
            />
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
            <span style={themedButtonLabelStyle}>Save Clearance / Frontier Office</span>
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete Clearance / Frontier Office"
        message={`Delete "${toDelete?.code} - ${toDelete?.description}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </Box>
  );
};

export default ClearanceOfficePage;
