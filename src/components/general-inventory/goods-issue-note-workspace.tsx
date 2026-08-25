import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SendIcon from "@mui/icons-material/Send";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";

import GoodsIssueNoteLinesGrid from "./goods-issue-note-lines-grid";
import ConfirmDialog from "../common/confirm-dialog";
import type {
  GeneralGinLineItemRow,
  GeneralGinSubmissionPayload,
} from "../../interfaces/general-inventory/general-gin.types";
import {
  useGetIssuableStrnLinesQuery,
  useCommitGeneralGinMutation,
} from "../../tanstack-hooks/general-inventory/general-gin.hooks";
import type { AppError } from "../../auth/axiosClient";

// Replicates GI_GIN1.PRG's "GOODS ISSUE NOTE (General)" entry screen - always raised
// against exactly one Stores Requisition Note. Unlike Orderwise's GIN, there's no
// Buyer/Order context at all.
export default function GoodsIssueNoteWorkspace() {
  const [strnNumberInput, setStrnNumberInput] = useState("");
  const [lookupStrnNumber, setLookupStrnNumber] = useState("");
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [lines, setLines] = useState<GeneralGinLineItemRow[]>([]);

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isOverrideDialogOpen, setIsOverrideDialogOpen] = useState(false);
  const [overrideMessage, setOverrideMessage] = useState<string | null>(null);
  const [commitErrorMessage, setCommitErrorMessage] = useState<string | null>(
    null,
  );

  const {
    data: lookupResult,
    isFetching: isLookingUp,
    error: lookupError,
  } = useGetIssuableStrnLinesQuery(lookupStrnNumber, !!lookupStrnNumber);

  const { mutateAsync: commitGin, isPending: isSubmitting } =
    useCommitGeneralGinMutation();

  const isHeaderReady = !!lookupResult;

  const handleLookup = () => {
    const trimmed = strnNumberInput.trim();
    if (!trimmed) {
      toast.warning("Enter an SRN number to look up.");
      return;
    }
    setLookupStrnNumber(trimmed);
  };

  // Populate the grid the instant a lookup succeeds, defaulting issue qty to the
  // SRN's original requested quantity (editable). Adjusts state during render itself
  // (the React-docs "adjusting state when a prop changes" pattern) rather than via
  // useEffect.
  const [syncedLookupResult, setSyncedLookupResult] = useState(lookupResult);
  if (lookupResult !== syncedLookupResult) {
    setSyncedLookupResult(lookupResult);
    setLines(
      lookupResult
        ? lookupResult.lines.map((l) => ({
            itemCode: l.itemCode,
            description: l.description,
            unit: l.unit,
            quantity: l.requestedQuantity,
            requestedQuantity: l.requestedQuantity,
            qtyInHand: l.qtyInHand,
            shadowBalance: l.shadowBalance,
            minStock: l.minStock,
          }))
        : [],
    );
  }

  const hasOverBalanceLine = lines.some((l) => {
    const effectiveShadowBalance = l.shadowBalance - l.requestedQuantity;
    const availableToIssue = l.qtyInHand - effectiveShadowBalance - l.minStock;
    return l.quantity > availableToIssue;
  });
  const isFormValid =
    isHeaderReady &&
    lines.length > 0 &&
    lines.some((l) => l.quantity > 0) &&
    lines.every((l) => l.quantity >= 0);

  const handleReset = () => {
    setStrnNumberInput("");
    setLookupStrnNumber("");
    setLines([]);
    setTransactionDate(new Date().toISOString().split("T")[0]);
    setCommitErrorMessage(null);
  };

  const submit = async (overrideMinStockCheck: boolean) => {
    if (!lookupResult) return;

    const payload: GeneralGinSubmissionPayload = {
      header: {
        ginNumber: "",
        sourceStrnNumber: lookupStrnNumber,
        transactionDate,
        storeCode: lookupResult.storeCode,
        departmentCode: lookupResult.departmentCode,
      },
      lines: lines.map((l) => ({
        itemCode: l.itemCode,
        unit: l.unit,
        quantity: l.quantity,
      })),
      overrideMinStockCheck,
    };

    const toastId = toast.loading(
      "Posting Goods Issue Note, updating stock balances...",
    );
    try {
      const response = await commitGin(payload);
      toast.update(toastId, {
        render: response.message || "Goods Issue Note posted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 4000,
        closeButton: true,
      });
      handleReset();
    } catch (err) {
      const appError = err as AppError;
      // 409 = MinStockOverrideRequiredException from the server. Offer to resubmit
      // with the override flag; the server still independently checks the caller's
      // role, so a non-manager gets the same 409 again rather than a bypass.
      if (appError.status === 409) {
        toast.dismiss(toastId);
        setOverrideMessage(appError.message);
        setIsOverrideDialogOpen(true);
        return;
      }
      setCommitErrorMessage(
        appError?.message ?? "Failed to post Goods Issue Note.",
      );
      toast.update(toastId, {
        render: appError?.message ?? "Failed to post Goods Issue Note.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });
    }
  };

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
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3, textAlign: "center" }}>
          Goods Issue Note (General Inventory)
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 3 }}>
          GIN Number is allocated by the server on commit - it is never entered manually.
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              label="SRN Number"
              size="small"
              fullWidth
              value={strnNumberInput}
              onChange={(e) => setStrnNumberInput(e.target.value)}
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
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setCommitErrorMessage(null)}>
            {commitErrorMessage}
          </Alert>
        )}

        {!isHeaderReady ? (
          <Alert severity="info" variant="outlined">
            Enter a known SRN number and click Look Up to load its requisitioned items.
          </Alert>
        ) : (
          <Box>
            <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
                {lookupResult.storeDescription} &middot; To Dept. {lookupResult.departmentCode}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {lines.length} line(s) loaded from SRN {lookupStrnNumber}
              </Typography>
            </Box>

            <GoodsIssueNoteLinesGrid lines={lines} setLines={setLines} />

            {hasOverBalanceLine && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                One or more lines are approaching or below minimum stock. A manager
                override may be required to proceed.
              </Alert>
            )}
          </Box>
        )}

        <Box sx={{ gap: 2, mt: 3, pt: 2, borderTop: "1px dashed rgba(139,147,161,0.3)", display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={handleReset}
            disabled={isSubmitting}
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
          >
            Confirm All Entries
          </Button>
        </Box>
      </Paper>

      <ConfirmDialog
        open={isConfirmDialogOpen}
        title="Confirm Goods Issue Note"
        message="Confirm all entries and post this Goods Issue Note? This decrements the store's stock ledger and closes the balance against the selected SRN."
        confirmLabel="Confirm & Post"
        confirmColor="primary"
        isConfirming={isSubmitting}
        onConfirm={handleConfirmCommit}
        onCancel={() => setIsConfirmDialogOpen(false)}
      />

      <ConfirmDialog
        open={isOverrideDialogOpen}
        title="Manager Override Required"
        message={
          <>
            {overrideMessage}
            <br />
            <br />A manager override is required to proceed. Confirm override and re-submit?
          </>
        }
        confirmLabel="Confirm Override"
        confirmColor="primary"
        isConfirming={isSubmitting}
        onConfirm={handleConfirmOverride}
        onCancel={() => setIsOverrideDialogOpen(false)}
      />
    </Box>
  );
}
