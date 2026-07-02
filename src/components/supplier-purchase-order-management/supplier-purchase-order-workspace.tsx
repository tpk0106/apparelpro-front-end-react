import { useState, useMemo, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Alert,
  TextField,
  Button,
  CircularProgress,
  MenuItem,
  Card,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import MaterialReactTable, {
//   useMaterialReactTable,
//   type MRT_ColumnDef,
// } from "material-react-table";

// FIXED: Wrap MaterialReactTable inside curly braces to fix the call signature compiler error!
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";

import SupplierPOHeaderSelector from "./supplier-po-header-selector";
import type {
  SelectedPOContext,
  AvailableBudgetLine,
  PODetailItemRow,
  SupplierPOFormInputs,
} from "../../interfaces/OrderManagement/purchase-order-types";
import {
  useGetAllUnitsQuery,
  type UnitServiceModel,
} from "../../services/material-consumption.services";

// Import your custom RTK-Query mutation hook from your verified store services
import {
  useCommitSupplierPurchaseOrderMutation,
  useGetUnfulfilledBudgetLinesQuery,
} from "../../services/supplier-purchase-order.service";

export default function SupplierPurchaseOrderWorkspace() {
  // 1. Core Structural Workspace States
  const [poContext, setPoContext] = useState<SelectedPOContext | null>(null);
  const [activeBudgetLine, setActiveBudgetLine] =
    useState<AvailableBudgetLine | null>(null);

  // The temporary running array of line-items added to this active PO session
  const [poLineItems, setPoLineItems] = useState<PODetailItemRow[]>([]);

  // 2. Data Entry Sub-Form Input States
  const [form, setForm] = useState<SupplierPOFormInputs>({
    refNo: "",
    orderUnit: "",
    orderQuantity: "0",
    unitPrice: "0",
    exportDate: "",
    lcNo: "",
  });

  // 3. Dynamic Fetch Hooks Integration
  const [commitPO, { isLoading: isCommitting }] =
    useCommitSupplierPurchaseOrderMutation();

  // Fetch master system units for our order unit dropdown selector
  const { data: unitsPageData, isLoading: isUnitsLoading } =
    useGetAllUnitsQuery({
      pageIndex: 0,
      pageSize: 999,
      sortColumn: "code",
      sortOrder: "asc",
      filterColumn: null,
      filterQuery: null,
    });
  const systemUnits = useMemo(
    () => unitsPageData?.items || [],
    [unitsPageData],
  );

  useEffect(() => {
    console.log("units :", systemUnits);
  }, [systemUnits]);

  const { data: unfulfilledBudgetDetails, isLoading } =
    useGetUnfulfilledBudgetLinesQuery({
      buyerCode: poContext?.buyerCode || 0,
      order: poContext?.orderNumber || "",
    });

  const unfulfilledBudgetData = useMemo<AvailableBudgetLine[]>(() => {
    // if (!poContext) return [];
    return unfulfilledBudgetDetails || [];
  }, [unfulfilledBudgetDetails]);

  // Simulated in-memory lookup data array replacing your un-configured "getUnfulfilledBudgetLines" query hook
  // This automatically mocks the unfulfilled materials budget pool for style context tracking tests
  // const unfulfilledBudgetData1 = useMemo<AvailableBudgetLine[]>(() => {
  //   if (!poContext) return [];
  //   return [
  //     {
  //       itemCode: "0101FBA-SHLEAT.7MMB/MO",
  //       itemUnit: "YDS",
  //       balanceQuantity: 3500,
  //       typeCode: poContext.typeCode,
  //       styleCode: poContext.styleCode,
  //       description: "PREMIUM SHELL FABRIC (BLACK)",
  //     },
  //     {
  //       itemCode: "0201ZIA-NYLON5MMBLAK",
  //       itemUnit: "PCS",
  //       balanceQuantity: 2941,
  //       typeCode: poContext.typeCode,
  //       styleCode: poContext.styleCode,
  //       description: "NYLON SHIELD FASTENER ZIPPERS",
  //     },
  //     {
  //       itemCode: "0202BTA-PLAS4HOL24LNV",
  //       itemUnit: "PCS",
  //       balanceQuantity: 14112,
  //       typeCode: poContext.typeCode,
  //       styleCode: poContext.styleCode,
  //       description: "NAVY BLUE PLASTIC 4-HOLE BUTTONS",
  //     },
  //   ];
  // }, [poContext]);

  // 4. In-Memory Sub-Form Reset Guard Pass
  const [prevLineKey, setPrevLineKey] = useState<string | null>(null);
  const currentLineKey = activeBudgetLine ? activeBudgetLine.itemCode : "EMPTY";

  if (currentLineKey !== prevLineKey) {
    setPrevLineKey(currentLineKey);
    setForm({
      refNo: poContext?.purchaseNumber || "",
      orderUnit: activeBudgetLine?.itemUnit || "",
      orderQuantity: "0",
      unitPrice: "0",
      exportDate: "",
      lcNo: "",
    });
  }

  const handleInputChange = (
    field: keyof SupplierPOFormInputs,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // --- INTERACTION WORKFLOW ACTIONS ---

  const handleAddLineToSessionList = () => {
    if (!poContext || !activeBudgetLine || Number(form.orderQuantity) <= 0)
      return;

    // Budget Limit Cap Guard: Prevent the operator from over-purchasing against the style profile
    if (Number(form.orderQuantity) > activeBudgetLine.balanceQuantity) {
      alert(
        `Procurement Aborted: Incoming Order Quantity (${form.orderQuantity}) exceeds the calculated remaining budget limit (${activeBudgetLine.balanceQuantity} ${activeBudgetLine.itemUnit}).`,
      );
      return;
    }

    // const newLineRow: PODetailItemRow = {
    //   poNo: poContext.purchaseNumber,
    //   buyer: poContext.buyerCode,
    //   order: poContext.orderNumber,
    //   type: poContext.typeCode,
    //   style: poContext.styleCode,
    //   itemCode: activeBudgetLine.itemCode,
    //   refNo: form.refNo.toUpperCase(),
    //   orderUnit: form.orderUnit,
    //   orderQuantity: Number(form.orderQuantity),
    //   unitPrice: Number(form.unitPrice),
    //   exportDate: form.exportDate,
    //   lcNo: form.lcNo.toUpperCase(),
    //   balance: Number(form.orderQuantity),
    // };

    const newLineRow = {
      poNo: poContext.purchaseNumber,
      buyer: poContext.buyerCode,
      order: poContext.orderNumber,
      type: poContext.typeCode,
      style: poContext.styleCode,
      itemCode: activeBudgetLine?.itemCode, // Passes "0202BTWOOD4SMRED" for inventory records

      // FIXED: Explicitly pass your individual features out of your active state selection context!
      feature1: activeBudgetLine?.feature1 || "WOOD",
      feature2: activeBudgetLine?.feature2 || "4",
      feature3: activeBudgetLine?.feature3 || "SM",
      feature4: activeBudgetLine?.feature4 || "RED",

      refNo: form.refNo.toUpperCase(),
      orderUnit: form.orderUnit,
      orderQuantity: Number(form.orderQuantity),
      unitPrice: Number(form.unitPrice),
      exportDate: form.exportDate,
      lcNo: form.lcNo.toUpperCase(),
      balance: Number(form.orderQuantity),
    };

    setPoLineItems((prev) => [...prev, newLineRow]);
    setActiveBudgetLine(null); // Clear the entry panel seamlessly to prepare for the next row selection
  };

  const handleCommitPoToDatabase = async () => {
    if (!poContext || poLineItems.length === 0) return;

    try {
      await commitPO({
        header: poContext,
        lineItems: poLineItems,
      }).unwrap();

      alert(
        `Supplier Purchase Order [${poContext.purchaseNumber}] saved and committed to SQL Server tables atomically!`,
      );
      setPoLineItems([]);
      setPoContext(null);
    } catch (err) {
      console.log(err);
      alert(
        "Failed to commit purchase order transaction on the C# backend server.",
      );
    }
  };

  // --- MATERIAL REACT TABLE BLUEPRINTS FOR VISIBLE SELECTION GRIDS ---

  const leftColumns = useMemo<MRT_ColumnDef<AvailableBudgetLine>[]>(
    () => [
      {
        accessorKey: "itemCode",
        header: "Item Code ID",
        size: 120,
        muiTableBodyCellProps: {
          sx: { fontFamily: "monospace", fontWeight: "bold" },
        },
      },
      {
        accessorKey: "balanceQuantity",
        header: "Budget Bal.",
        size: 90,
        Cell: ({ cell, row }) =>
          `${cell.getValue<number>().toLocaleString()} ${row.original.itemUnit}`,
      },
    ],
    [],
  );

  const leftTable = useMaterialReactTable({
    columns: leftColumns,
    data: unfulfilledBudgetData,
    enablePagination: false,
    enableSorting: true,
    enableTopToolbar: false,
    initialState: { density: "compact" },
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => setActiveBudgetLine(row.original),
      sx: {
        cursor: "pointer",
        "&:hover": { backgroundColor: "#e8eaf6 !important" },
      },
    }),
  });

  return (
    <Box sx={{ width: "100%", p: 1 }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: "bold", color: "#1a237e", mb: 2 }}
      >
        Supplier Purchase Order Entry Module
      </Typography>

      {/* Mount your completed type-safe selector card component */}
      <SupplierPOHeaderSelector
        onHeaderContextLock={(context) => {
          setPoContext(context);
          setPoLineItems([]);
        }}
      />

      {poContext ? (
        <Box>
          <Grid container spacing={3}>
            {/* Left Flank Panel: Remaining Style Material Budget Checklist */}
            <Grid size={{ xs: 12, md: 4.5 }}>
              <Paper elevation={2} sx={{ p: 2, minHeight: "400px" }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: "bold", color: "#1a237e", mb: 1.5 }}
                >
                  Available Material Budget Thresholds (bal_qty &gt; 0)
                </Typography>
                <MaterialReactTable table={leftTable} />
              </Paper>
            </Grid>

            {/* Right Flank Panel: Supplier Line Procurement Input Form */}
            <Grid size={{ xs: 12, md: 7.5 }}>
              <Paper elevation={2} sx={{ p: 2, minHeight: "400px" }}>
                {activeBudgetLine ? (
                  <Card
                    variant="outlined"
                    sx={{ p: 2, border: "1px solid #1a237e" }}
                  >
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{ fontWeight: "bold", mb: 2 }}
                    >
                      Procuring: {activeBudgetLine.description} (
                      {activeBudgetLine.itemCode})
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Reference Number"
                          size="small"
                          fullWidth
                          value={form.refNo}
                          onChange={(e) =>
                            handleInputChange("refNo", e.target.value)
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          select
                          label="Order Unit"
                          size="small"
                          fullWidth
                          value={form.orderUnit}
                          onChange={(e) =>
                            handleInputChange("orderUnit", e.target.value)
                          }
                        >
                          {systemUnits.map((u: UnitServiceModel) => (
                            <MenuItem key={u.id} value={u.code}>
                              {u.code} ({u.description})
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Order Quantity"
                          type="number"
                          size="small"
                          fullWidth
                          value={form.orderQuantity}
                          onChange={(e) =>
                            handleInputChange("orderQuantity", e.target.value)
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Unit Purchase Price"
                          type="number"
                          size="small"
                          fullWidth
                          value={form.unitPrice}
                          onChange={(e) =>
                            handleInputChange("unitPrice", e.target.value)
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Delivery / Export Date"
                          type="date"
                          size="small"
                          fullWidth
                          value={form.exportDate}
                          onChange={(e) =>
                            handleInputChange("exportDate", e.target.value)
                          }
                          slotProps={{ inputLabel: { shrink: true } }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Bank LC Number"
                          size="small"
                          fullWidth
                          value={form.lcNo}
                          onChange={(e) =>
                            handleInputChange("lcNo", e.target.value)
                          }
                        />
                      </Grid>
                    </Grid>

                    <Box
                      sx={{
                        mt: 3,
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<AddShoppingCartIcon />}
                        onClick={handleAddLineToSessionList}
                        disabled={Number(form.orderQuantity) <= 0}
                      >
                        Stage PO Line Item
                      </Button>
                    </Box>
                  </Card>
                ) : (
                  <Box
                    sx={{
                      height: "320px",
                      color: "text.secondary",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body1">
                      ← Select an open material threshold line from the left
                      panel budget sheet to configure procurement pricing.
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Bottom Summary Panel: Running Staged Purchase Order Spreadsheet Matrix */}
          <Paper elevation={3} sx={{ p: 2, mt: 3 }}>
            <Box
              sx={{
                mb: 2,
                display: "flex",
                justifyContent: "space:between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: "bold", color: "#1a237e" }}
              >
                [ RUNNING SUMMARY - STAGED PURCHASE ORDER DETAIL LINES ]
              </Typography>

              {/* Master Database Transaction Commit Button */}
              <Button
                variant="contained"
                color="success"
                startIcon={
                  isCommitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <CheckCircleIcon />
                  )
                }
                disabled={poLineItems.length === 0 || isCommitting}
                onClick={handleCommitPoToDatabase}
              >
                {isCommitting
                  ? "Transmitting..."
                  : `Commit P/O [${poContext.purchaseNumber}]`}
              </Button>
            </Box>

            {poLineItems.length === 0 ? (
              <Alert severity="warning" variant="outlined">
                No procurement detail rows have been staged yet. Highlight a
                material on the left and input contract metrics to add lines to
                this session.
              </Alert>
            ) : (
              <Box
                sx={{
                  border: "1px solid #dee2e6",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#f8f9fa",
                        borderBottom: "2px solid #dee2e6",
                        color: "#1a237e",
                      }}
                    >
                      <th style={{ padding: "10px" }}>Item Code ID</th>
                      <th style={{ padding: "10px" }}>Ref No</th>
                      <th style={{ padding: "10px" }}>Ordered Qty</th>
                      <th style={{ padding: "10px" }}>Unit Price</th>
                      <th style={{ padding: "10px" }}>Delivery Date</th>
                      <th style={{ padding: "10px" }}>LC Number</th>
                      <th
                        style={{ padding: "10px", textTransform: "uppercase" }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {poLineItems.map((item, index) => (
                      <tr
                        key={`${item.itemCode}-${index}`}
                        style={{ borderBottom: "1px solid #dee2e6" }}
                      >
                        <td
                          style={{
                            padding: "10px",
                            fontFamily: "monospace",
                            fontWeight: "bold",
                          }}
                        >
                          {item.itemCode}
                        </td>
                        <td style={{ padding: "10px" }}>{item.refNo}</td>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>
                          {item.orderQuantity.toLocaleString()} {item.orderUnit}
                        </td>
                        <td
                          style={{ padding: "10px", fontFamily: "monospace" }}
                        >
                          ${item.unitPrice.toFixed(4)}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {item.exportDate || "-"}
                        </td>
                        <td
                          style={{ padding: "10px", fontFamily: "monospace" }}
                        >
                          {item.lcNo || "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          <Button
                            size="small"
                            color="error"
                            variant="text"
                            onClick={() =>
                              setPoLineItems((prev) =>
                                prev.filter((_, idx) => idx !== index),
                              )
                            }
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            )}
          </Paper>
        </Box>
      ) : (
        <Alert
          severity="info"
          variant="outlined"
          sx={{ mt: 2, fontWeight: "bold" }}
        >
          Please select a valid P/O Mode, Supplier, Store, Currency, Buyer, and
          Order to initialize the procurement workspace.
        </Alert>
      )}
    </Box>
  );
}
