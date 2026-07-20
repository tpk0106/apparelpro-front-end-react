import { useEffect, useState } from "react";
import { Box, Paper, Typography, TextField, Button, Alert, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
import SendIcon from "@mui/icons-material/Send";
import SearchIcon from "@mui/icons-material/Search";
import { toast } from "react-toastify";

import GoodsIssueNoteLinesGrid from "./goods-issue-note-lines-grid";
import type { GinLineItemRow, GinSubmissionPayload } from "./goods-issue-note.types";
import {
  useGetIssuableStrnLinesQuery,
  useCommitGinMutation,
} from "../../tanstack-hooks/goods-issue-note.hooks";
import type { AppError } from "../../auth/axiosClient";

export default function GoodsIssueNoteWorkspace() {
  const [strnNumberInput, setStrnNumberInput] = useState("");
  const [lookupStrnNumber, setLookupStrnNumber] = useState("");
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [lines, setLines] = useState<GinLineItemRow[]>([]);

  const {
    data: lookupResult,
    isFetching: isLookingUp,
    error: lookupError,
  } = useGetIssuableStrnLinesQuery(lookupStrnNumber, !!lookupStrnNumber);

  const { mutateAsync: commitGin, isPending: isSubmitting } = useCommitGinMutation();

  const isHeaderReady = !!lookupResult;

  const handleLookup = () => {
    const trimmed = strnNumberInput.trim().toUpperCase();
    if (!trimmed) {
      toast.warning("Enter an STRN number to look up.");
      return;
    }
    setLookupStrnNumber(trimmed);
  };

  // Populate the grid the instant a lookup succeeds, defaulting issue qty to the full
  // remaining balance (editable down). Deliberately useEffect, not useMemo — the zip
  // design used useMemo to trigger this setState side effect, which works today but
  // violates useMemo's purity contract; useEffect is the correct hook for syncing
  // external query data into local editable state.
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

  const handleReset = () => {
    setStrnNumberInput("");
    setLookupStrnNumber("");
    setLines([]);
    setTransactionDate(new Date().toISOString().split("T")[0]);
  };

  const submit = async (overrideExactConsumptionCheck: boolean) => {
    if (!lookupResult) return;

    const payload: GinSubmissionPayload = {
      header: {
        sourceStrnNumber: lookupStrnNumber,
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
      // 409 = ExactConsumptionOverrideRequiredException from the server. Offer to
      // resubmit with the override flag; the server still independently checks the
      // caller's role, so a non-manager gets the same 409 again rather than a bypass.
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
          Goods Issue Note (GIN) — Direct STRN Entry
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 3 }}>
          GIN Number is allocated by the server on commit — it is never entered manually.
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              label="STRN Number"
              size="small"
              fullWidth
              value={strnNumberInput}
              onChange={(e) => setStrnNumberInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              placeholder="e.g. STRN000123"
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

        {lookupError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {lookupError.message}
          </Alert>
        )}

        {!isHeaderReady ? (
          <Alert severity="info" variant="outlined">
            Enter a known STRN number and click Look Up to load its outstanding material
            balance.
          </Alert>
        ) : (
          <Box>
            <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
                Pending Material Lines &middot; Buyer {lookupResult.buyerCode} / Order{" "}
                {lookupResult.order} / Dept. {lookupResult.departmentCode}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {lines.length} line(s) loaded from STRN {lookupStrnNumber}
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
