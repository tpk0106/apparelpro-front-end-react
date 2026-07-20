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
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SendIcon from "@mui/icons-material/Send";
import { toast } from "react-toastify";

import GoodsReceivedNoteLinesGrid from "./goods-received-note-lines-grid";
import type {
  GrnLineItemRow,
  GrnSubmissionPayload,
} from "./goods-received-note.types";
import {
  useGetPendingPosByOrderQuery,
  useGetReceivableLinesByPoQuery,
  useCommitGrnMutation,
} from "../../tanstack-hooks/goods-received-note.hooks";
import {
  useGetBuyersQuery,
  useGetAllPurchaseOrdersByBuyerCode,
} from "../../tanstack-hooks/custom-hooks";
import type { Buyer } from "../../interfaces/references/Buyer";
import type { AppError } from "../../auth/axiosClient";

export default function GoodsReceivedNoteCascadeWorkspace() {
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [selectedPo, setSelectedPo] = useState<string>("");
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [lines, setLines] = useState<GrnLineItemRow[]>([]);

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

  const { data: pendingPos = [], isLoading: isPosLoading } =
    useGetPendingPosByOrderQuery(
      { buyerCode: selectedBuyer?.buyerCode ?? 0, order: selectedOrder },
      !!selectedBuyer && !!selectedOrder,
    );

  const { data: lookupResult, isFetching: isLinesLoading } =
    useGetReceivableLinesByPoQuery(selectedPo, !!selectedPo);

  const { mutateAsync: commitGrn, isPending: isSubmitting } =
    useCommitGrnMutation();

  const isHeaderReady =
    !!selectedBuyer && !!selectedOrder && !!selectedPo && !!lookupResult;

  useEffect(() => {
    if (lookupResult) {
      setLines(
        lookupResult.lines.map((l) => ({
          buyer: l.buyer,
          order: l.order,
          type: l.type,
          style: l.style,
          itemCode: l.itemCode,
          unit: l.unit,
          quantity: l.balance,
          orderQuantity: l.orderQuantity,
          balance: l.balance,
          qtyInHand: l.qtyInHand,
        })),
      );
    }
  }, [lookupResult]);

  const hasOverBalanceLine = lines.some((l) => l.quantity > l.balance);
  const isFormValid =
    isHeaderReady &&
    lines.length > 0 &&
    lines.every((l) => l.quantity > 0 && l.quantity <= l.balance);

  const handleBuyerChange = (buyerCode: string) => {
    const buyer =
      buyersList.find((b) => String(b.buyerCode) === buyerCode) ?? null;
    setSelectedBuyer(buyer);
    setSelectedOrder("");
    setSelectedPo("");
    setLines([]);
  };

  const handleOrderChange = (order: string) => {
    setSelectedOrder(order);
    setSelectedPo("");
    setLines([]);
  };

  const handleReset = () => {
    setSelectedBuyer(null);
    setSelectedOrder("");
    setSelectedPo("");
    setLines([]);
    setTransactionDate(new Date().toISOString().split("T")[0]);
  };

  const handleCommit = async () => {
    if (!lookupResult) return;

    if (!isFormValid) {
      toast.warning(
        "Resolve the outstanding validation issues before confirming.",
      );
      return;
    }
    if (
      !window.confirm(
        "Confirm all entries and post this Goods Received Note?\n\nThis increases physical stock on hand and reduces the outstanding P/O balance. Proceed?",
      )
    )
      return;

    const payload: GrnSubmissionPayload = {
      header: {
        purchaseOrderNumber: selectedPo,
        transactionDate,
        storeCode: lookupResult.storeCode,
        supplierCode: lookupResult.supplierCode,
      },
      lines: lines.map((l) => ({
        buyer: l.buyer,
        order: l.order,
        type: l.type,
        style: l.style,
        itemCode: l.itemCode,
        unit: l.unit,
        quantity: l.quantity,
      })),
    };

    const toastId = toast.loading(
      "Posting Goods Received Note, updating stock balances...",
    );
    try {
      const response = await commitGrn(payload);
      toast.update(toastId, {
        render:
          response.message || "✓ Goods Received Note posted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 4000,
        closeButton: true,
      });
      handleReset();
    } catch (err) {
      const appError = err as AppError;
      toast.update(toastId, {
        render: `🛑 ${appError?.message ?? "Failed to post Goods Received Note."}`,
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
          Goods Received Note (GRN) — Buyer / Order / P/O Cascade
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 3 }}
        >
          GRN Number is allocated by the server on commit — it is never entered
          manually.
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
              label="P/O Number"
              size="small"
              fullWidth
              value={selectedPo}
              onChange={(e) => setSelectedPo(e.target.value)}
              disabled={!selectedOrder || isPosLoading}
              helperText={
                selectedOrder && !isPosLoading && pendingPos.length === 0
                  ? "No pending P/Os for this order"
                  : " "
              }
            >
              {pendingPos.map((p) => (
                <MenuItem
                  key={p.purchaseOrderNumber}
                  value={p.purchaseOrderNumber}
                >
                  {p.purchaseOrderNumber} ({p.supplierCode})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              type="date"
              label="Receipt Date"
              size="small"
              fullWidth
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {!isHeaderReady ? (
          <Alert severity="info" variant="outlined">
            Select a Buyer, Order and a pending P/O to load its outstanding
            delivery balance.
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
                Pending Material Lines &middot; Store {lookupResult.storeCode}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {lines.length} line(s) loaded from P/O {selectedPo}
              </Typography>
            </Box>

            <GoodsReceivedNoteLinesGrid lines={lines} setLines={setLines} />

            {hasOverBalanceLine && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                One or more lines exceed the outstanding P/O balance. Reduce the
                receive quantity to proceed.
              </Alert>
            )}

            {lines.length > 0 && (
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
                  Cancel GRN
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<SendIcon />}
                  onClick={handleCommit}
                  disabled={isSubmitting || !isFormValid || isLinesLoading}
                >
                  Confirm All Entries
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
