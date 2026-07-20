import { useEffect, useMemo, useState } from "react";
import { Box, Paper, Typography, TextField, MenuItem, Button, Alert, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
import SendIcon from "@mui/icons-material/Send";
import { toast } from "react-toastify";

import GoodsIssueNoteLinesGrid from "./goods-issue-note-lines-grid";
import type { GinLineItemRow, GinSubmissionPayload } from "./goods-issue-note.types";
import {
  useGetPendingStrnsByOrderQuery,
  useGetIssuableStrnLinesQuery,
  useCommitGinMutation,
} from "../../tanstack-hooks/goods-issue-note.hooks";
import {
  useGetBuyersQuery,
  useGetAllPurchaseOrdersByBuyerCode,
} from "../../tanstack-hooks/custom-hooks";
import type { Buyer } from "../../interfaces/references/Buyer";
import type { AppError } from "../../auth/axiosClient";

export default function GoodsIssueNoteCascadeWorkspace() {
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [selectedStrn, setSelectedStrn] = useState<string>("");
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [lines, setLines] = useState<GinLineItemRow[]>([]);

  const { data: buyerPageData, isLoading: isBuyersLoading } = useGetBuyersQuery({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "name",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const buyersList = useMemo<Buyer[]>(() => buyerPageData?.items ?? [], [buyerPageData]);

  const { data: ordersList = [], isLoading: isOrdersLoading } =
    useGetAllPurchaseOrdersByBuyerCode(selectedBuyer?.buyerCode ?? 0, !!selectedBuyer);

  const { data: pendingStrns = [], isLoading: isStrnsLoading } = useGetPendingStrnsByOrderQuery(
    { buyerCode: selectedBuyer?.buyerCode ?? 0, order: selectedOrder },
    !!selectedBuyer && !!selectedOrder,
  );

  const { data: lookupResult, isFetching: isLinesLoading } = useGetIssuableStrnLinesQuery(
    selectedStrn,
    !!selectedStrn,
  );

  const { mutateAsync: commitGin, isPending: isSubmitting } = useCommitGinMutation();

  const isHeaderReady = !!selectedBuyer && !!selectedOrder && !!selectedStrn && !!lookupResult;

  useEffect(() => {
    if (lookupResult) {
      setLines(
        lookupResult.lines.map((l) => ({
          stockCode: l.stockCode,
          itemCode: l.itemCode,
          storeCode: l.storeCode,
          unit: l.unit,
          quantity: l.balanceToReceive,
          balanceToReceive: l.balanceToReceive,
          qtyInHand: l.qtyInHand,
          strnBalance: l.strnBalance,
        })),
      );
    }
  }, [lookupResult]);

  const hasOverBalanceLine = lines.some(
    (l) => l.quantity > Math.min(l.balanceToReceive, l.qtyInHand),
  );
  const isFormValid =
    isHeaderReady &&
    lines.length > 0 &&
    lines.every((l) => l.quantity > 0 && l.quantity <= Math.min(l.balanceToReceive, l.qtyInHand));

  const handleBuyerChange = (buyerCode: string) => {
    const buyer = buyersList.find((b) => String(b.buyerCode) === buyerCode) ?? null;
    setSelectedBuyer(buyer);
    setSelectedOrder("");
    setSelectedStrn("");
    setLines([]);
  };

  const handleOrderChange = (order: string) => {
    setSelectedOrder(order);
    setSelectedStrn("");
    setLines([]);
  };

  const handleReset = () => {
    setSelectedBuyer(null);
    setSelectedOrder("");
    setSelectedStrn("");
    setLines([]);
    setTransactionDate(new Date().toISOString().split("T")[0]);
  };

  const submit = async (overrideExactConsumptionCheck: boolean) => {
    if (!lookupResult) return;

    const payload: GinSubmissionPayload = {
      header: {
        sourceStrnNumber: selectedStrn,
        transactionDate,
        buyerCode: lookupResult.buyerCode,
        order: lookupResult.order,
        departmentCode: lookupResult.departmentCode,
      },
      lines: lines.map((l) => ({
        stockCode: l.stockCode,
        itemCode: l.itemCode,
        storeCode: l.storeCode,
        unit: l.unit,
        quantity: l.quantity,
      })),
      overrideExactConsumptionCheck,
    };

    const toastId = toast.loading("Posting Goods Issue Note, updating stock balances...");
    try {
      const response = await commitGin(payload);
      toast.update(toastId, {
        render: response.message || "✓ Goods Issue Note posted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 4000,
        closeButton: true,
      });
      handleReset();
    } catch (err) {
      const appError = err as AppError;
      if (appError.status === 409) {
        toast.dismiss(toastId);
        if (
          window.confirm(
            `${appError.message}\n\nA manager override is required to proceed. Confirm override and re-submit?`,
          )
        ) {
          await submit(true);
        }
        return;
      }
      toast.update(toastId, {
        render: `🛑 ${appError?.message ?? "Failed to post Goods Issue Note."}`,
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });
    }
  };

  const handleCommit = async () => {
    if (!isFormValid) {
      toast.warning("Resolve the outstanding validation issues before confirming.");
      return;
    }
    if (
      !window.confirm(
        "Confirm all entries and post this Goods Issue Note?\n\nThis decrements the stores stock ledger and closes the balance against the selected STRN. Proceed?",
      )
    )
      return;
    await submit(false);
  };

  return (
    <Box sx={{ width: "100%", p: 1 }}>
      <Paper elevation={3} sx={{ p: 3, borderTop: "4px solid #60a5fa" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
          Goods Issue Note (GIN) — Buyer / Order / STRN Cascade
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 3 }}>
          GIN Number is allocated by the server on commit — it is never entered manually.
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
              label="STRN Number"
              size="small"
              fullWidth
              value={selectedStrn}
              onChange={(e) => setSelectedStrn(e.target.value)}
              disabled={!selectedOrder || isStrnsLoading}
              helperText={
                selectedOrder && !isStrnsLoading && pendingStrns.length === 0
                  ? "No pending STRNs for this order"
                  : " "
              }
            >
              {pendingStrns.map((s) => (
                <MenuItem key={s.strnNumber} value={s.strnNumber}>
                  {s.strnNumber} ({s.departmentCode})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              type="date"
              label="Issue Date"
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
            Select a Buyer, Order and a pending STRN to load its outstanding material balance.
          </Alert>
        ) : (
          <Box>
            <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
                Pending Material Lines &middot; To Dept. {lookupResult.departmentCode}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {lines.length} line(s) loaded from STRN {selectedStrn}
              </Typography>
            </Box>

            <GoodsIssueNoteLinesGrid lines={lines} setLines={setLines} />

            {hasOverBalanceLine && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                One or more lines exceed the available balance. Reduce the issue quantity to
                proceed.
              </Alert>
            )}

            {lines.length > 0 && (
              <Box sx={{ gap: 2, mt: 3, pt: 2, borderTop: "1px dashed rgba(139,147,161,0.3)", display: "flex", justifyContent: "flex-end" }}>
                <Button variant="text" color="secondary" size="small" onClick={handleReset} disabled={isSubmitting}>
                  Cancel GIN
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
