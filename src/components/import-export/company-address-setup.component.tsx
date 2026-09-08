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
  useGetCompanyAddresses,
  useSaveCompanyAddress,
  useDeleteCompanyAddress,
} from "../../tanstack-hooks/import-export/company-address-setup.hooks";
import type { CompanyAddress } from "../../interfaces/import-export/ImportExport";
import ConfirmDialog from "../common/confirm-dialog";

type CompanyAddressFormValues = Omit<CompanyAddress, "id" | "addressNo"> & { id?: number };

const EMPTY_FORM: CompanyAddressFormValues = {
  companyName: "",
  address1: "",
  address2: "",
  city: "",
  postCode: "",
  country: "",
  telNos: "",
  faxNos: "",
  tinNo: "",
  exportRegNo: "",
};

// Legacy ie_setup holds multiple numbered addresses (confirmed against
// production data - 3 real, distinct records), not one - so this is a plain
// add/edit/delete list, not a single-record form.
const CompanyAddressSetupPage = () => {
  const { fieldSx } = useDropdownTheme();
  const { data: addresses, isLoading } = useGetCompanyAddresses();
  const saveMutation = useSaveCompanyAddress();
  const deleteMutation = useDeleteCompanyAddress();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<CompanyAddressFormValues>(EMPTY_FORM);
  const [addressToDelete, setAddressToDelete] = useState<CompanyAddress | null>(null);

  const handleChange = (field: keyof CompanyAddressFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEditForm = (address: CompanyAddress) => {
    setForm({ ...address });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    saveMutation.mutate(form, {
      onSuccess: () => {
        toast.success("Company address saved.");
        setIsFormOpen(false);
      },
      onError: (error) => toast.error(error.message || "Failed to save company address."),
    });
  };

  const handleConfirmDelete = () => {
    if (!addressToDelete) return;
    deleteMutation.mutate(addressToDelete.id, {
      onSuccess: () => {
        toast.success("Company address deleted.");
        setAddressToDelete(null);
      },
      onError: (error) => toast.error(error.message || "Failed to delete company address."),
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
          Company Address Setup
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={primaryActionButtonSx}
          onClick={openAddForm}
        >
          <span style={themedButtonLabelStyle}>Add Address</span>
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
        {(addresses ?? []).map((address) => (
          <Box
            key={address.id}
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
                {address.addressNo}. {address.companyName}
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "text.secondary" }}>
                {[address.address1, address.address2, address.city, address.postCode, address.country]
                  .filter(Boolean)
                  .join(", ")}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => openEditForm(address)}>
                  <ModeEditOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" onClick={() => setAddressToDelete(address)}>
                  <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ))}

        {addresses && addresses.length === 0 && (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
              No company addresses yet. Add one above.
            </Typography>
          </Box>
        )}
      </Box>

      <Dialog open={isFormOpen} onClose={() => setIsFormOpen(false)} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { backgroundColor: "#141922" } } }}>
        <DialogTitle sx={{ color: "#F4F6F8" }}>
          {form.id ? "Edit Company Address" : "Add Company Address"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Company Name" size="small" fullWidth sx={fieldSx}
              value={form.companyName} onChange={handleChange("companyName")} />
            <TextField label="Address 1" size="small" fullWidth sx={fieldSx}
              value={form.address1} onChange={handleChange("address1")} />
            <TextField label="Address 2" size="small" fullWidth sx={fieldSx}
              value={form.address2} onChange={handleChange("address2")} />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField label="City" size="small" fullWidth sx={fieldSx}
                value={form.city} onChange={handleChange("city")} />
              <TextField label="Post Code" size="small" fullWidth sx={fieldSx}
                value={form.postCode} onChange={handleChange("postCode")} />
              <TextField label="Country" size="small" fullWidth sx={fieldSx}
                value={form.country} onChange={handleChange("country")} />
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField label="Tel Nos." size="small" fullWidth sx={fieldSx}
                value={form.telNos} onChange={handleChange("telNos")} />
              <TextField label="Fax Nos." size="small" fullWidth sx={fieldSx}
                value={form.faxNos} onChange={handleChange("faxNos")} />
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField label="TIN No." size="small" fullWidth sx={fieldSx}
                value={form.tinNo} onChange={handleChange("tinNo")} />
              <TextField label="Exp. Reg. No." size="small" fullWidth sx={fieldSx}
                value={form.exportRegNo} onChange={handleChange("exportRegNo")} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setIsFormOpen(false)}>Cancel</Button>
          <Button variant="contained" sx={primaryActionButtonSx} onClick={handleSave} disabled={saveMutation.isPending}>
            <span style={themedButtonLabelStyle}>Save Address</span>
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!addressToDelete}
        title="Delete Company Address"
        message={`Delete the address for "${addressToDelete?.companyName}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setAddressToDelete(null)}
      />
    </Box>
  );
};

export default CompanyAddressSetupPage;
