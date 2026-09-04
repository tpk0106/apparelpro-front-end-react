import { useMemo, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  MenuItem,
  Alert,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { AddCircleOutlined } from "@mui/icons-material";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";

import SupplierReturnNoteLinesGrid from "./supplier-return-note-lines-grid";
import ConfirmDialog from "../common/confirm-dialog";
import {
  GeneralSrtnStockType,
  type GeneralSrtnStockTypeValue,
  type GeneralSrtnLineItemRow,
} from "../../interfaces/general-inventory/general-srtn.types";
import type { GeneralStockItemAvailability } from "../../interfaces/general-inventory/general-inventory.types";
import { useCreateGeneralSRTNMutation } from "../../tanstack-hooks/general-inventory/general-srtn.hooks";
import { useGetGeneralStoresQuery } from "../../tanstack-hooks/general-inventory/general-inventory-strn.hooks";
import { useGetSuppliersQuery } from "../../tanstack-hooks/custom-hooks";
import type { Supplier } from "../../interfaces/references/Supplier";
import type { AppError } from "../../auth/axiosClient";
import { DASHBOARD_COLORS } from "../dashboard/dashboard-theme";
import { useDropdownTheme } from "../../themes/useDropdownTheme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  workspaceHeadingSx,
  workspaceSectionLabelSx,
  dateIconFieldSx,
} from "../../themes/workspace-theme";

const STOCK_TYPE_OPTIONS: { value: GeneralSrtnStockTypeValue; label: string }[] = [
  { value: GeneralSrtnStockType.Regular, label: "Regular" },
  { value: GeneralSrtnStockType.Damaged, label: "Damaged" },
];

