import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
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
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
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

  // Replaces window.confirm() with in-app MUI dialogs, and gives commit failures
  // a persistent inline home instead of only a transient toast - per project
  // convention: no native browser alert/confirm boxes, and all errors must be
  // displayed inline. Two separate dialogs: the normal commit confirmation, and
  // the manager-override re-confirmation triggered by a 409 from the server.
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isOverrideDialogOpen, setIsOverrideDialogOpen] = useState(false);
  const [overrideMessage, setOverrideMessage] = useState<string | null>(null);
  const [commitErrorMessage, setCommitErrorMessage] = useState<string | null>(null);

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
  // remaining balance (editable down). Adjusts state during render itself - the
  // React-docs "adjusting state when a prop changes" pattern - rather than via
  // useEffect, since a synchronous setState inside an effect here trips
  // react-hooks/set-state-in-effect (an extra, avoidable cascading render pass).
  const [syncedLookupResult, setSyncedLookupResult] = useState(lookupResult);
  if (lookupResult !== syncedLookupResult) {
    setSyncedLookupResult(lookupResult);
    setLines(
      lookupResult
        ? lookupResult.lines.map((l) => ({
            stockCode: l.stockCode,
            itemCode: l.itemCode,
            description: l.description,
            storeCode: l.storeCode,
            unit: l.unit,
            quantity: l.balanceToReceive,
            balanceToReceive: l.balanceToReceive,
            qtyInHand: l.qtyInHand,
            strnBalance: l.strnBalance,
          }))
        : [],
    );
  }

  const hasOverBalanceLine = lines.some(
    (l) => l.quantity > Math.min(l.balanceToReceive, l.qtyInHand),
  );
  // A line at 0 means "not issued in this delivery" - a valid partial-issue skip,
  // not an error - same convention as GRN/RTN/STRN. At least one line must still
  // be positive, and no line may be negative or exceed its available-to-issue
  // ceiling.
  const isFormValid =
    isHeaderReady &&
    lines.length > 0 &&
    lines.some((l) => l.quantity > 0) &&
    lines.every(
      (l) => l.quantity >= 0 && l.quantity <= Math.min(l.balanceToReceive, l.qtyInHand),
    );

  const handleReset = () => {
    setStrnNumberInput("");
    setLookupStrnNumber("");
    setLines([]);
    setTransactionDate(new Date().toISOString().split("T")[0]);
    setCommitErrorMessage(null);
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
        setOverrideMessage(appError.message);
        setIsOverrideDialogOpen(true);
        return;
      }
      setCommitErrorMessage(appError?.message ?? "Failed to post Goods Issue Note.");
      toast.update(toastId, {
        render: `🛑 ${appError?.message ?? "Failed to post Goods Issue Note."}`,
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });
    }
  };

  // Validation gate - replaces window.confirm() with the MUI dialog below, per
  // project convention (no native browser confirm/alert boxes).
  const handleRequestCommit = () => {
    if (!isFormValid) {
      toast.warning("Resolve the outstanding validation issues before confirming.");
      return;
    }
    setCommitErrorMessage(null);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmCommit = async () => {
    setIsConfirmDialogOpen(false);
    await submit(false);
  };

  const handleConfirmOverride = async () => {
    setIsOverrideDialogOpen(false);
    await submit(true);
  };

  return (
    <Box sx={{ width: "100%", p: 1 }}>
      <Paper elevation={3} sx={{ p: 3, borderTop: "4px solid #60a5fa", backgroundColor: "#fafafa" }}>
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
          </Box>
        )}

        {/* Always rendered from initial page load, never hidden behind header
            or line-count checks. Only ever enabled/disabled via isFormValid. */}
        <Box sx={{ gap: 2, mt: 3, pt: 2, borderTop: "1px dashed rgba(139,147,161,0.3)", display: "flex", justifyContent: "flex-end" }}>
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
            Cancel GIN
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<SendIcon />}
            onClick={handleRequestCommit}
            disabled={isSubmitting || !isFormValid}
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
      </Paper>

      {/* Replaces window.confirm() with an in-app MUI dialog, per project
          convention: no native browser alert/confirm boxes. */}
      <Dialog
        open={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        aria-labelledby="gin-confirm-dialog-title"
        slotProps={{ paper: { sx: { backgroundColor: "#141922" } } }}
      >
        <DialogTitle id="gin-confirm-dialog-title" sx={{ color: "#F4F6F8" }}>
          Confirm Goods Issue Note
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#F4F6F8" }}>
            Confirm all entries and post this Goods Issue Note? This decrements the
            stores stock ledger and closes the balance against the selected STRN.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmCommit} variant="contained" color="primary" autoFocus>
            Confirm & Post
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manager-override re-confirmation, triggered by a 409
          (ExactConsumptionOverrideRequiredException) from the server. Replaces
          the old window.confirm() override prompt. */}
      <Dialog
        open={isOverrideDialogOpen}
        onClose={() => setIsOverrideDialogOpen(false)}
        aria-labelledby="gin-override-dialog-title"
        slotProps={{ paper: { sx: { backgroundColor: "#141922" } } }}
      >
        <DialogTitle id="gin-override-dialog-title" sx={{ color: "#F4F6F8" }}>
          Manager Override Required
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#F4F6F8" }}>
            {overrideMessage}
            <br />
            <br />
            A manager override is required to proceed. Confirm override and re-submit?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOverrideDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmOverride} variant="contained" color="primary" autoFocus>
            Confirm Override
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
