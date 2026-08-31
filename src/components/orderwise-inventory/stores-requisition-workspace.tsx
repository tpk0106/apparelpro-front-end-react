import { useState, useMemo } from "react";
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

// 1. Ensure you import your fresh lines spreadsheet component grid at the top:
import StoresRequisitionLinesGrid from "./stores-requisition-lines-grid";
import ConfirmDialog from "../common/confirm-dialog";

// Import your strict typescript interfaces contract shapes
import {
  type RequisitionLineItemRow,
  type StockItemAvailabilityDetails,
} from "./orderwise-inventory.types";
import { useCreateSTRNMutation } from "../../tanstack-hooks/orderwise-inventory-strn.hooks";
import type { AppError } from "../../auth/axiosClient";

// Import your existing live global lookups query hooks for standard contextual filters
import {
  useGetBuyersQuery,
  useGetAllPurchaseOrdersByBuyerCode,
} from "../../tanstack-hooks/custom-hooks";
import type { Buyer } from "../../interfaces/references/Buyer";
import { useGetAllDepartmentsQuery } from "../../tanstack-hooks/common.hooks";
import { DASHBOARD_COLORS } from "../dashboard/dashboard-theme";
import { useDropdownTheme } from "../../themes/useDropdownTheme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  workspaceHeadingSx,
  workspaceSectionLabelSx,
} from "../../themes/workspace-theme";

