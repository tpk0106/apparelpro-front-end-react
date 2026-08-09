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

import AdditionalIssueNoteLinesGrid from "./additional-issue-note-lines-grid";
import ConfirmDialog from "../common/confirm-dialog";
import type {
  AinLineItemRow,
  AinSubmissionPayload,
} from "./additional-issue-note.types";
import {
  useGetIssuableStockByBuyerOrderQuery,
  useCommitAinMutation,
} from "../../tanstack-hooks/additional-issue-note.hooks";
import {
  useGetBuyersQuery,
  useGetAllPurchaseOrdersByBuyerCode,
  useGetSubContractors,
  useGetAdditionalCosts,
} from "../../tanstack-hooks/custom-hooks";
import type { Buyer } from "../../interfaces/references/Buyer";
import type { AppError } from "../../auth/axiosClient";

const LOOKUP_PAGE = {
  pageIndex: 0,
  pageSize: 999,
  sortColumn: null,
  sortOrder: null,
  filterColumn: null,
  filterQuery: null,
};

export default function AdditionalIssueNoteWorkspace() {
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [subContractorCode, setSubContractorCode] = useState<string>("");
  const [additionalProcessCode, setAdditionalProcessCode] =
    useState<string>("");
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [lines, setLines] = useState<AinLineItemRow[]>([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [commitErrorMessage, setCommitErrorMessage] = useState<string | null>(
    null,
  );

  const { data: buyerPageData, isLoading: isBuyersLoading } =
    useGetBuyersQuery({
      pageIndex: 0,
      pageSize: 999,
      sortColumn: "name",
      sortOrder: "asc",
      filterColumn: null,
      filterQuery: null,
    });
  const buyersList = useMemo<Buyer[]>(
    () => buyerPageData?.items ?? [],
    [buyerPageData],
  );

  const { data: ordersList = [], isLoading: isOrdersLoading } =
    useGetAllPurchaseOrdersByBuyerCode(
      selectedBuyer?.buyerCode ?? 0,
      !!selectedBuyer,
    );

  const { data: subContractorPageData, isLoading: isSubContractorsLoading } =
    useGetSubContractors(LOOKUP_PAGE);
  const subContractorsList = subContractorPageData?.items ?? [];

  // Additional Process is an Additional Cost code (od_aitm equivalent) - the server
  // validates on commit that this Buyer/Order actually has this process assigned
  // (via GarmentAdditionalCosts), so this picker shows the full catalog rather than
  // a pre-filtered-by-order list - no such filtered lookup endpoint exists yet, and
  // per the Zero-Assumption Boundary Rule one isn't being invented here. Any
  // mismatch surfaces as the server's own inline error on commit.
  const { data: additionalCostPageData, isLoading: isAdditionalCostsLoading } =
    useGetAdditionalCosts(LOOKUP_PAGE);
  const additionalCostsList = additionalCostPageData?.items ?? [];

  const {
    data: issuableStock,
    isFetching: isStockLoading,
    error: stockLookupError,
  } = useGetIssuableStockByBuyerOrderQuery(
    { buyerCode: selectedBuyer?.buyerCode ?? 0, order: selectedOrder },
    !!selectedBuyer && !!selectedOrder,
  );

  const { mutateAsync: commitAin, isPending: isSubmitting } =
    useCommitAinMutation();

  const isHeaderReady =
    !!selectedBuyer &&
    !!selectedOrder &&
    !!subContractorCode &&
    !!additionalProcessCode &&
    !!issuableStock;

  // Populate the grid the instant a lookup succeeds, defaulting the editable Qty to
  // Issue to 0 - AIN issues an EXTRA quantity on top of what has already been
  // issued, so unlike SAN (which defaults to the current on-hand count) there is no
  // sensible non-zero default here. Adjusts state during render itself, matching
  // the established GTN/RTN/SRN/DGN/SAN convention.
  const [syncedIssuableStock, setSyncedIssuableStock] = useState(issuableStock);
  if (issuableStock !== syncedIssuableStock) {
    setSyncedIssuableStock(issuableStock);
    setLines(
      issuableStock
        ? issuableStock.map((s) => ({
            storeCode: s.storeCode,
            itemCode: s.itemCode,
            unit: s.unit,
            description: s.description,
            orderedQuantity: s.orderedQuantity,
            shadowBalance: s.shadowBalance,
            toDateIssued: s.toDateIssued,
            qtyInHand: s.qtyInHand,
            availableForIssue: s.availableForIssue,
            quantity: 0,
          }))
        : [],
    );
  }

  // Only rows the operator actually entered a quantity for are ever submitted.
  const changedLines = useMemo(
    () => lines.filter((l) => l.quantity > 0),
    [lines],
  );

  const hasInvalidValue = lines.some(
    (l) => l.quantity < 0 || l.quantity > l.availableForIssue,
  );

  const isFormValid =
    isHeaderReady &&
    lines.length > 0 &&
    changedLines.length > 0 &&
    !hasInvalidValue;

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
    setSubContractorCode("");
    setAdditionalProcessCode("");
    setLines([]);
    setTransactionDate(new Date().toISOString().split("T")[0]);
    setCommitErrorMessage(null);
  };

  const handleRequestCommit = () => {
    if (!issuableStock) return;
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
    if (!selectedBuyer) return;

    const payload: AinSubmissionPayload = {
      header: {
        buyerCode: selectedBuyer.buyerCode,
        order: selectedOrder,
        transactionDate,
        subContractorCode,
        additionalProcessCode,
      },
      lines: changedLines.map((l) => ({
        storeCode: l.storeCode,
        itemCode: l.itemCode,
        unit: l.unit,
        quantity: l.quantity,
      })),
    };

    const toastId = toast.loading(
      "Posting Additional Issue Note, updating stock balances...",
    );
    try {
      const response = await commitAin(payload);
      toast.update(toastId, {
        render:
          response.message ||
          `✓ Additional Issue Note ${response.ainNumber} posted successfully!`,
        type: "success",
        isLoading: false,
        autoClose: 4000,
        closeButton: true,
      });
      handleReset();
    } catch (err) {
      const appError = err as AppError;
      const message =
        appError?.message ?? "Failed to post Additional Issue Note.";
      // Inline, persistent error - not just a transient toast - per project
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
          Additional Issue Note (AIN)
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 3, color: "#000000" }}
        >
          AIN Number is allocated by the server on commit — it is never entered
          manually. Issues extra raw material against this Buyer/Order to a Sub
          Contractor for an Additional Process already assigned to the order.
          Qty to Issue defaults to 0 for every item; only rows you enter a
          quantity for are submitted, capped at the Available column (order
          allocation headroom and physical stock on hand, whichever is lower).
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              select
              label="Additional Process"
              size="small"
              fullWidth
              value={additionalProcessCode}
              onChange={(e) => {
                setAdditionalProcessCode(e.target.value);
                setCommitErrorMessage(null);
              }}
              disabled={isAdditionalCostsLoading}
            >
              {additionalCostsList.map((ac) => (
                <MenuItem key={ac.code} value={ac.code}>
                  {ac.code} - {ac.description}
                </MenuItem>
              ))}
            </TextField>
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

        {!selectedBuyer || !selectedOrder ? (
          <Alert
            severity="info"
            variant="outlined"
            sx={{ m: 2, fontWeight: "bold", color: "#1a237e" }}
          >
            Select a Buyer and Order to load items that can be issued.
          </Alert>
        ) : !subContractorCode || !additionalProcessCode ? (
          <Alert
            severity="info"
            variant="outlined"
            sx={{ m: 2, fontWeight: "bold", color: "#1a237e" }}
          >
            Select the Sub Contractor and Additional Process this issue is for.
          </Alert>
        ) : !issuableStock ? (
          <Alert
            severity="info"
            variant="outlined"
            sx={{ m: 2, fontWeight: "bold", color: "#1a237e" }}
          >
            Loading issuable stock...
          </Alert>
        ) : issuableStock.length === 0 ? (
          <Alert
            severity="info"
            variant="outlined"
            sx={{ m: 2, fontWeight: "bold", color: "#1a237e" }}
          >
            Nothing is currently available to issue for this Buyer/Order.
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
                Issuable Stock Lines
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {lines.length} line(s) loaded for Order {selectedOrder} —{" "}
                {changedLines.length} to issue
              </Typography>
            </Box>

            <AdditionalIssueNoteLinesGrid lines={lines} setLines={setLines} />

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
                Cancel AIN
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
        title="Confirm Additional Issue Note"
        message={
          <>
            Confirm all entries and post this Additional Issue Note? This
            issues {changedLines.length} item(s) to Sub Contractor{" "}
            {subContractorCode} for Buyer {selectedBuyer?.name} / Order{" "}
            {selectedOrder}.
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
