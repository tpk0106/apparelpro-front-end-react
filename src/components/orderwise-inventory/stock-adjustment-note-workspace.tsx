import { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Alert,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";

import StockAdjustmentNoteLinesGrid from "./stock-adjustment-note-lines-grid";
import ConfirmDialog from "../common/confirm-dialog";
import type {
  SanLineItemRow,
  SanSubmissionPayload,
} from "./stock-adjustment-note.types";
import {
  useGetAdjustableStockByBuyerOrderQuery,
  useCommitSanMutation,
} from "../../tanstack-hooks/stock-adjustment-note.hooks";
import {
  useGetBuyersQuery,
  useGetAllPurchaseOrdersByBuyerCode,
} from "../../tanstack-hooks/custom-hooks";
import type { Buyer } from "../../interfaces/references/Buyer";
import type { AppError } from "../../auth/axiosClient";

export default function StockAdjustmentNoteWorkspace() {
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [lines, setLines] = useState<SanLineItemRow[]>([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [commitErrorMessage, setCommitErrorMessage] = useState<string | null>(
    null,
  );

  const { data: buyerPageData, isLoading: isBuyersLoading } = useGetBuyersQuery(
    {
      pageIndex: 0,
      pageSize: 999,
      sortColumn: "name",
      sortOrder: "asc",
      filterColumn: null,
      filterQuery: null,
    },
  );
  const buyersList = useMemo<Buyer[]>(
    () => buyerPageData?.items ?? [],
    [buyerPageData],
  );

  const { data: ordersList = [], isLoading: isOrdersLoading } =
    useGetAllPurchaseOrdersByBuyerCode(
      selectedBuyer?.buyerCode ?? 0,
      !!selectedBuyer,
    );

  const {
    data: adjustableStock,
    isFetching: isStockLoading,
    error: stockLookupError,
  } = useGetAdjustableStockByBuyerOrderQuery(
    { buyerCode: selectedBuyer?.buyerCode ?? 0, order: selectedOrder },
    !!selectedBuyer && !!selectedOrder,
  );

  const { mutateAsync: commitSan, isPending: isSubmitting } =
    useCommitSanMutation();

  const isHeaderReady = !!selectedBuyer && !!selectedOrder && !!adjustableStock;

  // Populate the grid the instant a lookup succeeds, defaulting the editable Adjusted
  // Qty to the current on-hand quantity (unlike DGN/SRN/RTN, which default to 0 or the
  // full returnable balance) — SAN is a stock-take correction, so the operator should
  // only need to type over the handful of rows that are actually wrong. Adjusts state
  // during render itself, matching the established GTN/RTN/SRN/DGN convention.
  const [syncedAdjustableStock, setSyncedAdjustableStock] =
    useState(adjustableStock);
  if (adjustableStock !== syncedAdjustableStock) {
    setSyncedAdjustableStock(adjustableStock);
    setLines(
      adjustableStock
        ? adjustableStock.map((s) => ({
            storeCode: s.storeCode,
            itemCode: s.itemCode,
            unit: s.unit,
            description: s.description,
            qtyInHand: s.qtyInHand,
            adjustedQuantity: s.qtyInHand,
          }))
        : [],
    );
  }

  // Only rows the operator actually changed are ever submitted — leaving a row at its
  // default (Adjusted Qty === Current Qty) means "this count was already correct."
  const changedLines = useMemo(
    () => lines.filter((l) => l.adjustedQuantity !== l.qtyInHand),
    [lines],
  );

  const hasNegativeValue = lines.some((l) => l.adjustedQuantity < 0);

  // SAN has no ceiling of any kind (per product decision: >= 0 is the only rule, no
  // extra safety-rail warning) — the only requirements are a valid header, at least
  // one line actually changed, and nothing negative.
  const isFormValid =
    isHeaderReady &&
    lines.length > 0 &&
    changedLines.length > 0 &&
    !hasNegativeValue;

  const handleBuyerChange = (buyerCode: string) => {
    const buyer =
      buyersList.find((b) => String(b.buyerCode) === buyerCode) ?? null;
    setSelectedBuyer(buyer);
    setSelectedOrder("");
    setLines([]);
    setCommitErrorMessage(null);
  };

  const handleOrderChange = (order: string) => {
    setSelectedOrder(order);
    setLines([]);
    setCommitErrorMessage(null);
  };

  const handleReset = () => {
    setSelectedBuyer(null);
    setSelectedOrder("");
    setLines([]);
    setTransactionDate(new Date().toISOString().split("T")[0]);
    setCommitErrorMessage(null);
  };

  const handleRequestCommit = () => {
    if (!adjustableStock) return;
    setCommitErrorMessage(null);

    if (!isFormValid) {
      toast.warning(
        "Resolve the outstanding validation issues before confirming.",
      );
      return;
    }
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmCommit = async () => {
    setIsConfirmDialogOpen(false);
    if (!selectedBuyer) return;

    const payload: SanSubmissionPayload = {
      header: {
        buyerCode: selectedBuyer.buyerCode,
        order: selectedOrder,
        transactionDate,
      },
      lines: changedLines.map((l) => ({
        storeCode: l.storeCode,
        itemCode: l.itemCode,
        unit: l.unit,
        adjustedQuantity: l.adjustedQuantity,
      })),
    };

    const toastId = toast.loading(
      "Posting Stock Adjustment Note, updating stock balances...",
    );
    try {
      const response = await commitSan(payload);
      toast.update(toastId, {
        render:
          response.message ||
          `✓ Stock Adjustment Note ${response.sanNumber} posted successfully!`,
        type: "success",
        isLoading: false,
        autoClose: 4000,
        closeButton: true,
      });
      handleReset();
    } catch (err) {
      const appError = err as AppError;
      const message =
        appError?.message ?? "Failed to post Stock Adjustment Note.";
      // Inline, persistent error — not just a transient toast — per project
      // convention: all errors must be displayed inline, no native alert box.
      setCommitErrorMessage(message);
      toast.update(toastId, {
        render: `🛑 ${message}`,
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });
    }
  };

  return (
    <Box sx={{ width: "100%", p: 1 }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderTop: "4px solid #60a5fa",
          backgroundColor: "#f9f9f9",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
          Stock Adjustment Note (SAN)
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 3, color: "#000000" }}
        >
          SAN Number is allocated by the server on commit — it is never entered
          manually. Adjusted Qty defaults to the current quantity on hand for
          every item; enter the true physical count only where it differs. This
          directly overwrites the recorded stock count — only rows you change
          are submitted.
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              select
              label="Buyer"
              size="small"
              fullWidth
              value={selectedBuyer ? String(selectedBuyer.buyerCode) : ""}
              onChange={(e) => handleBuyerChange(e.target.value)}
              disabled={isBuyersLoading}
            >
              {buyersList.map((b) => (
                <MenuItem key={b.buyerCode} value={String(b.buyerCode)}>
                  {b.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              select
              label="Order"
              size="small"
              fullWidth
              value={selectedOrder}
              onChange={(e) => handleOrderChange(e.target.value)}
              disabled={!selectedBuyer || isOrdersLoading}
            >
              {ordersList.map((orderStr) => (
                <MenuItem key={orderStr} value={orderStr}>
                  {orderStr}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              type="date"
              label="Adjustment Date"
              size="small"
              fullWidth
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {stockLookupError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {stockLookupError.message}
          </Alert>
        )}

        {commitErrorMessage && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setCommitErrorMessage(null)}
          >
            {commitErrorMessage}
          </Alert>
        )}

        {!isHeaderReady ? (
          <Alert
            severity="info"
            variant="outlined"
            sx={{ m: 2, fontWeight: "bold", color: "#1a237e" }}
          >
            Select a Buyer and Order to load items currently in stock that can
            be adjusted.
          </Alert>
        ) : adjustableStock.length === 0 ? (
          <Alert
            severity="info"
            variant="outlined"
            sx={{ m: 2, fontWeight: "bold", color: "#1a237e" }}
          >
            Nothing is currently on hand for this Buyer/Order to adjust.
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
                Adjustable Stock Lines
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {lines.length} line(s) loaded for Order {selectedOrder} —{" "}
                {changedLines.length} changed
              </Typography>
            </Box>

            <StockAdjustmentNoteLinesGrid lines={lines} setLines={setLines} />

            <Box
              sx={{
                gap: 2,
                mt: 3,
                pt: 2,
                borderTop: "1px dashed rgba(139,147,161,0.3)",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={handleReset}
                disabled={isSubmitting}
                sx={{
                  minWidth: 190,
                  height: 32,
                  color: "#8B93A1",
                  borderColor: "#8B93A1",
                  boxShadow: (theme) => theme.shadows[2],
                  "&:hover": {
                    borderColor: "#8B93A1",
                    color: "#000000 !important",
                    backgroundColor: "rgba(139,147,161,0.15)",
                    boxShadow: (theme) => theme.shadows[4],
                  },
                  "&.Mui-disabled": {
                    color: "#8B93A1",
                    opacity: 0.5,
                    borderColor: "rgba(139,147,161,0.3)",
                    boxShadow: "none",
                  },
                }}
              >
                Cancel SAN
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<SendIcon />}
                onClick={handleRequestCommit}
                disabled={isSubmitting || !isFormValid || isStockLoading}
                sx={{
                  minWidth: 190,
                  height: 32,
                  "&.Mui-disabled": {
                    backgroundColor: "rgba(139,147,161,0.15)",
                    color: "#8B93A1",
                    border: "1px solid rgba(139,147,161,0.4)",
                  },
                }}
              >
                Confirm All Entries
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      <ConfirmDialog
        open={isConfirmDialogOpen}
        title="Confirm Stock Adjustment Note"
        message={<>
            Confirm all entries and post this Stock Adjustment Note? This
            directly overwrites the recorded stock count for{" "}
            {changedLines.length} item(s) for Buyer {selectedBuyer?.name} /
            Order {selectedOrder}.
          </>}
        confirmLabel="Confirm & Post"
        confirmColor="primary"
        isConfirming={isSubmitting}
        onConfirm={handleConfirmCommit}
        onCancel={() => setIsConfirmDialogOpen(false)}
      />
    </Box>
  );
}