// Replicates GI_SRN1.PRG's "SUPPLIER RETURN NOTE (General)" entry screen - Regular stock
// returns decrement QtyInHand/Value like a GIN; Damaged stock returns decrement only
// DamagedQuantity (the physical stock already left when it was written off via DGN).
export default function SupplierReturnNoteWorkspace() {
  const { fieldSx: dropdownFieldSx, listboxSx: dropdownListboxSx } = useDropdownTheme();
  const dropdownMenuSlotProps = { select: { MenuProps: { slotProps: { paper: { sx: dropdownListboxSx } } } } };
  const { mutateAsync: commitSRTN, isPending: isSubmitting } =
    useCreateGeneralSRTNMutation();

  const [selectedStore, setSelectedStore] = useState<string>("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [stockType, setStockType] = useState<GeneralSrtnStockTypeValue>(
    GeneralSrtnStockType.Regular,
  );
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  const [lineItems, setLineItems] = useState<GeneralSrtnLineItemRow[]>([]);
  const [rowStockBalances, setRowStockBalances] = useState<
    Record<number, GeneralStockItemAvailability>
  >({});

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [commitErrorMessage, setCommitErrorMessage] = useState<string | null>(
    null,
  );

  const { data: storesList = [], isLoading: isStoresLoading } =
    useGetGeneralStoresQuery();

  const { data: supplierPageData, isLoading: isSuppliersLoading } =
    useGetSuppliersQuery({
      pageIndex: 0,
      pageSize: 999,
      sortColumn: "name",
      sortOrder: "asc",
      filterColumn: null,
      filterQuery: null,
    });
  const suppliersList = useMemo<Supplier[]>(
    () => supplierPageData?.items ?? [],
    [supplierPageData],
  );

  const isHeaderValid =
    selectedStore.trim() !== "" && !!selectedSupplier;

  const hasIncompleteLines = lineItems.some((item) => !item.itemCode.trim());
  const hasAnyPositiveQuantity = lineItems.some((item) => item.quantity > 0);
  const hasAnyExceededBalance =
    stockType === GeneralSrtnStockType.Regular &&
    lineItems.some((item, idx) => {
      const balance = rowStockBalances[idx];
      return balance
        ? Number(item.quantity) > 0 && Number(item.quantity) > balance.netAvailableBalance
        : false;
    });
  const isFormValid =
    isHeaderValid &&
    lineItems.length > 0 &&
    !hasIncompleteLines &&
    hasAnyPositiveQuantity &&
    lineItems.every((item) => item.quantity >= 0) &&
    !hasAnyExceededBalance;

  const handleResetForm = () => {
    setSelectedStore("");
    setSelectedSupplier(null);
    setStockType(GeneralSrtnStockType.Regular);
    setLineItems([]);
    setRowStockBalances({});
    setTransactionDate(new Date().toISOString().split("T")[0]);
    setCommitErrorMessage(null);
  };

  const handleAddBlankRow = () => {
    setLineItems((prev) => [
      ...prev,
      { itemCode: "", unit: "PCS", quantity: 0 },
    ]);
  };

  const handleRequestCommit = () => {
    if (!isFormValid) {
      toast.warning(
        "Validation Error: Resolve the outstanding line issues (missing items, zero quantities, or over-allocation) before confirming.",
      );
      return;
    }
    setCommitErrorMessage(null);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmCommit = async () => {
    setIsConfirmDialogOpen(false);
    if (!selectedSupplier) return;

    const toastId = toast.loading(
      "Posting Supplier Return Note, updating stock balances...",
    );

    const payload = {
      header: {
        srtnNumber: "",
        transactionDate,
        storeCode: selectedStore,
        supplierCode: selectedSupplier.supplierCode,
        stockType,
      },
      lines: lineItems
        .filter((item) => item.quantity > 0)
        .map((item) => ({
          itemCode: item.itemCode,
          unit: item.unit,
          quantity: item.quantity,
        })),
    };

    try {
      const response = await commitSRTN(payload);
      toast.update(toastId, {
        render: response.message || "Supplier Return Note posted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 4000,
        closeButton: true,
      });
      handleResetForm();
    } catch (err) {
      const appError = err as AppError;
      const serverMsg =
        appError?.message || "Failed to post Supplier Return Note.";
      setCommitErrorMessage(serverMsg);
      toast.update(toastId, {
        render: serverMsg,
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });
    }
  };

  return (
    <Box sx={{ width: "100%", py: 1, px: 3 }}>
      <Paper elevation={3} sx={{ p: 3, backgroundColor: DASHBOARD_COLORS.pageBg }}>
        <Typography variant="h5" sx={{ ...workspaceHeadingSx, mb: 3 }}>
          Supplier Return Note (General Inventory)
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <TextField
              type="date"
              label="Transaction Date"
              size="small"
              fullWidth
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ ...dropdownFieldSx, ...(dateIconFieldSx as Record<string, unknown>) }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <TextField
              select
              label="From Stores"
              size="small"
              fullWidth
              value={selectedStore}
              onChange={(e) => {
                setSelectedStore(e.target.value);
                setLineItems([]);
                setRowStockBalances({});
              }}
              disabled={isStoresLoading}
              sx={dropdownFieldSx}
              slotProps={dropdownMenuSlotProps}
            >
              {storesList.map((s) => (
                <MenuItem key={s.code} value={s.code}>
                  {s.description} [{s.code}]
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
            <TextField
              select
              label="To Supplier"
              size="small"
              fullWidth
              value={selectedSupplier ? String(selectedSupplier.supplierCode) : ""}
              onChange={(e) => {
                const supplier =
                  suppliersList.find((s) => String(s.supplierCode) === e.target.value) ?? null;
                setSelectedSupplier(supplier);
              }}
              disabled={isSuppliersLoading}
              sx={dropdownFieldSx}
              slotProps={dropdownMenuSlotProps}
            >
              {suppliersList.map((s) => (
                <MenuItem key={s.supplierCode} value={String(s.supplierCode)}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
            <TextField
              select
              label="Stock Type"
              size="small"
              fullWidth
              value={stockType}
              onChange={(e) => {
                setStockType(e.target.value as GeneralSrtnStockTypeValue);
                setLineItems([]);
                setRowStockBalances({});
              }}
              sx={dropdownFieldSx}
              slotProps={dropdownMenuSlotProps}
            >
              {STOCK_TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {commitErrorMessage && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setCommitErrorMessage(null)}
          >
            {commitErrorMessage}
          </Alert>
        )}

        {!isHeaderValid ? (
          <Alert
            severity="info"
            variant="outlined"
            sx={{ m: 2, fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}
          >
            Select a Transaction Date, Stores and Supplier to start the return
            list.
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
                sx={workspaceSectionLabelSx}
              >
                Returned Items
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<AddCircleOutlined />}
                onClick={handleAddBlankRow}
                sx={primaryActionButtonSx}
              >
                <span style={themedButtonLabelStyle}>Add Item</span>
              </Button>
            </Box>

            <SupplierReturnNoteLinesGrid
              storeCode={selectedStore}
              stockType={stockType}
              lineItems={lineItems}
              setLineItems={setLineItems}
              rowStockBalances={rowStockBalances}
              setRowStockBalances={setRowStockBalances}
            />
          </Box>
        )}

        <Box
          sx={{
            gap: 2,
            mt: 3,
            pt: 2,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={handleResetForm}
            disabled={isSubmitting}
            sx={{ minWidth: 190, height: 32, color: "#8B93A1", borderColor: "#8B93A1" }}
          >
            Cancel Note
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<SendIcon />}
            onClick={handleRequestCommit}
            disabled={isSubmitting || !isFormValid}
            sx={{
              ...primaryActionButtonSx,
              minWidth: 190,
              height: 32,
              "&.Mui-disabled": {
                background: "rgba(139,147,161,0.15)",
                color: "#8B93A1",
                border: "1px solid rgba(139,147,161,0.4)",
                boxShadow: "none",
              },
            }}
          >
            <span style={themedButtonLabelStyle}>Save Supplier Return Note</span>
          </Button>
        </Box>
      </Paper>

      <ConfirmDialog
        open={isConfirmDialogOpen}
        title="Confirm Supplier Return Note"
        message="Confirm all entries and post this Supplier Return Note?"
        confirmLabel="Confirm & Post"
        confirmColor="primary"
        isConfirming={isSubmitting}
        onConfirm={handleConfirmCommit}
        onCancel={() => setIsConfirmDialogOpen(false)}
      />
    </Box>
  );
}
