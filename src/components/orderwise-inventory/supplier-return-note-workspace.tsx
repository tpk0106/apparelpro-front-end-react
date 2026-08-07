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

import SupplierReturnNoteLinesGrid from "./supplier-return-note-lines-grid";
import ConfirmDialog from "../common/confirm-dialog";
import type {
  SrnLineItemRow,
  SrnSubmissionPayload,
} from "./supplier-return-note.types";
import {
  useGetReturnableStockByBuyerOrderQuery,
  useCommitSrnMutation,
} from "../../tanstack-hooks/supplier-return-note.hooks";
import {
  useGetBuyersQuery,
  useGetAllPurchaseOrdersByBuyerCode,
  useGetSuppliersLookup,
} from "../../tanstack-hooks/custom-hooks";
import type { Buyer } from "../../interfaces/references/Buyer";
import type { AppError } from "../../auth/axiosClient";

export default function SupplierReturnNoteWorkspace() {
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [selectedSupplierCode, setSelectedSupplierCode] = useState<number | "">(
    "",
  );
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [lines, setLines] = useState<SrnLineItemRow[]>([]);
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

  const { data: suppliersList = [], isLoading: isSuppliersLoading } =
    useGetSuppliersLookup();

  const {
    data: returnableStock,
    isFetching: isStockLoading,
    error: stockLookupError,
  } = useGetReturnableStockByBuyerOrderQuery(
    { buyerCode: selectedBuyer?.buyerCode ?? 0, order: selectedOrder },
    !!selectedBuyer && !!selectedOrder,
  );

  const { mutateAsync: commitSrn, isPending: isSubmitting } =
    useCommitSrnMutation();

  const isHeaderReady = !!selectedBuyer && !!selectedOrder && !!returnableStock;

  // Populate the grid the instant a lookup succeeds, defaulting return qty to the full
  // returnable balance (editable down). Adjusts state during render itself - the
  // React-docs "adjusting state when a prop changes" pattern - rather than via
  // useEffect, matching the established GTN/RTN convention.
  const [syncedReturnableStock, setSyncedReturnableStock] =
    useState(returnableStock);
  if (returnableStock !== syncedReturnableStock) {
    setSyncedReturnableStock(returnableStock);
    setLines(
      returnableStock
        ? returnableStock.map((s) => ({
            storeCode: s.storeCode,
            itemCode: s.itemCode,
            unit: s.unit,
            quantity: s.maxReturnableQuantity,
            description: s.description,
            qtyInHand: s.qtyInHand,
            maxReturnableQuantity: s.maxReturnableQuantity,
            netAvailableAfterOutstandingRequisitions:
              s.netAvailableAfterOutstandingRequisitions,
          }))
        : [],
    );
  }

  const hasOverReturnableLine = lines.some(
    (l) => l.quantity > l.maxReturnableQuantity,
  );
  // A line at quantity 0 means "don't return this item" — a valid, deliberate skip,
  // not an error. The server also rejects any submitted line with quantity <= 0
  // (CommitSupplierReturnNoteAsync), so 0-quantity lines are filtered out of the
  // payload before submit rather than required to be deleted from the grid. At least
  // one line must still be positive, and no line may exceed its returnable ceiling.
  // A Supplier must also be selected — it's part of the header, not a per-line field.
  const isFormValid =
    isHeaderReady &&
    selectedSupplierCode !== "" &&
    lines.length > 0 &&
    lines.some((l) => l.quantity > 0) &&
    lines.every(
      (l) => l.quantity >= 0 && l.quantity <= l.maxReturnableQuantity,
    );

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
    setSelectedSupplierCode("");
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
    if (!selectedBuyer || selectedSupplierCode === "") return;

    const payload: SrnSubmissionPayload = {
      header: {
        buyerCode: selectedBuyer.buyerCode,
        order: selectedOrder,
        supplierCode: selectedSupplierCode,
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
      "Posting Supplier Return Note, updating stock balances...",
    );
    try {
      const response = await commitSrn(payload);
      toast.update(toastId, {
        render:
          response.message ||
          `✓ Supplier Return Note ${response.srnNumber} posted successfully!`,
        type: "success",
        isLoading: false,
        autoClose: 4000,
        closeButton: true,
      });
      handleReset();
    } catch (err) {
      const appError = err as AppError;
      const message =
        appError?.message ?? "Failed to post Supplier Return Note.";
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
          Supplier Return Note (SRN)
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 3 }}
        >
          SRN Number is allocated by the server on commit — it is never entered
          manually. Return quantity cannot exceed the current quantity on hand
          for each item. To exclude an item from this return, set its quantity
          to 0 — you don't need to delete the row (the delete icon is only for
          tidying up the list).
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="Supplier"
              size="small"
              fullWidth
              value={
                selectedSupplierCode === "" ? "" : String(selectedSupplierCode)
              }
              onChange={(e) => {
                setSelectedSupplierCode(
                  e.target.value === "" ? "" : Number(e.target.value),
                );
                setCommitErrorMessage(null);
              }}
              disabled={isSuppliersLoading}
            >
              {suppliersList.map((s) => (
                <MenuItem key={s.supplierCode} value={String(s.supplierCode)}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
          <Alert
            severity="info"
            variant="outlined"
            sx={{ m: 2, fontWeight: "bold", color: "#1a237e" }}
          >
            Select a Buyer and Order to load items currently in stock and
            available to return to a supplier.
          </Alert>
        ) : returnableStock.length === 0 ? (
          <Alert
            severity="info"
            variant="outlined"
            sx={{ m: 2, fontWeight: "bold", color: "#1a237e" }}
          >
            Nothing is currently returnable for this Buyer/Order — there is no
            stock on hand.
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
                All lines have been removed from this return. Reset to reload
                the original returnable lines, or there's nothing left to
                submit.
              </Alert>
            ) : (
              <>
                <SupplierReturnNoteLinesGrid
                  lines={lines}
                  setLines={setLines}
                />

                {hasOverReturnableLine && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    One or more lines exceed the current quantity on hand.
                    Reduce the return quantity to proceed.
                  </Alert>
                )}

                {selectedSupplierCode === "" && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Select a Supplier before confirming this return.
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
                Cancel SRN
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
        title="Confirm Supplier Return Note"
        message={<>
            Confirm all entries and post this Supplier Return Note? This reduces
            physical stock on hand for Buyer {selectedBuyer?.name} / Order{" "}
            {selectedOrder}.
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