export default function StoresRequisitionWorkspace() {
  const { fieldSx: dropdownFieldSx, listboxSx: dropdownListboxSx } = useDropdownTheme();
  const dropdownMenuSlotProps = { select: { MenuProps: { slotProps: { paper: { sx: dropdownListboxSx } } } } };

  // 1. Central Transaction Mutation Hook
  const { mutateAsync: commitSTRN, isPending: isSubmitting } =
    useCreateSTRNMutation();

  // 2. Document Level Header Form States
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [selectedDept, setSelectedDept] = useState<string>("STR");
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  // 3. Spreadsheet Lines Collection Memory State Array
  const [lineItems, setLineItems] = useState<RequisitionLineItemRow[]>([]);
  const [rowStockBalances, setRowStockBalances] = useState<
    Record<number, StockItemAvailabilityDetails>
  >({});

  // Replaces window.confirm() with an in-app MUI dialog, and gives commit
  // failures a persistent inline home instead of only a transient toast -
  // per project convention: no native browser alert/confirm boxes, and all
  // errors must be displayed inline.
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [commitErrorMessage, setCommitErrorMessage] = useState<string | null>(
    null,
  );

  // 4. Fetch Master Filtering Datasets out of active RTK-Query Cache Layers
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
    () => buyerPageData?.items || [],
    [buyerPageData],
  );

  const { data: ordersList = [], isLoading: isOrdersLoading } =
    useGetAllPurchaseOrdersByBuyerCode(
      selectedBuyer?.buyerCode ?? 0,
      !!selectedBuyer,
    );

  const isHeaderValid =
    selectedBuyer && selectedOrder.trim() !== "" && selectedDept.trim() !== "";

  // Item Code is always required (rows are added explicitly, one at a time -
  // a blank row is genuinely incomplete). Quantity 0 is treated like RTN/GRN's
  // convention: a deliberate skip, so at least one row must be positive rather
  // than requiring every row to be.
  const hasIncompleteLines = lineItems.some((item) => !item.itemCode.trim());
  const hasAnyPositiveQuantity = lineItems.some((item) => item.quantity > 0);
  const hasAnyExceededBalance = lineItems.some((item, idx) => {
    const balance = rowStockBalances[idx];
    return balance
      ? Number(item.quantity) > balance.netAvailableBalance
      : false;
  });
  const isFormValid =
    !!isHeaderValid &&
    lineItems.length > 0 &&
    !hasIncompleteLines &&
    hasAnyPositiveQuantity &&
    lineItems.every((item) => item.quantity >= 0) &&
    !hasAnyExceededBalance;

  //1. DYNAMIC DATA LOOKUP: Pulls your seeded od_dept table records directly from SQL Server!
  const { data: dbDepartments = [], isLoading: isDeptsLoading } =
    useGetAllDepartmentsQuery();

  // const departmentsList = useMemo<Department[]>(
  //   () => departmentsPageData?.items || [],
  //   [departmentsPageData],
  // );

  const handleResetForm = () => {
    setSelectedBuyer(null);
    setSelectedOrder("");
    setSelectedDept("STR");
    setLineItems([]);
    setTransactionDate(new Date().toISOString().split("T")[0]);
    setCommitErrorMessage(null);
  };

  const handleAddBlankRow = () => {
    setLineItems((prev) => [
      ...prev,
      {
        stockCode: "",
        itemCode: "",
        // Basis is a distinct concept from the Issuing Department (selectedDept)
        // and must be picked explicitly per line via the Basis dropdown in the
        // lines grid - it used to default to the Department code here, which is
        // how Department codes like "MST"/"ST1" ended up saved as Basis values.
        storeCode: "",
        unit: "PCS",
        quantity: 0,
      },
    ]);
  };

  // 2. Validation gate - replaces window.confirm() with the MUI dialog below,
  // per project convention (no native browser confirm/alert boxes).
  const handleRequestCommit = () => {
    if (!selectedBuyer || !isFormValid) {
      toast.warning(
        "Validation Error: Resolve the outstanding line issues (missing items, zero quantities, or over-allocation) before confirming.",
      );
      return;
    }

    setCommitErrorMessage(null);
    setIsConfirmDialogOpen(true);
  };

  // 3. THE TRANS-ACTION SAVE COMMIT SUBMISSION HANDLER (Replicating Clipper lastkey() = 27 loops)
  const handleConfirmCommit = async () => {
    setIsConfirmDialogOpen(false);
    if (!selectedBuyer) return;

    // Trigger Toastify loading progress spinner instantly
    const toastId = toast.loading(
      "Saving Stores Requisition Note, updating stock balances...",
    );

    // Package your header envelope metadata alongside your detail line items array
    const payload = {
      header: {
        strnNumber: "", // Automatically generated on the C# server common service
        transactionDate,
        buyerCode: selectedBuyer.buyerCode,
        order: selectedOrder,
        departmentCode: selectedDept,
      },
      lines: lineItems
        .filter((item) => item.quantity > 0)
        .map((item) => ({
          stockCode: item.itemCode.substring(0, 2), // Extract material prefix (e.g. "02")
          itemCode: item.itemCode,
          storeCode: item.storeCode, // The Basis code
          unit: item.unit,
          quantity: item.quantity,
        })),
    };

    try {
      const response = await commitSTRN(payload);

      toast.update(toastId, {
        render:
          response.message ||
          "✓ Stores Requisition Note saved and allocated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 4000,
        closeButton: true,
      });

      handleResetForm(); // Fully clear the workspace view upon successful completion!
    } catch (err) {
      const appError = err as AppError;
      const serverMsg =
        appError?.message ||
        "Failed to process requisition transaction on SQL Server.";

      // Inline, persistent error - not just a transient toast - per project
      // convention: all errors must be displayed inline, no native alert box.
      setCommitErrorMessage(serverMsg);
      toast.update(toastId, {
        render: `🛑 ${serverMsg}`,
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
          borderTop: `4px solid ${DASHBOARD_COLORS.accent}`,
          backgroundColor: DASHBOARD_COLORS.pageBg,
        }}
      >
        <Typography variant="h5" sx={{ ...workspaceHeadingSx, mb: 3 }}>
          Stores Requisition Note (STRN)
        </Typography>

        {/* SECTION 1: DOCUMENT HEADER DATA CAPTURE TRACK PANEL - its own card,
            separate from the lines table below, matching the Dashboard's
            nested-card pattern (outer Paper -> inner Cards). */}
        <Box
          sx={{
            backgroundColor: DASHBOARD_COLORS.cardBg,
            border: `1px solid ${DASHBOARD_COLORS.border}`,
            borderRadius: "10px",
            p: 2,
            mb: 3,
          }}
        >
          <Grid container spacing={2}>
            {/* Input 1: Document Date */}
            <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
              <TextField
                type="date"
                label="Transaction Date"
                size="small"
                fullWidth
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={dropdownFieldSx}
              />
            </Grid>

            {/* Input 2: Dynamic Buyer Lookup */}
            <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
              <TextField
                select
                label="Select Buyer"
                size="small"
                fullWidth
                value={selectedBuyer ? String(selectedBuyer.buyerCode) : ""}
                onChange={(e) => {
                  const buyerObj = buyersList.find(
                    (b) => String(b.buyerCode) === e.target.value,
                  );
                  setSelectedBuyer(buyerObj || null);
                  setSelectedOrder(""); // Cascade reset downstream inputs
                }}
                disabled={isBuyersLoading}
                sx={dropdownFieldSx}
                slotProps={dropdownMenuSlotProps}
              >
                {buyersList.map((b) => (
                  <MenuItem key={b.buyerCode} value={String(b.buyerCode)}>
                    {b.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Input 3: Cascading Purchase Order Filter */}
            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
              <TextField
                select
                label="Select Order"
                size="small"
                fullWidth
                value={selectedOrder}
                onChange={(e) => setSelectedOrder(e.target.value)}
                disabled={!selectedBuyer || isOrdersLoading}
                sx={dropdownFieldSx}
                slotProps={dropdownMenuSlotProps}
              >
                {ordersList.map((orderStr) => (
                  <MenuItem key={orderStr} value={orderStr}>
                    {orderStr}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Input 4: 100% DYNAMIC DEPARTMENTS DROPDOWN LOOKUP (od_dept) */}
            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
              <TextField
                select
                label="Issuing Department"
                size="small"
                fullWidth
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                disabled={isDeptsLoading}
                sx={dropdownFieldSx}
                slotProps={dropdownMenuSlotProps}
              >
                {dbDepartments.map((dept) => (
                  <MenuItem key={dept.departmentCode} value={dept.departmentCode}>
                    {dept.name} [ {dept.departmentCode} ]
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>

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

        {/* SECTION 2: WORKSPACE ACCESSIBILITY GATE LOCK BANNER */}
        {!selectedBuyer || !isHeaderValid ? (
          <Alert
            severity="info"
            variant="outlined"
            sx={{ m: 2, fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}
            // sx={{
            //   fontWeight: "bold",
            //   borderLeft: "4px solid #0288d1",
            //   color: "#fff",
            //   backgroundColor: "",
            // }}
          >
            Please select a valid Transaction Date, Corporate Buyer reference,
            Purchase Order contract tracking ID, and Issuing Department to
            initialize the multi-item material spreadsheet matrix.
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
              <Typography variant="subtitle2" sx={workspaceSectionLabelSx}>
                Material Requisition Item Allocation
              </Typography>

              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<AddCircleOutlined />}
                onClick={handleAddBlankRow}
                sx={primaryActionButtonSx}
              >
                <span style={themedButtonLabelStyle}>Add Material Allocation Item</span>
              </Button>
            </Box>

            {/* Next, we will insert the interactive data entry lines spreadsheet component row grid container... */}
            <Typography
              variant="caption"
              sx={{
                mb: 1,
                fontStyle: "italic",
                color: DASHBOARD_COLORS.textSecondary,
                display: "block",
              }}
            >
              Active Target Context: Buyer {selectedBuyer.name} | Purchase Order
              Ref #{selectedOrder}
            </Typography>

            {/* SECTION 3: THE LINES TABLE - its own card, separate from the
                header filter card above, matching the Dashboard's nested-card
                pattern. */}
            <Box
              sx={{
                backgroundColor: DASHBOARD_COLORS.cardBg,
                border: `1px solid ${DASHBOARD_COLORS.border}`,
                borderRadius: "10px",
                p: 2,
              }}
            >
              <StoresRequisitionLinesGrid
                buyerCode={selectedBuyer.buyerCode}
                order={selectedOrder}
                lineItems={lineItems}
                setLineItems={setLineItems}
                rowStockBalances={rowStockBalances}
                setRowStockBalances={setRowStockBalances}
              />
            </Box>
          </Box>
        )}

        {/* SECTION 3: TRANSACTIONAL ACTION FOOTER CONTROL SWITCHBOARD BUTTONS -
            always rendered from initial page load, never hidden behind header
            or line-count checks. Only ever enabled/disabled via isFormValid. */}
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
            <span style={themedButtonLabelStyle}>Save Requisition Note</span>
          </Button>
        </Box>
      </Paper>

      <ConfirmDialog
        open={isConfirmDialogOpen}
        title="Confirm Stores Requisition Note"
        message={
          <>
            Confirm all entries and save this Stores Requisition Note? This
            will lock down allocated balances across your warehouse stock
            ledger pool for Buyer {selectedBuyer?.name} / Order{" "}
            {selectedOrder}.
          </>
        }
        confirmLabel="Confirm & Save"
        confirmColor="primary"
        isConfirming={isSubmitting}
        onConfirm={handleConfirmCommit}
        onCancel={() => setIsConfirmDialogOpen(false)}
      />
    </Box>
  );
}
