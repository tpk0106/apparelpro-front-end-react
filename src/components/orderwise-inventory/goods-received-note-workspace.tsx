import { useEffect, useState } from "react";
import { Box, Paper, Typography, TextField, Button, Alert, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
import SendIcon from "@mui/icons-material/Send";
import SearchIcon from "@mui/icons-material/Search";
import { toast } from "react-toastify";

import GoodsReceivedNoteLinesGrid from "./goods-received-note-lines-grid";
import type { GrnLineItemRow, GrnSubmissionPayload } from "./goods-received-note.types";
import {
  useGetReceivableLinesByPoQuery,
  useCommitGrnMutation,
} from "../../tanstack-hooks/goods-received-note.hooks";
import type { AppError } from "../../auth/axiosClient";

export default function GoodsReceivedNoteWorkspace() {
  const [poNumberInput, setPoNumberInput] = useState("");
  const [lookupPoNumber, setLookupPoNumber] = useState("");
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [lines, setLines] = useState<GrnLineItemRow[]>([]);

  const {
    data: lookupResult,
    isFetching: isLookingUp,
    error: lookupError,
  } = useGetReceivableLinesByPoQuery(lookupPoNumber, !!lookupPoNumber);

  const { mutateAsync: commitGrn, isPending: isSubmitting } = useCommitGrnMutation();

  const isHeaderReady = !!lookupResult;

  const handleLookup = () => {
    const trimmed = poNumberInput.trim().toUpperCase();
    if (!trimmed) {
      toast.warning("Enter a P/O number to look up.");
      return;
    }
    setLookupPoNumber(trimmed);
  };

  // Populate the grid the instant a lookup succeeds, defaulting receive qty to the full
  // outstanding balance (editable down).
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

  const handleReset = () => {
    setPoNumberInput("");
    setLookupPoNumber("");
    setLines([]);
    setTransactionDate(new Date().toISOString().split("T")[0]);
  };

  const handleCommit = async () => {
    if (!lookupResult) return;

    if (!isFormValid) {
      toast.warning("Resolve the outstanding validation issues before confirming.");
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
        purchaseOrderNumber: lookupPoNumber,
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

    const toastId = toast.loading("Posting Goods Received Note, updating stock balances...");
    try {
      const response = await commitGrn(payload);
      toast.update(toastId, {
        render: response.message || "✓ Goods Received Note posted successfully!",
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
      <Paper elevation={3} sx={{ p: 3, borderTop: "4px solid #60a5fa" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
          Goods Received Note (GRN) — Direct P/O Entry
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 3 }}>
          GRN Number is allocated by the server on commit — it is never entered manually.
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              label="P/O Number"
              size="small"
              fullWidth
              value={poNumberInput}
              onChange={(e) => setPoNumberInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              placeholder="e.g. 000001"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={handleLookup}
              disabled={isLookingUp}
              fullWidth
            >
              Look Up
            </Button>
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

        {lookupError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {lookupError.message}
          </Alert>
        )}

        {!isHeaderReady ? (
          <Alert severity="info" variant="outlined">
            Enter a known P/O number and click Look Up to load its outstanding delivery
            balance.
          </Alert>
        ) : (
          <Box>
            <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
                Pending Material Lines &middot; Supplier {lookupResult.supplierCode} / Store{" "}
                {lookupResult.storeCode}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {lines.length} line(s) loaded from P/O {lookupPoNumber}
              </Typography>
            </Box>

            <GoodsReceivedNoteLinesGrid lines={lines} setLines={setLines} />

            {hasOverBalanceLine && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                One or more lines exceed the outstanding P/O balance. Reduce the receive
                quantity to proceed.
              </Alert>
            )}

            {lines.length > 0 && (
              <Box sx={{ gap: 2, mt: 3, pt: 2, borderTop: "1px dashed rgba(139,147,161,0.3)", display: "flex", justifyContent: "flex-end" }}>
                <Button variant="text" color="secondary" size="small" onClick={handleReset} disabled={isSubmitting}>
                  Cancel GRN
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<SendIcon />}
                  onClick={handleCommit}
                  disabled={isSubmitting || !isFormValid}
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
