import { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  MenuItem,
  Alert,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { AddCircleOutlined } from "@mui/icons-material";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";

import GoodsReturnNoteLinesGrid from "./goods-return-note-lines-grid";
import ConfirmDialog from "../common/confirm-dialog";
import type { GeneralRtnLineItemRow } from "../../interfaces/general-inventory/general-rtn.types";
import { useCreateGeneralRTNMutation } from "../../tanstack-hooks/general-inventory/general-rtn.hooks";
import { useGetGeneralStoresQuery } from "../../tanstack-hooks/general-inventory/general-inventory-strn.hooks";
import { useGetAllDepartmentsQuery } from "../../tanstack-hooks/common.hooks";
import type { AppError } from "../../auth/axiosClient";
import { DASHBOARD_COLORS } from "../dashboard/dashboard-theme";
import { useDropdownTheme } from "../../themes/useDropdownTheme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  workspaceHeadingSx,
  workspaceSectionLabelSx,
  dateIconFieldSx,
} from "../../themes/workspace-theme";

// Replicates GI_RTN1.PRG's "GOODS RETURN NOTE (General)" entry screen - material
// returning from a Department back into a General store. The reverse of GIN, but not
// linked back to the originating GIN (legacy doesn't track that link either).
export default function GoodsReturnNoteWorkspace() {
  const { fieldSx: dropdownFieldSx, listboxSx: dropdownListboxSx } = useDropdownTheme();
  const dropdownMenuSlotProps = { select: { MenuProps: { slotProps: { paper: { sx: dropdownListboxSx } } } } };
  const { mutateAsync: commitRTN, isPending: isSubmitting } =
    useCreateGeneralRTNMutation();

  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  const [lineItems, setLineItems] = useState<GeneralRtnLineItemRow[]>([]);

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [commitErrorMessage, setCommitErrorMessage] = useState<string | null>(
    null,
  );

  const { data: storesList = [], isLoading: isStoresLoading } =
    useGetGeneralStoresQuery();
  const { data: dbDepartments = [], isLoading: isDeptsLoading } =
    useGetAllDepartmentsQuery();

  const isHeaderValid =
    selectedDept.trim() !== "" && selectedStore.trim() !== "";

  const hasIncompleteLines = lineItems.some((item) => !item.itemCode.trim());
  const hasAnyPositiveQuantity = lineItems.some((item) => item.quantity > 0);
  const isFormValid =
    isHeaderValid &&
    lineItems.length > 0 &&
    !hasIncompleteLines &&
    hasAnyPositiveQuantity &&
    lineItems.every((item) => item.quantity >= 0);

  const handleResetForm = () => {
    setSelectedDept("");
    setSelectedStore("");
    setLineItems([]);
    setTransactionDate(new Date().toISOString().split("T")[0]);
    setCommitErrorMessage(null);
  };

  const handleAddBlankRow = () => {
    setLineItems((prev) => [
      ...prev,
      { itemCode: "", unit: "PCS", quantity: 0 },
    ]);
  };

  const handleRequestCommit = () => {
    if (!isFormValid) {
      toast.warning(
        "Validation Error: Resolve the outstanding line issues (missing items or zero quantities) before confirming.",
      );
      return;
    }
    setCommitErrorMessage(null);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmCommit = async () => {
    setIsConfirmDialogOpen(false);

    const toastId = toast.loading(
      "Posting Goods Return Note, updating stock balances...",
    );

    const payload = {
      header: {
        rtnNumber: "",
        transactionDate,
        departmentCode: selectedDept,
        storeCode: selectedStore,
      },
      lines: lineItems
        .filter((item) => item.quantity > 0)
        .map((item) => ({
          itemCode: item.itemCode,
          unit: item.unit,
          quantity: item.quantity,
        })),
    };

    try {
      const response = await commitRTN(payload);
      toast.update(toastId, {
        render: response.message || "Goods Return Note posted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 4000,
        closeButton: true,
      });
      handleResetForm();
    } catch (err) {
      const appError = err as AppError;
      const serverMsg =
        appError?.message || "Failed to post Goods Return Note.";
      setCommitErrorMessage(serverMsg);
      toast.update(toastId, {
        render: serverMsg,
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });
    }
  };

  return (
    <Box sx={{ width: "100%", py: 1, px: 3 }}>
      <Paper elevation={3} sx={{ p: 3, backgroundColor: DASHBOARD_COLORS.pageBg }}>
        <Typography variant="h5" sx={{ ...workspaceHeadingSx, mb: 3 }}>
          Goods Return Note (General Inventory)
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
            <TextField
              type="date"
              label="Transaction Date"
              size="small"
              fullWidth
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ ...dropdownFieldSx, ...(dateIconFieldSx as Record<string, unknown>) }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              select
              label="From Department"
              size="small"
              fullWidth
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              disabled={isDeptsLoading}
              sx={dropdownFieldSx}
              slotProps={dropdownMenuSlotProps}
            >
              {dbDepartments.map((dept) => (
                <MenuItem key={dept.departmentCode} value={dept.departmentCode}>
                  {dept.name} [{dept.departmentCode}]
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4.5 }}>
            <TextField
              select
              label="To Stores"
              size="small"
              fullWidth
              value={selectedStore}
              onChange={(e) => {
                setSelectedStore(e.target.value);
                setLineItems([]);
              }}
              disabled={isStoresLoading}
              sx={dropdownFieldSx}
              slotProps={dropdownMenuSlotProps}
            >
              {storesList.map((s) => (
                <MenuItem key={s.code} value={s.code}>
                  {s.description} [{s.code}]
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {commitErrorMessage && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setCommitErrorMessage(null)}
          >
            {commitErrorMessage}
          </Alert>
        )}

        {!isHeaderValid ? (
          <Alert
            severity="info"
            variant="outlined"
            sx={{ m: 2, fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}
          >
            Select a Transaction Date, Department and Stores to start the
            return list.
          </Alert>
        ) : (
          <Box>
            <Box
              sx={{
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={workspaceSectionLabelSx}
              >
                Returned Items
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<AddCircleOutlined />}
                onClick={handleAddBlankRow}
                sx={primaryActionButtonSx}
              >
                <span style={themedButtonLabelStyle}>Add Item</span>
              </Button>
            </Box>

            <GoodsReturnNoteLinesGrid
              storeCode={selectedStore}
              lineItems={lineItems}
              setLineItems={setLineItems}
            />
          </Box>
        )}

        <Box
          sx={{
            gap: 2,
            mt: 3,
            pt: 2,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={handleResetForm}
            disabled={isSubmitting}
            sx={{ minWidth: 190, height: 32, color: "#8B93A1", borderColor: "#8B93A1" }}
          >
            Cancel Note
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<SendIcon />}
            onClick={handleRequestCommit}
            disabled={isSubmitting || !isFormValid}
            sx={{
              ...primaryActionButtonSx,
              minWidth: 190,
              height: 32,
              "&.Mui-disabled": {
                background: "rgba(139,147,161,0.15)",
                color: "#8B93A1",
                border: "1px solid rgba(139,147,161,0.4)",
                boxShadow: "none",
              },
            }}
          >
            <span style={themedButtonLabelStyle}>Save</span>
          </Button>
        </Box>
      </Paper>

      <ConfirmDialog
        open={isConfirmDialogOpen}
        title="Confirm Goods Return Note"
        message="Confirm all entries and post this Goods Return Note? This increases physical stock at the selected Store."
        confirmLabel="Confirm & Post"
        confirmColor="primary"
        isConfirming={isSubmitting}
        onConfirm={handleConfirmCommit}
        onCancel={() => setIsConfirmDialogOpen(false)}
      />
    </Box>
  );
}
