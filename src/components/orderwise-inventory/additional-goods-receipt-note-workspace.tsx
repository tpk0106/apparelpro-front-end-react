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
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";

import AdditionalGoodsReceiptNoteLinesGrid from "./additional-goods-receipt-note-lines-grid";
import ConfirmDialog from "../common/confirm-dialog";
import type {
  ArnLineItemRow,
  ArnSubmissionPayload,
} from "./additional-goods-receipt-note.types";
import { useCommitArnMutation } from "../../tanstack-hooks/additional-goods-receipt-note.hooks";
import {
  useGetBuyersQuery,
  useGetSubContractors,
  useGetCurrenciesQuery,
} from "../../tanstack-hooks/custom-hooks";
import type { AppError } from "../../auth/axiosClient";

const LOOKUP_PAGE = {
  pageIndex: 0,
  pageSize: 999,
  sortColumn: null,
  sortOrder: null,
  filterColumn: null,
  filterQuery: null,
};

const BLANK_ROW: ArnLineItemRow = {
  buyerCode: null,
  buyerName: "",
  order: "",
  additionalProcessCode: "",
  itemCode: "",
  unit: "",
  quantity: 0,
  price: 0,
  description: "",
  storeCode: "",
  toDateIssued: 0,
  toDateReceived: 0,
  isSemiFinishedGarment: false,
  receivableBalance: 0,
};

export default function AdditionalGoodsReceiptNoteWorkspace() {
  const [subContractorCode, setSubContractorCode] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [currency, setCurrency] = useState<string>("");
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [lines, setLines] = useState<ArnLineItemRow[]>([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [commitErrorMessage, setCommitErrorMessage] = useState<string | null>(null);

  const { data: buyerPageData, isLoading: isBuyersLoading } = useGetBuyersQuery({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "name",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const buyersList = buyerPageData?.items ?? [];

  const { data: subContractorPageData, isLoading: isSubContractorsLoading } =
    useGetSubContractors(LOOKUP_PAGE);
  const subContractorsList = subContractorPageData?.items ?? [];

  const { data: currencyPage, isLoading: isCurrenciesLoading } = useGetCurrenciesQuery(LOOKUP_PAGE);
  const currenciesList = currencyPage?.items ?? [];

  const { mutateAsync: commitArn, isPending: isSubmitting } = useCommitArnMutation();

  const isHeaderReady = !!subContractorCode && !!currency;

  const validLines = lines.filter((l) => l.buyerCode && l.order && l.itemCode && l.quantity > 0);
  const hasInvalidValue = lines.some(
    (l) => l.itemCode && (l.quantity < 0 || (l.isSemiFinishedGarment && l.quantity > l.receivableBalance)),
  );

  const isFormValid = isHeaderReady && validLines.length > 0 && !hasInvalidValue;

  const handleAddRow = () => {
    setLines((prev) => [...prev, { ...BLANK_ROW }]);
  };

  const handleReset = () => {
    setSubContractorCode("");
    setInvoiceNumber("");
    setCurrency("");
    setTransactionDate(new Date().toISOString().split("T")[0]);
    setLines([]);
    setCommitErrorMessage(null);
  };

  const handleRequestCommit = () => {
    setCommitErrorMessage(null);
    if (!isFormValid) {
      toast.warning("Resolve the outstanding validation issues before confirming.");
      return;
    }
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmCommit = async () => {
    setIsConfirmDialogOpen(false);

    const payload: ArnSubmissionPayload = {
      header: {
        transactionDate,
        subContractorCode,
        invoiceNumber: invoiceNumber || null,
        currency,
      },
      lines: validLines.map((l) => ({
        buyerCode: l.buyerCode as number,
        order: l.order,
        additionalProcessCode: l.additionalProcessCode,
        itemCode: l.itemCode,
        unit: l.unit,
        quantity: l.quantity,
        price: l.price,
      })),
    };

    const toastId = toast.loading("Posting Additional Goods Receipt Note, updating stock balances...");
    try {
      const response = await commitArn(payload);
      toast.update(toastId, {
        render: response.message || `✓ Additional Goods Receipt Note ${response.arnNumber} posted successfully!`,
        type: "success",
        isLoading: false,
        autoClose: 4000,
        closeButton: true,
      });
      handleReset();
    } catch (err) {
      const appError = err as AppError;
      const message = appError?.message ?? "Failed to post Additional Goods Receipt Note.";
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
      <Paper elevation={3} sx={{ p: 3, borderTop: "4px solid #60a5fa", backgroundColor: "#f9f9f9" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
          Additional Goods Receipt Note (ARN)
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 3, color: "#000000" }}>
          ARN Number is allocated by the server on commit — it is never entered manually. Receives processed
          goods back from a Sub Contractor. Unlike AIN, each line can target a different Buyer/Order/Process —
          add one row per item received.
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="Sub Contractor"
              size="small"
              fullWidth
              value={subContractorCode}
              onChange={(e) => {
                setSubContractorCode(e.target.value);
                setCommitErrorMessage(null);
              }}
              disabled={isSubContractorsLoading}
            >
              {subContractorsList.map((sc) => (
                <MenuItem key={sc.code} value={sc.code}>
                  {sc.code} - {sc.name}
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
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="Currency"
              size="small"
              fullWidth
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={isCurrenciesLoading}
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
              type="date"
              label="Date"
              size="small"
              fullWidth
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {commitErrorMessage && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setCommitErrorMessage(null)}>
            {commitErrorMessage}
          </Alert>
        )}

        {!isHeaderReady ? (
          <Alert severity="info" variant="outlined" sx={{ m: 2, fontWeight: "bold", color: "#1a237e" }}>
            Select the Sub Contractor and Currency this receipt is for.
          </Alert>
        ) : (
          <Box>
            <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleAddRow}>
                Add Item
              </Button>
              <Typography variant="caption" color="text.secondary">
                {lines.length} line(s) — {validLines.length} ready to post
              </Typography>
            </Box>

            <AdditionalGoodsReceiptNoteLinesGrid buyersList={buyersList} lineItems={lines} setLineItems={setLines} />

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
                sx={{ minWidth: 190, height: 32, color: "#8B93A1", borderColor: "#8B93A1" }}
              >
                Cancel ARN
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<SendIcon />}
                onClick={handleRequestCommit}
                disabled={isSubmitting || !isFormValid || isBuyersLoading}
                sx={{ minWidth: 190, height: 32 }}
              >
                Confirm All Entries
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      <ConfirmDialog
        open={isConfirmDialogOpen}
        title="Confirm Additional Goods Receipt Note"
        message={
          <>
            Confirm all entries and post this Additional Goods Receipt Note? This receives {validLines.length}{" "}
            item(s) from Sub Contractor {subContractorCode}.
          </>
        }
        confirmLabel="Confirm & Post"
        confirmColor="primary"
        isConfirming={isSubmitting}
        onConfirm={handleConfirmCommit}
        onCancel={() => setIsConfirmDialogOpen(false)}
      />
    </Box>
  );
}
