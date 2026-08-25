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

import GoodsTransferNoteLinesGrid from "./goods-transfer-note-lines-grid";
import ConfirmDialog from "../common/confirm-dialog";
import type { GeneralGtnLineItemRow } from "../../interfaces/general-inventory/general-gtn.types";
import type { GeneralStockItemAvailability } from "../../interfaces/general-inventory/general-inventory.types";
import { useCreateGeneralGTNMutation } from "../../tanstack-hooks/general-inventory/general-gtn.hooks";
import { useGetGeneralStoresQuery } from "../../tanstack-hooks/general-inventory/general-inventory-strn.hooks";
import type { AppError } from "../../auth/axiosClient";

// Replicates GI_GGTN1.PRG's "GOODS TRANSFER NOTE (General)" entry screen - an atomic
// stock move between two General stores. Unlike STRN/GIN, there's no reservation or
// department/order scope: just From Stores, To Stores, Date, and the item list.
export default function GoodsTransferNoteWorkspace() {
  const { mutateAsync: commitGTN, isPending: isSubmitting } =
    useCreateGeneralGTNMutation();

  const [fromStore, setFromStore] = useState<string>("");
  const [toStore, setToStore] = useState<string>("");
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  const [lineItems, setLineItems] = useState<GeneralGtnLineItemRow[]>([]);
  const [rowStockBalances, setRowStockBalances] = useState<
    Record<number, GeneralStockItemAvailability>
  >({});

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [commitErrorMessage, setCommitErrorMessage] = useState<string | null>(
    null,
  );

  const { data: storesList = [], isLoading: isStoresLoading } =
    useGetGeneralStoresQuery();

  const isHeaderValid =
    fromStore.trim() !== "" &&
    toStore.trim() !== "" &&
    fromStore !== toStore;

  const hasIncompleteLines = lineItems.some((item) => !item.itemCode.trim());
  const hasAnyPositiveQuantity = lineItems.some((item) => item.quantity > 0);
  const hasAnyExceededBalance = lineItems.some((item, idx) => {
    const balance = rowStockBalances[idx];
    return balance
      ? Number(item.quantity) > balance.netAvailableBalance
      : false;
  });
  const isFormValid =
    isHeaderValid &&
    lineItems.length > 0 &&
    !hasIncompleteLines &&
    hasAnyPositiveQuantity &&
    lineItems.every((item) => item.quantity >= 0) &&
    !hasAnyExceededBalance;

  const handleResetForm = () => {
    setFromStore("");
    setToStore("");
    setLineItems([]);
    setRowStockBalances({});
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
        "Validation Error: Resolve the outstanding line issues (missing items, zero quantities, or over-allocation) before confirming.",
      );
      return;
    }
    setCommitErrorMessage(null);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmCommit = async () => {
    setIsConfirmDialogOpen(false);

    const toastId = toast.loading(
      "Posting Goods Transfer Note, updating stock balances...",
    );

    const payload = {
      header: {
        gtnNumber: "",
        transactionDate,
        fromStoreCode: fromStore,
        toStoreCode: toStore,
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
      const response = await commitGTN(payload);
      toast.update(toastId, {
        render: response.message || "Goods Transfer Note posted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 4000,
        closeButton: true,
      });
      handleResetForm();
    } catch (err) {
      const appError = err as AppError;
      const serverMsg =
        appError?.message || "Failed to post Goods Transfer Note.";
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
          Goods Transfer Note (General Inventory)
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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

          <Grid size={{ xs: 12, sm: 6, md: 4.5 }}>
            <TextField
              select
              label="From Stores"
              size="small"
              fullWidth
              value={fromStore}
              onChange={(e) => setFromStore(e.target.value)}
              disabled={isStoresLoading}
            >
              {storesList.map((s) => (
                <MenuItem key={s.code} value={s.code} disabled={s.code === toStore}>
                  {s.description} [{s.code}]
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
              value={toStore}
              onChange={(e) => setToStore(e.target.value)}
              disabled={isStoresLoading}
            >
              {storesList.map((s) => (
                <MenuItem key={s.code} value={s.code} disabled={s.code === fromStore}>
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
            sx={{ m: 2, fontWeight: "bold" }}
          >
            Select a Transaction Date, and two different From/To Stores to start
            the transfer list.
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
                sx={{ fontWeight: "bold", textTransform: "uppercase" }}
              >
                Transfer Items
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

            <GoodsTransferNoteLinesGrid
              fromStoreCode={fromStore}
              lineItems={lineItems}
              setLineItems={setLineItems}
              rowStockBalances={rowStockBalances}
              setRowStockBalances={setRowStockBalances}
            />
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
            Post Transfer Note
          </Button>
        </Box>
      </Paper>

      <ConfirmDialog
        open={isConfirmDialogOpen}
        title="Confirm Goods Transfer Note"
        message="Confirm all entries and post this Goods Transfer Note? This moves stock between the two General stores immediately."
        confirmLabel="Confirm & Post"
        confirmColor="primary"
        isConfirming={isSubmitting}
        onConfirm={handleConfirmCommit}
        onCancel={() => setIsConfirmDialogOpen(false)}
      />
    </Box>
  );
}
