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

import GoodsTransferNoteLinesGrid from "./goods-transfer-note-lines-grid";
import ConfirmDialog from "../common/confirm-dialog";
import type {
  GtnLineItemRow,
  GtnSubmissionPayload,
} from "./goods-transfer-note.types";
import {
  useGetTransferableStockQuery,
  useCommitGtnMutation,
} from "../../tanstack-hooks/goods-transfer-note.hooks";
import {
  useGetBuyersQuery,
  useGetAllPurchaseOrdersByBuyerCode,
} from "../../tanstack-hooks/custom-hooks";
import type { Buyer } from "../../interfaces/references/Buyer";
import type { AppError } from "../../auth/axiosClient";

export default function GoodsTransferNoteWorkspace() {
  const [selectedFromBuyer, setSelectedFromBuyer] = useState<Buyer | null>(
    null,
  );
  const [selectedFromOrder, setSelectedFromOrder] = useState<string>("");
  const [selectedToBuyer, setSelectedToBuyer] = useState<Buyer | null>(null);
  const [selectedToOrder, setSelectedToOrder] = useState<string>("");
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [lines, setLines] = useState<GtnLineItemRow[]>([]);
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

  const { data: fromOrdersList = [], isLoading: isFromOrdersLoading } =
    useGetAllPurchaseOrdersByBuyerCode(
      selectedFromBuyer?.buyerCode ?? 0,
      !!selectedFromBuyer,
    );

  const { data: toOrdersList = [], isLoading: isToOrdersLoading } =
    useGetAllPurchaseOrdersByBuyerCode(
      selectedToBuyer?.buyerCode ?? 0,
      !!selectedToBuyer,
    );

  // Mirrors the server-side guard in GoodsTransferNoteService.CommitGoodsTransferNoteAsync
  // — transferring an order into itself is blocked, both because it's a business no-op
  // and because it would make the From/To stock lookups resolve to the exact same row.
  const isFromToIdentical =
    !!selectedFromBuyer &&
    !!selectedToBuyer &&
    selectedFromBuyer.buyerCode === selectedToBuyer.buyerCode &&
    !!selectedFromOrder &&
    selectedFromOrder === selectedToOrder;

  const isAllHeaderFieldsSelected =
    !!selectedFromBuyer &&
    !!selectedFromOrder &&
    !!selectedToBuyer &&
    !!selectedToOrder;

  const {
    data: transferableStock,
    isFetching: isStockLoading,
    error: stockLookupError,
  } = useGetTransferableStockQuery(
    {
      fromBuyerCode: selectedFromBuyer?.buyerCode ?? 0,
      fromOrder: selectedFromOrder,
      toBuyerCode: selectedToBuyer?.buyerCode ?? 0,
      toOrder: selectedToOrder,
    },
    isAllHeaderFieldsSelected && !isFromToIdentical,
  );

  const { mutateAsync: commitGtn, isPending: isSubmitting } =
    useCommitGtnMutation();

  const isHeaderReady =
    isAllHeaderFieldsSelected && !isFromToIdentical && !!transferableStock;

  // Populate the grid the instant a lookup succeeds, defaulting transfer qty to the
  // full transferable balance (editable down). Adjusts state during render itself -
  // the React-docs "adjusting state when a prop changes" pattern - rather than via
  // useEffect, same convention already used in GoodsReturnNoteWorkspace.
  const [syncedTransferableStock, setSyncedTransferableStock] =
    useState(transferableStock);
  if (transferableStock !== syncedTransferableStock) {
    setSyncedTransferableStock(transferableStock);
    setLines(
      transferableStock
        ? transferableStock.map((s) => ({
            storeCode: s.storeCode,
            itemCode: s.itemCode,
            unit: s.unit,
            quantity: s.maxTransferableQuantity,
            description: s.description,
            qtyInHand: s.qtyInHand,
            maxTransferableQuantity: s.maxTransferableQuantity,
          }))
        : [],
    );
  }

  const hasOverTransferableLine = lines.some(
    (l) => l.quantity > l.maxTransferableQuantity,
  );
  // A line at quantity 0 means "don't transfer this item" — it's a valid, deliberate
  // skip, not an error. The server also rejects any submitted line with quantity <= 0,
  // so 0-quantity lines are filtered out of the payload before submit rather than
  // required to be deleted from the grid. At least one line must still be positive,
  // and no line may exceed its transferable ceiling.
  const isFormValid =
    isHeaderReady &&
    lines.length > 0 &&
    lines.some((l) => l.quantity > 0) &&
    lines.every(
      (l) => l.quantity >= 0 && l.quantity <= l.maxTransferableQuantity,
    );

  const handleFromBuyerChange = (buyerCode: string) => {
    const buyer =
      buyersList.find((b) => String(b.buyerCode) === buyerCode) ?? null;
    setSelectedFromBuyer(buyer);
    setSelectedFromOrder("");
    setLines([]);
    setCommitErrorMessage(null);
  };

  const handleFromOrderChange = (order: string) => {
    setSelectedFromOrder(order);
    setLines([]);
    setCommitErrorMessage(null);
  };

  const handleToBuyerChange = (buyerCode: string) => {
    const buyer =
      buyersList.find((b) => String(b.buyerCode) === buyerCode) ?? null;
    setSelectedToBuyer(buyer);
    setSelectedToOrder("");
    setLines([]);
    setCommitErrorMessage(null);
  };

  const handleToOrderChange = (order: string) => {
    setSelectedToOrder(order);
    setLines([]);
    setCommitErrorMessage(null);
  };

  const handleReset = () => {
    setSelectedFromBuyer(null);
    setSelectedFromOrder("");
    setSelectedToBuyer(null);
    setSelectedToOrder("");
    setLines([]);
    setTransactionDate(new Date().toISOString().split("T")[0]);
    setCommitErrorMessage(null);
  };

  // Replaces window.confirm() — opens the MUI confirmation dialog instead of a
  // native browser alert box, per project convention.
  const handleRequestCommit = () => {
    if (!transferableStock) return;
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
    if (!selectedFromBuyer || !selectedToBuyer) return;

    const payload: GtnSubmissionPayload = {
      header: {
        fromBuyerCode: selectedFromBuyer.buyerCode,
        fromOrder: selectedFromOrder,
        toBuyerCode: selectedToBuyer.buyerCode,
        toOrder: selectedToOrder,
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
      "Posting Goods Transfer Note, updating stock balances...",
    );
    try {
      const response = await commitGtn(payload);
      toast.update(toastId, {
        render:
          response.message ||
          `✓ Goods Transfer Note ${response.gtnNumber} posted successfully!`,
        type: "success",
        isLoading: false,
        autoClose: 4000,
        closeButton: true,
      });
      handleReset();
    } catch (err) {
      const appError = err as AppError;
      const message =
        appError?.message ?? "Failed to post Goods Transfer Note.";
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
          Goods Transfer Note (GTN)
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 3 }}
        >
          GTN Number is allocated by the server on commit — it is never entered
          manually. Only items that already exist under both the From and To
          Order's stock are offered for transfer. Transfer quantity cannot
          exceed the quantity currently in hand on the From side. To exclude an
          item from this transfer, set its quantity to 0.
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="From Buyer"
              size="small"
              fullWidth
              value={
                selectedFromBuyer ? String(selectedFromBuyer.buyerCode) : ""
              }
              onChange={(e) => handleFromBuyerChange(e.target.value)}
              disabled={isBuyersLoading}
            >
              {buyersList.map((b) => (
                <MenuItem key={b.buyerCode} value={String(b.buyerCode)}>
                  {b.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="From Order"
              size="small"
              fullWidth
              value={selectedFromOrder}
              onChange={(e) => handleFromOrderChange(e.target.value)}
              disabled={!selectedFromBuyer || isFromOrdersLoading}
            >
              {fromOrdersList.map((orderStr) => (
                <MenuItem key={orderStr} value={orderStr}>
                  {orderStr}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="To Buyer"
              size="small"
              fullWidth
              value={selectedToBuyer ? String(selectedToBuyer.buyerCode) : ""}
              onChange={(e) => handleToBuyerChange(e.target.value)}
              disabled={isBuyersLoading}
            >
              {buyersList.map((b) => (
                <MenuItem key={b.buyerCode} value={String(b.buyerCode)}>
                  {b.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="To Order"
              size="small"
              fullWidth
              value={selectedToOrder}
              onChange={(e) => handleToOrderChange(e.target.value)}
              disabled={!selectedToBuyer || isToOrdersLoading}
            >
              {toOrdersList.map((orderStr) => (
                <MenuItem key={orderStr} value={orderStr}>
                  {orderStr}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              type="date"
              label="Transfer Date"
              size="small"
              fullWidth
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {isFromToIdentical && (
          <Alert severity="error" sx={{ mb: 2 }}>
            From and To Buyer/Order must be different for a Goods Transfer Note.
          </Alert>
        )}

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
          !isFromToIdentical && (
            <Alert
              severity="info"
              variant="outlined"
              sx={{ m: 2, fontWeight: "bold", color: "#1a237e" }}
            >
              Select a From Buyer/Order and a different To Buyer/Order to load
              items available for transfer.
            </Alert>
          )
        ) : transferableStock.length === 0 ? (
          <Alert
            severity="info"
            variant="outlined"
            sx={{ m: 2, fontWeight: "bold", color: "#1a237e" }}
          >
            Nothing is currently transferable between these two Orders — either
            the From Order has no stock on hand, or none of its items also exist
            on the To Order yet.
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
                Transferable Material Lines
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {lines.length} line(s) loaded — {selectedFromOrder} →{" "}
                {selectedToOrder}
              </Typography>
            </Box>

            {lines.length === 0 ? (
              <Alert
                severity="info"
                variant="outlined"
                sx={{ m: 2, fontWeight: "bold", color: "#1a237e" }}
              >
                All lines have been removed from this transfer. Reset to reload
                the original transferable lines, or there's nothing left to
                submit.
              </Alert>
            ) : (
              <>
                <GoodsTransferNoteLinesGrid lines={lines} setLines={setLines} />

                {hasOverTransferableLine && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    One or more lines exceed the quantity currently in hand on
                    the From side. Reduce the transfer quantity to proceed.
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
                Cancel GTN
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
        title="Confirm Goods Transfer Note"
        message={<>
            Confirm all entries and post this Goods Transfer Note? This moves
            physical stock from Buyer {selectedFromBuyer?.name} / Order{" "}
            {selectedFromOrder} to Buyer {selectedToBuyer?.name} / Order{" "}
            {selectedToOrder}.
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
