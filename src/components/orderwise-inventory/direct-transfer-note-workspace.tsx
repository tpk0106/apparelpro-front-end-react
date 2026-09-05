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

import DirectTransferNoteLinesGrid from "./direct-transfer-note-lines-grid";
import ConfirmDialog from "../common/confirm-dialog";
import type {
  DtnLineItemRow,
  DtnSubmissionPayload,
} from "./direct-transfer-note.types";
import {
  useGetFromStockQuery,
  useGetToOrderItemsQuery,
  useCommitDtnMutation,
} from "../../tanstack-hooks/direct-transfer-note.hooks";
import {
  useGetBuyersQuery,
  useGetAllPurchaseOrdersByBuyerCode,
} from "../../tanstack-hooks/custom-hooks";
import type { Buyer } from "../../interfaces/references/Buyer";
import type { AppError } from "../../auth/axiosClient";
import { DASHBOARD_COLORS } from "../dashboard/dashboard-theme";
import { useDropdownTheme } from "../../themes/useDropdownTheme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  workspaceHeadingSx,
  workspaceInfoCaptionSx,
  workspaceSectionLabelSx,
  dateIconFieldSx,
} from "../../themes/workspace-theme";

export default function DirectTransferNoteWorkspace() {
  const { fieldSx: dropdownFieldSx, listboxSx: dropdownListboxSx } = useDropdownTheme();
  const dropdownMenuSlotProps = { select: { MenuProps: { slotProps: { paper: { sx: dropdownListboxSx } } } } };
  const [selectedFromBuyer, setSelectedFromBuyer] = useState<Buyer | null>(
    null,
  );
  const [selectedFromOrder, setSelectedFromOrder] = useState<string>("");
  const [selectedToBuyer, setSelectedToBuyer] = useState<Buyer | null>(null);
  const [selectedToOrder, setSelectedToOrder] = useState<string>("");
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [lines, setLines] = useState<DtnLineItemRow[]>([]);
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

  // Mirrors the server-side guard in DirectTransferNoteService.CommitDirectTransferNoteAsync
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
    data: fromStock,
    isFetching: isStockLoading,
    error: stockLookupError,
  } = useGetFromStockQuery(
    {
      fromBuyerCode: selectedFromBuyer?.buyerCode ?? 0,
      fromOrder: selectedFromOrder,
      toBuyerCode: selectedToBuyer?.buyerCode ?? 0,
      toOrder: selectedToOrder,
    },
    isAllHeaderFieldsSelected && !isFromToIdentical,
  );

  const { data: toOrderItems = [], isFetching: isToOrderItemsLoading } =
    useGetToOrderItemsQuery(
      {
        toBuyerCode: selectedToBuyer?.buyerCode ?? 0,
        toOrder: selectedToOrder,
      },
      !!selectedToBuyer && !!selectedToOrder && !isFromToIdentical,
    );

  const { mutateAsync: commitDtn, isPending: isSubmitting } =
    useCommitDtnMutation();

  const isHeaderReady =
    isAllHeaderFieldsSelected && !isFromToIdentical && !!fromStock;

  // Populate the grid the instant a lookup succeeds, defaulting transfer qty to the
  // full transferable balance (editable down) and leaving the To Item mapping blank
  // for the user to pick — same "adjust state during render" pattern already used in
  // GoodsTransferNoteWorkspace.
  const [syncedFromStock, setSyncedFromStock] = useState(fromStock);
  if (fromStock !== syncedFromStock) {
    setSyncedFromStock(fromStock);
    setLines(
      fromStock
        ? fromStock.map((s) => ({
            storeCode: s.storeCode,
            fromItemCode: s.itemCode,
            toItemCode: "",
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
  const hasMissingToItemLine = lines.some(
    (l) => l.quantity > 0 && !l.toItemCode,
  );
  // A line at quantity 0 means "don't transfer this item" — it's a valid, deliberate
  // skip, not an error. The server also rejects any submitted line with quantity <= 0,
  // so 0-quantity lines are filtered out of the payload before submit rather than
  // required to be deleted from the grid. At least one line must still be positive,
  // no line may exceed its transferable ceiling, and every positive-quantity line
  // must have a To Item mapping selected.
  const isFormValid =
    isHeaderReady &&
    lines.length > 0 &&
    lines.some((l) => l.quantity > 0) &&
    lines.every(
      (l) => l.quantity >= 0 && l.quantity <= l.maxTransferableQuantity,
    ) &&
    !hasMissingToItemLine;

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

  const handleRequestCommit = () => {
    if (!fromStock) return;
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

    const payload: DtnSubmissionPayload = {
      header: {
        fromBuyerCode: selectedFromBuyer.buyerCode,
        fromOrder: selectedFromOrder,
        toBuyerCode: selectedToBuyer.buyerCode,
        toOrder: selectedToOrder,
        transactionDate,
      },
      lines: lines
        .filter((l) => l.quantity > 0)
        .map((l) => ({
          storeCode: l.storeCode,
          fromItemCode: l.fromItemCode,
          toItemCode: l.toItemCode,
          unit: l.unit,
          quantity: l.quantity,
        })),
    };

    const toastId = toast.loading(
      "Posting Direct Goods Transfer Note, updating stock balances...",
    );
    try {
      const response = await commitDtn(payload);
      toast.update(toastId, {
        render:
          response.message ||
          `✓ Direct Goods Transfer Note ${response.dtnNumber} posted successfully!`,
        type: "success",
        isLoading: false,
        autoClose: 4000,
        closeButton: true,
      });
      handleReset();
    } catch (err) {
      const appError = err as AppError;
      const message =
        appError?.message ?? "Failed to post Direct Goods Transfer Note.";
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
    <Box sx={{ width: "100%", py: 1, px: 3 }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          backgroundColor: DASHBOARD_COLORS.pageBg,
        }}
      >
        <Typography variant="h5" sx={{ ...workspaceHeadingSx, mb: 3 }}>
          Direct Goods Transfer Note (DTN) (ORDERWISE)
        </Typography>
        <Typography
          variant="caption"
          sx={{ ...workspaceInfoCaptionSx, mb: 3 }}
        >
          DTN Number is allocated by the server on commit — it is never entered
          manually. Unlike a Goods Transfer Note, the destination item does not
          have to match the source item — pick which item under the To Order
          each line's transferred quantity should become. Transfer quantity
          cannot exceed the quantity currently in hand on the From side. To
          exclude an item from this transfer, set its quantity to 0.
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
              sx={dropdownFieldSx}
              slotProps={dropdownMenuSlotProps}
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
              sx={dropdownFieldSx}
              slotProps={dropdownMenuSlotProps}
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
              sx={dropdownFieldSx}
              slotProps={dropdownMenuSlotProps}
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
              sx={dropdownFieldSx}
              slotProps={dropdownMenuSlotProps}
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
              sx={{ ...dropdownFieldSx, ...(dateIconFieldSx as Record<string, unknown>) }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {isFromToIdentical && (
          <Alert severity="error" sx={{ mb: 2 }}>
            From and To Buyer/Order must be different for a Direct Goods
            Transfer Note.
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
              sx={{ m: 2, fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}
            >
              Select a From Buyer/Order and a different To Buyer/Order to load
              items available for transfer.
            </Alert>
          )
        ) : fromStock.length === 0 ? (
          <Alert
            severity="info"
            variant="outlined"
            sx={{ m: 2, fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}
          >
            The From Order has no stock on hand to transfer.
          </Alert>
        ) : toOrderItems.length === 0 && !isToOrderItemsLoading ? (
          <Alert
            severity="info"
            variant="outlined"
            sx={{ m: 2, fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}
          >
            The To Order has no material requirement set up yet, so there is
            nothing to map the transferred stock onto.
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
              <Typography variant="subtitle2" sx={workspaceSectionLabelSx}>
                Transferable Material Lines
              </Typography>
              <Typography variant="caption" sx={workspaceInfoCaptionSx}>
                {lines.length} line(s) loaded — {selectedFromOrder} →{" "}
                {selectedToOrder}
              </Typography>
            </Box>

            {lines.length === 0 ? (
              <Alert
                severity="info"
                variant="outlined"
                sx={{ m: 2, fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}
              >
                All lines have been removed from this transfer. Reset to reload
                the original transferable lines, or there's nothing left to
                submit.
              </Alert>
            ) : (
              <>
                <DirectTransferNoteLinesGrid
                  lines={lines}
                  setLines={setLines}
                  toOrderItems={toOrderItems}
                />

                {hasOverTransferableLine && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    One or more lines exceed the quantity currently in hand on
                    the From side. Reduce the transfer quantity to proceed.
                  </Alert>
                )}
                {hasMissingToItemLine && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    One or more lines with a transfer quantity are missing a
                    To Item mapping. Select the destination item for each
                    line to proceed.
                  </Alert>
                )}
              </>
            )}

            <Box
              sx={{
                gap: 2,
                mt: 3,
                pt: 2,                display: "flex",
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
                Cancel DTN
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<SendIcon />}
                onClick={handleRequestCommit}
                disabled={isSubmitting || !isFormValid || isStockLoading}
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
                <span style={themedButtonLabelStyle}>Save Direct Transfer Note</span>
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      <ConfirmDialog
        open={isConfirmDialogOpen}
        title="Confirm Direct Goods Transfer Note"
        message={<>
            Confirm all entries and post this Direct Goods Transfer Note? This
            moves physical stock from Buyer {selectedFromBuyer?.name} / Order{" "}
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
