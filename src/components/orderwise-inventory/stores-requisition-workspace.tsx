import { useState, useMemo } from "react";
import {
  Box,
  // Card,
  TextField,
  Typography,
  Button,
  Paper,
  MenuItem,
  Alert,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";
// import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import { AddCircleOutlined } from "@mui/icons-material";
import SendIcon from "@mui/icons-material/Send";
import { toast } from "react-toastify";

// 1. Ensure you import your fresh lines spreadsheet component grid at the top:
import StoresRequisitionLinesGrid from "./stores-requisition-lines-grid";

// Import your strict typescript interfaces contract shapes
import {
  type RequisitionLineItemRow,
  // type RequisitionHeaderModel,
} from "./orderwise-inventory.types";
import { useCreateSRNMutation } from "../../services/order-wise-inventory.services";

// Import your existing live global lookups query hooks for standard contextual filters
import {
  useGetBuyersPagedQuery,
  useGetOrdersByBuyerQuery,
  //   Buyer,
} from "../../services/material-consumption.services";
import type { Buyer } from "../../interfaces/references/Buyer";
import {
  useGetAllDepartmentsQuery,
  // useGetDepartmentsPagedQuery,
} from "../../services/common.service";
// import type { Department } from "../../interfaces/references/Department";

export default function StoresRequisitionWorkspace() {
  // 1. Central Transaction Mutation Hook
  const [commitSRN, { isLoading: isSubmitting }] = useCreateSRNMutation();

  // 2. Document Level Header Form States
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [selectedDept, setSelectedDept] = useState<string>("STR");
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  // 3. Spreadsheet Lines Collection Memory State Array
  const [lineItems, setLineItems] = useState<RequisitionLineItemRow[]>([]);

  // 4. Fetch Master Filtering Datasets out of active RTK-Query Cache Layers
  const { data: buyerPageData, isLoading: isBuyersLoading } =
    useGetBuyersPagedQuery({
      pageIndex: 0,
      pageSize: 999,
      sortColumn: "name",
      sortOrder: "asc",
      filterColumn: null,
      filterQuery: null,
    });
  const buyersList = useMemo<Buyer[]>(
    () => buyerPageData?.items || [],
    [buyerPageData],
  );

  const { data: ordersList = [], isLoading: isOrdersLoading } =
    useGetOrdersByBuyerQuery(selectedBuyer?.buyerCode ?? 0, {
      skip: !selectedBuyer,
    });

  const isHeaderValid =
    selectedBuyer && selectedOrder.trim() !== "" && selectedDept.trim() !== "";
  // 1. DYNAMIC DATA LOOKUP: Pulls your seeded od_dept table records directly from SQL Server!
  // const { data: departmentsPageData, isLoading: isDeptsLoading } =
  //   useGetDepartmentsPagedQuery({
  //     pageIndex: 0,
  //     pageSize: 999,
  //     sortColumn: "name",
  //     sortOrder: "asc",
  //     filterColumn: null,
  //     filterQuery: null,
  //   });

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
  };

  const handleAddBlankRow = () => {
    setLineItems((prev) => [
      ...prev,
      {
        stockCode: "",
        itemCode: "",
        storeCode: selectedDept,
        unit: "PCS",
        quantity: 0,
      },
    ]);
  };

  // 2. THE TRANS-ACTION SAVE COMMIT SUBMISSION HANDLER (Replicating Clipper lastkey() = 27 loops)
  const handleCommitRequisition = async () => {
    if (!isHeaderValid || lineItems.length === 0) {
      toast.warning(
        "Validation Error: Cannot submit an empty or incomplete requisition manifest.",
      );
      return;
    }

    // Secondary safety pass: Scan the row inputs array to prevent any empty item strings
    const hasInvalidLines = lineItems.some(
      (item) => !item.itemCode.trim() || item.quantity <= 0,
    );
    if (hasInvalidLines) {
      toast.error(
        "Allocation Aborted: Please verify that all rows track valid Item Codes and quantities greater than zero.",
      );
      return;
    }

    const confirmationPrompt = `Confirm all entries and save Stores Requisition Note (SRN)?\n\nThis will lock down allocated balances across your warehouse stock ledger pool. Proceed?`;
    if (!window.confirm(confirmationPrompt)) return;

    // Trigger Toastify loading progress spinner instantly
    const toastId = toast.loading(
      "Saving Stores Requisition Note, updating stock balances...",
    );

    // Package your header envelope metadata alongside your detail line items array
    const payload = {
      header: {
        srnNumber: "", // Automatically generated on the C# server common service
        transactionDate,
        buyerCode: selectedBuyer.buyerCode,
        order: selectedOrder,
        departmentCode: selectedDept,
      },
      lines: lineItems.map((item) => ({
        stockCode: item.itemCode.substring(0, 2), // Extract material prefix (e.g. "02")
        itemCode: item.itemCode,
        storeCode: item.storeCode, // The Basis code
        unit: item.unit,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await commitSRN(payload).unwrap();

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
    } catch (err: any) {
      // Case-insensitive extractor handler transforms errors into descriptive warning toasters
      const serverMsg =
        err?.data?.Error ||
        err?.data?.error ||
        "Failed to process requisition transaction on SQL Server.";

      toast.update(toastId, {
        render: `🛑 ${serverMsg}`,
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });
    }
  };

  // const handleResetForm = () => {
  //   setSelectedBuyer(null);
  //   setSelectedOrder("");
  //   setSelectedDept("STR");
  //   setLineItems([]);
  //   setTransactionDate(new Date().toISOString().split("T")[0]);
  // };

  // const handleAddBlankRow = () => {
  //   setLineItems((prev) => [
  //     ...prev,
  //     {
  //       stockCode: "",
  //       itemCode: "",
  //       storeCode: selectedDept,
  //       unit: "PCS",
  //       quantity: 0,
  //     },
  //   ]);
  // };

  return (
    <Box sx={{ width: "100%", p: 1 }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderTop: "4px solid #1a237e",
          backgroundColor: "#fafafa",
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", color: "#1a237e", mb: 3 }}
        >
          Stores Requisition Note (SRN) Data Entry Dashboard
        </Typography>

        {/* SECTION 1: DOCUMENT HEADER DATA CAPTURE TRACK PANEL */}
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
            />
          </Grid>

          {/* Input 2: Dynamic Buyer Lookup */}
          <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
            <TextField
              select
              label="Select Corporate Buyer"
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
              label="Select Contract PO"
              size="small"
              fullWidth
              value={selectedOrder}
              onChange={(e) => setSelectedOrder(e.target.value)}
              disabled={!selectedBuyer || isOrdersLoading}
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
            >
              {dbDepartments.map((dept: any) => (
                <MenuItem key={dept.departmentCode} value={dept.departmentCode}>
                  {dept.name} [ {dept.departmentCode} ]
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* SECTION 2: WORKSPACE ACCESSIBILITY GATE LOCK BANNER */}
        {!isHeaderValid ? (
          <Alert
            severity="info"
            variant="outlined"
            sx={{ fontWeight: "bold", borderLeft: "4px solid #0288d1" }}
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
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: "bold",
                  color: "#1a237e",
                  textTransform: "uppercase",
                }}
              >
                Material Requisition Item Rows Log Allocation Sheets
              </Typography>

              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<AddCircleOutlined />}
                onClick={handleAddBlankRow}
              >
                [Ins] Append Material Allocation Line Item Row
              </Button>
            </Box>

            {/* Next, we will insert the interactive data entry lines spreadsheet component row grid container... */}
            <Typography
              variant="caption"
              sx={{
                mb: 1,
                fontStyle: "italic",
                color: "text.secondary",
                display: "block",
              }}
            >
              Active Target Context: Buyer {selectedBuyer?.name} | Purchase
              Order Ref #{selectedOrder}
            </Typography>

            {/* 🚀 INTEGRATED DETAIL LINES ENTRY GRID TABLE */}
            <StoresRequisitionLinesGrid
              buyerCode={selectedBuyer.buyerCode}
              order={selectedOrder}
              defaultStoreCode={selectedDept}
              lineItems={lineItems}
              setLineItems={setLineItems}
            />

            {/* SECTION 3: TRANSACTIONAL ACTION FOOTER CONTROL SWITCHBOARD BUTTONS */}
            {lineItems.length > 0 && (
              <Box
                sx={{
                  gap: 2,
                  mt: 3,
                  pt: 2,
                  borderTop: "1px dashed #ccc",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  variant="text"
                  color="secondary"
                  size="small"
                  onClick={handleResetForm}
                  disabled={isSubmitting}
                >
                  Cancel Note
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  startIcon={<SendIcon />}
                  onClick={handleCommitRequisition}
                  disabled={isSubmitting}
                >
                  [Save] Commit Requisition Matrix Note
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
