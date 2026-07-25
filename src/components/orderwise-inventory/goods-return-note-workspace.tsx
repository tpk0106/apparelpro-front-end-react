import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SendIcon from "@mui/icons-material/Send";
import { toast } from "react-toastify";

import GoodsReturnNoteLinesGrid from "./goods-return-note-lines-grid";
import type {
  RtnLineItemRow,
  RtnSubmissionPayload,
} from "./goods-return-note.types";
import {
  useGetReturnableStockByBuyerOrderQuery,
  useCommitRtnMutation,
} from "../../tanstack-hooks/goods-return-note.hooks";
import {
  useGetBuyersQuery,
  useGetAllPurchaseOrdersByBuyerCode,
} from "../../tanstack-hooks/custom-hooks";
import type { Buyer } from "../../interfaces/references/Buyer";
import type { AppError } from "../../auth/axiosClient";

export default function GoodsReturnNoteWorkspace() {
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [lines, setLines] = useState<RtnLineItemRow[]>([]);
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
    data: returnableStock,
    isFetching: isStockLoading,
    error: stockLookupError,
  } = useGetReturnableStockByBuyerOrderQuery(
    { buyerCode: selectedBuyer?.buyerCode ?? 0, order: selectedOrder },
    !!selectedBuyer && !!selectedOrder,
  );

  const { mutateAsync: commitRtn, isPending: isSubmitting } =
    useCommitRtnMutation();

  const isHeaderReady = !!selectedBuyer && !!selectedOrder && !!returnableStock;

  useEffect(() => {
    if (returnableStock) {
      setLines(
        returnableStock.map((s) => ({
          storeCode: s.storeCode,
          itemCode: s.itemCode,
          unit: s.unit,
          quantity: s.maxReturnableQuantity,
          description: s.description,
          qtyInHand: s.qtyInHand,
          maxReturnableQuantity: s.maxReturnableQuantity,
        })),
      );
    }
  }, [returnableStock]);

  const hasOverReturnableLine = lines.some(
    (l) => l.quantity > l.maxReturnableQuantity,
  );
  // A line at quantity 0 means "don't return this item" — it's a valid, deliberate
  // skip, not an error. The server also rejects any submitted line with quantity <= 0
  // (CommitGoodsReturnNoteAsync), so 0-quantity lines are filtered out of the payload
  // before submit rather than required to be deleted from the grid. At least one line
  // must still be positive, and no line may exceed its returnable ceiling.
  const isFormValid =
    isHeaderReady &&
    lines.length > 0 &&
    lines.some((l) => l.quantity > 0) &&
    lines.every((l) => l.quantity >= 0 && l.quantity <= l.maxReturnableQuantity);

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

  // Replaces window.confirm() — opens the MUI confirmation dialog instead of a
  // native browser alert box, per project convention.
  const handleRequestCommit = () => {
    if (!returnableStock) return;
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

    const payload: RtnSubmissionPayload = {
      header: {
        buyerCode: selectedBuyer.buyerCode,
        order: selectedOrder,
        transactionDate,
      },
      // 0-quantity lines mean "skip this item" — never submitted; the server rejects
      // any line with quantity <= 0.
      lines: lines
        .filter((l) => l.quantity > 0)
        .map((l) => ({
          storeCode: l.storeCode,
          itemCode: l.itemCode,
          unit: l.unit,
          quantity: l.quantity,
        })),
    };

    const toastId = toast.loading(
      "Posting Goods Return Note, updating stock balances...",
    );
    try {
      const response = await commitRtn(payload);
      toast.update(toastId, {
        render:
          response.message ||
          `✓ Goods Return Note ${response.rtnNumber} posted successfully!`,
        type: "success",
        isLoading: false,
        autoClose: 4000,
        closeButton: true,
      });
      handleReset();
    } catch (err) {
      const appError = err as AppError;
      const message = appError?.message ?? "Failed to post Goods Return Note.";
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
          Goods Return Note (RTN) — Buyer / Order Entry
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 3 }}
        >
          RTN Number is allocated by the server on commit — it is never entered
          manually. Return quantity cannot exceed the total quantity issued to
          date for each item. To exclude an item from this return, set its
          quantity to 0 — you don't need to delete the row (the delete icon is
          only for tidying up the list).
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
              label="Return Date"
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
          <Alert severity="info" variant="outlined">
            Select a Buyer and Order to load items available for return
            (anything issued but not yet returned).
          </Alert>
        ) : returnableStock.length === 0 ? (
          <Alert severity="info" variant="outlined">
            Nothing is currently returnable for this Buyer/Order — every issued
            item has already been fully returned, or nothing has been issued
            yet.
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
                Returnable Material Lines
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {lines.length} line(s) loaded for Order {selectedOrder}
              </Typography>
            </Box>

            {/* The grid (and the action bar below it) always render once stock is
                loaded — even if the user deletes every row or zeroes every quantity.
                Only the Confirm button's disabled state reflects validity now; the
                whole action bar no longer disappears based on line count/quantity. */}
            {lines.length === 0 ? (
              <Alert severity="info" variant="outlined">
                All lines have been removed from this return. Reset to reload the
                original returnable lines, or there's nothing left to submit.
              </Alert>
            ) : (
              <>
                <GoodsReturnNoteLinesGrid lines={lines} setLines={setLines} />

                {hasOverReturnableLine && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    One or more lines exceed the total quantity issued to date.
                    Reduce the return quantity to proceed.
                  </Alert>
                )}
              </>
            )}

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
                variant="text"
                color="secondary"
                size="small"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Cancel RTN
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<SendIcon />}
                onClick={handleRequestCommit}
                disabled={isSubmitting || !isFormValid || isStockLoading}
                sx={{
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

      {/* Replaces window.confirm() with an in-app MUI dialog, per project
          convention: no native browser alert/confirm boxes. */}
      <Dialog
        open={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        aria-labelledby="rtn-confirm-dialog-title"
        slotProps={{ paper: { sx: { backgroundColor: "#141922" } } }}
      >
        <DialogTitle id="rtn-confirm-dialog-title" sx={{ color: "#F4F6F8" }}>
          Confirm Goods Return Note
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#F4F6F8" }}>
            Confirm all entries and post this Goods Return Note? This increases
            physical stock on hand and reduces the outstanding issued balance
            for Buyer {selectedBuyer?.name} / Order {selectedOrder}.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmCommit}
            variant="contained"
            color="primary"
            autoFocus
          >
            Confirm & Post
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
