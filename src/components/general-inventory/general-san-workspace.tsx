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

import GeneralSanLinesGrid from "./general-san-lines-grid";
import ConfirmDialog from "../common/confirm-dialog";
import type { GeneralSanLineItemRow } from "../../interfaces/general-inventory/general-san.types";
import { useCreateGeneralSANMutation } from "../../tanstack-hooks/general-inventory/general-san.hooks";
import { useGetGeneralStoresQuery } from "../../tanstack-hooks/general-inventory/general-inventory-strn.hooks";
import type { AppError } from "../../auth/axiosClient";

// Replicates GI_SAN1.PRG's "STOCK ADJUSTMENT NOTE (General)" entry screen - a physical
// stock-take correction that SETS QtyInHand to the entered quantity, not an add/subtract
// delta. No balance ceiling to validate client-side (any non-negative count is valid).
export default function GeneralSanWorkspace() {
  const { mutateAsync: commitSAN, isPending: isSubmitting } =
    useCreateGeneralSANMutation();

  const [selectedStore, setSelectedStore] = useState<string>("");
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  const [lineItems, setLineItems] = useState<GeneralSanLineItemRow[]>([]);

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [commitErrorMessage, setCommitErrorMessage] = useState<string | null>(null);

  const { data: storesList = [], isLoading: isStoresLoading } = useGetGeneralStoresQuery();

  const isHeaderValid = selectedStore.trim() !== "";

  const hasIncompleteLines = lineItems.some(
    (item) => !item.itemCode.trim() || !item.currencyCode.trim(),
  );
  const hasAnyValidLine = lineItems.some((item) => item.price > 0);
  const isFormValid =
    isHeaderValid &&
    lineItems.length > 0 &&
    !hasIncompleteLines &&
    hasAnyValidLine &&
    lineItems.every((item) => item.quantity >= 0 && (item.price > 0 || item.price === 0));

  const handleResetForm = () => {
    setSelectedStore("");
    setLineItems([]);
    setTransactionDate(new Date().toISOString().split("T")[0]);
    setCommitErrorMessage(null);
  };

  const handleAddBlankRow = () => {
    setLineItems((prev) => [
      ...prev,
      { itemCode: "", unit: "PCS", quantity: 0, price: 0, currencyCode: "" },
    ]);
  };

  const handleRequestCommit = () => {
    if (!isFormValid) {
      toast.warning(
        "Validation Error: Every line needs an Item, Currency and a Price greater than zero before confirming.",
      );
      return;
    }
    setCommitErrorMessage(null);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmCommit = async () => {
    setIsConfirmDialogOpen(false);

    const toastId = toast.loading("Posting Stock Adjustment Note, updating stock balances...");

    const payload = {
      header: {
        sanNumber: "",
        transactionDate,
        storeCode: selectedStore,
      },
      lines: lineItems
        .filter((item) => item.price > 0)
        .map((item) => ({
          itemCode: item.itemCode,
          unit: item.unit,
          quantity: item.quantity,
          price: item.price,
          currencyCode: item.currencyCode,
        })),
    };

    try {
      const response = await commitSAN(payload);
      toast.update(toastId, {
        render: response.message || "Stock Adjustment Note posted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 4000,
        closeButton: true,
      });
      handleResetForm();
    } catch (err) {
      const appError = err as AppError;
      const serverMsg = appError?.message || "Failed to post Stock Adjustment Note.";
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
    <Box sx={{ width: "100%", p: 1 }}>
      <Paper elevation={3} sx={{ p: 3, borderTop: "4px solid #60a5fa", backgroundColor: "#fafafa" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3, textAlign: "center" }}>
          Stock Adjustment Note (General Inventory)
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              type="date"
              label="Transaction Date"
              size="small"
              fullWidth
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              select
              label="Stores"
              size="small"
              fullWidth
              value={selectedStore}
              onChange={(e) => {
                setSelectedStore(e.target.value);
                setLineItems([]);
              }}
              disabled={isStoresLoading}
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
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setCommitErrorMessage(null)}>
            {commitErrorMessage}
          </Alert>
        )}

        {!isHeaderValid ? (
          <Alert severity="info" variant="outlined" sx={{ m: 2, fontWeight: "bold" }}>
            Select a Transaction Date and Stores to start the adjustment list.
          </Alert>
        ) : (
          <Box>
            <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
                Adjusted Items
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<AddCircleOutlined />}
                onClick={handleAddBlankRow}
              >
                Add Item
              </Button>
            </Box>

            <GeneralSanLinesGrid storeCode={selectedStore} lineItems={lineItems} setLineItems={setLineItems} />
          </Box>
        )}

        <Box
          sx={{
            gap: 2,
            mt: 3,
            pt: 2,
            borderTop: "1px dashed #ccc",
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
          >
            Post Adjustment Note
          </Button>
        </Box>
      </Paper>

      <ConfirmDialog
        open={isConfirmDialogOpen}
        title="Confirm Stock Adjustment Note"
        message="Confirm all entries and post this Stock Adjustment Note? This sets each item's stock count to the entered quantity."
        confirmLabel="Confirm & Post"
        confirmColor="primary"
        isConfirming={isSubmitting}
        onConfirm={handleConfirmCommit}
        onCancel={() => setIsConfirmDialogOpen(false)}
      />
    </Box>
  );
}
