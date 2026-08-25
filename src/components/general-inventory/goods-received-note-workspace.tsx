import { useState } from "react";
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
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";

import GoodsReceivedNoteLinesGrid from "./goods-received-note-lines-grid";
import ConfirmDialog from "../common/confirm-dialog";
import type {
  GeneralGrnLineItemRow,
  GeneralGrnSubmissionPayload,
} from "../../interfaces/general-inventory/general-grn.types";
import {
  useGetReceivableLinesByPoQuery,
  useCommitGeneralGrnMutation,
} from "../../tanstack-hooks/general-inventory/general-grn.hooks";
import { useGetCurrenciesQuery } from "../../tanstack-hooks/custom-hooks";
import type { AppError } from "../../auth/axiosClient";

// Replicates GI_GRN1.PRG's "GOODS RECEIVED NOTE (General)" entry screen - always raised
// against exactly one General Purchase Order. Store is a per-line field here (GI's PO
// can span multiple stores), unlike Orderwise's single-store-per-PO GRN.
export default function GoodsReceivedNoteWorkspace() {
  const [poNumberInput, setPoNumberInput] = useState("");
  const [lookupPoNumber, setLookupPoNumber] = useState("");
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [supplierCode, setSupplierCode] = useState("");
  const [currencyCode, setCurrencyCode] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [lines, setLines] = useState<GeneralGrnLineItemRow[]>([]);

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
  } = useGetReceivableLinesByPoQuery(lookupPoNumber, !!lookupPoNumber);

  const { mutateAsync: commitGrn, isPending: isSubmitting } =
    useCommitGeneralGrnMutation();

  const { data: currencyPageData } = useGetCurrenciesQuery({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: null,
    sortOrder: null,
    filterColumn: null,
    filterQuery: null,
  });
  const currenciesList = currencyPageData?.items ?? [];

  const isHeaderReady = !!lookupResult;

  const handleLookup = () => {
    const trimmed = poNumberInput.trim();
    if (!trimmed) {
      toast.warning("Enter a P/O number to look up.");
      return;
    }
    setLookupPoNumber(trimmed);
  };

  // Populate the grid + prefill Supplier/Currency the instant a lookup succeeds -
  // both stay freely editable afterward, matching legacy's confirmable-but-overridable
  // prompts. Adjusts state during render itself (the React-docs "adjusting state when a
  // prop changes" pattern) rather than via useEffect.
  const [syncedLookupResult, setSyncedLookupResult] = useState(lookupResult);
  if (lookupResult !== syncedLookupResult) {
    setSyncedLookupResult(lookupResult);
    setSupplierCode(lookupResult?.supplierCode ?? "");
    setCurrencyCode(lookupResult?.currencyCode ?? "");
    setLines(
      lookupResult
        ? lookupResult.lines.map((l) => ({
            storeCode: l.storeCode,
            itemCode: l.itemCode,
            description: l.description,
            unit: l.unit,
            quantity: 0,
            price: 0,
            orderQuantity: l.orderQuantity,
            balance: l.balance,
            qtyInHand: l.qtyInHand,
            maxStock: l.maxStock,
          }))
        : [],
    );
  }

  const hasExceededMaxStock = lines.some(
    (l) => l.qtyInHand + l.quantity > l.maxStock,
  );
  const isFormValid =
    isHeaderReady &&
    supplierCode.trim() !== "" &&
    currencyCode.trim() !== "" &&
    lines.length > 0 &&
    lines.some((l) => l.quantity > 0) &&
    lines.every((l) => l.quantity >= 0 && (l.quantity === 0 || l.price > 0));

  const handleReset = () => {
    setPoNumberInput("");
    setLookupPoNumber("");
    setSupplierCode("");
    setCurrencyCode("");
    setInvoiceNumber("");
    setLines([]);
    setTransactionDate(new Date().toISOString().split("T")[0]);
    setCommitErrorMessage(null);
  };

  const submit = async (maxStockOverrideConfirmed: boolean) => {
    if (!lookupResult) return;

    const payload: GeneralGrnSubmissionPayload = {
      header: {
        grnNumber: "",
        poNumber: lookupPoNumber,
        transactionDate,
        supplierCode,
        currencyCode,
        invoiceNumber: invoiceNumber || undefined,
      },
      lines: lines
        .filter((l) => l.quantity > 0)
        .map((l) => ({
          storeCode: l.storeCode,
          itemCode: l.itemCode,
          unit: l.unit,
          quantity: l.quantity,
          price: l.price,
        })),
      maxStockOverrideConfirmed,
    };

    const toastId = toast.loading(
      "Posting Goods Received Note, updating stock balances...",
    );
    try {
      const response = await commitGrn(payload);
      toast.update(toastId, {
        render: response.message || "Goods Received Note posted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 4000,
        closeButton: true,
      });
      handleReset();
    } catch (err) {
      const appError = err as AppError;
      // 409 = MaxStockOverrideRequiredException from the server.
      if (appError.status === 409) {
        toast.dismiss(toastId);
        setOverrideMessage(appError.message);
        setIsOverrideDialogOpen(true);
        return;
      }
      setCommitErrorMessage(
        appError?.message ?? "Failed to post Goods Received Note.",
      );
      toast.update(toastId, {
        render: appError?.message ?? "Failed to post Goods Received Note.",
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
          Goods Received Note (General Inventory)
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 3 }}>
          GRN Number is allocated by the server on commit - it is never entered manually.
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="P/O Number"
              size="small"
              fullWidth
              value={poNumberInput}
              onChange={(e) => setPoNumberInput(e.target.value)}
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
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
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
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              label="Supplier Code"
              size="small"
              fullWidth
              value={supplierCode}
              onChange={(e) => setSupplierCode(e.target.value)}
              disabled={!isHeaderReady}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <TextField
              select
              label="Currency"
              size="small"
              fullWidth
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value)}
              disabled={!isHeaderReady}
            >
              {currenciesList.map((c) => (
                <MenuItem key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Invoice No"
              size="small"
              fullWidth
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              disabled={!isHeaderReady}
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
            Enter a known P/O number and click Look Up to load its items.
          </Alert>
        ) : (
          <Box>
            <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
                Material Lines
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {lines.length} line(s) loaded from P/O {lookupPoNumber}
              </Typography>
            </Box>

            <GoodsReceivedNoteLinesGrid lines={lines} setLines={setLines} />

            {hasExceededMaxStock && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                One or more lines exceed maximum stock. You'll be asked to confirm on submit.
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
            Cancel GRN
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
        title="Confirm Goods Received Note"
        message="Confirm all entries and post this Goods Received Note? This increases physical stock on hand."
        confirmLabel="Confirm & Post"
        confirmColor="primary"
        isConfirming={isSubmitting}
        onConfirm={handleConfirmCommit}
        onCancel={() => setIsConfirmDialogOpen(false)}
      />

      <ConfirmDialog
        open={isOverrideDialogOpen}
        title="Maximum Stock Exceeded"
        message={
          <>
            {overrideMessage}
            <br />
            <br />
            Continue anyway?
          </>
        }
        confirmLabel="Continue"
        confirmColor="primary"
        isConfirming={isSubmitting}
        onConfirm={handleConfirmOverride}
        onCancel={() => setIsOverrideDialogOpen(false)}
      />
    </Box>
  );
}
