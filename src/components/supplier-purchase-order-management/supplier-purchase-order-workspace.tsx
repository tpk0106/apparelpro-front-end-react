import { useState, useMemo } from "react";
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
import LockIcon from "@mui/icons-material/Lock";
import { toast } from "react-toastify";

// Import standard Redux Toolkit Query error type structures to eliminate generic 'any' blocks completely
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
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
import { useGetUnits } from "../../tanstack-hooks/custom-hooks";
import type { Unit } from "../../interfaces/references/Unit";

// Import your custom RTK-Query mutation hook from your verified store services
import {
  useCommitSupplierPurchaseOrderMutation,
  useGetUnfulfilledBudgetLinesQuery,
} from "../../services/order-management/supplier-purchase-order.service";

// Helper Type Guard to safely check and extract strings out of backend network errors without 'any' overrides
function extractErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
): string {
  if (!error) return "An unexpected network communication anomaly occurred.";
  if (
    "data" in error &&
    error.data &&
    typeof error.data === "object" &&
    "Error" in error.data
  ) {
    return String((error.data as { Error: string }).Error);
  }
  if ("message" in error && error.message) return error.message;
  return "Failed to complete transaction on the C# database server.";
}

export default function SupplierPurchaseOrderWorkspace() {
  // 1. Core Structural Workspace States
  const [poContext, setPoContext] = useState<SelectedPOContext | null>(null);
  const [activeBudgetLine, setActiveBudgetLine] =
    useState<AvailableBudgetLine | null>(null);

  // Persists on screen after a save completes and the form resets for the
  // next entry, so the assigned P/O number isn't only visible in a toast
  // that's easy to miss/dismiss too fast to read.
  const [lastSavedPoNumber, setLastSavedPoNumber] = useState<string | null>(
    null,
  );

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
  const { data: unitsPageData, isLoading: isUnitsLoading } = useGetUnits({
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
      toast.error(
        `Procurement Aborted: Incoming Order Quantity (${form.orderQuantity}) exceeds the calculated remaining budget limit (${activeBudgetLine.balanceQuantity} ${activeBudgetLine.itemUnit}).`,
        { autoClose: 8000 },
      );
      return;
    }

    // Trim Sheet Approval Guard: this is a convenience check only - the real,
    // enforced gate is the server-side check inside SaveSupplierPurchaseOrderAsync,
    // which re-verifies this at commit time regardless of what happens here.
    if (!activeBudgetLine.isStyleApproved) {
      toast.error(
        `Cannot add this line: the Trim Sheet for Style '${activeBudgetLine.styleCode}' has not been approved yet. Approve the Material Consumption sheet for this style first.`,
        { autoClose: 8000 },
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
      // The response carries back the confirmed PurchaseNumber - for a new
      // P/O this is the number the backend allocated server-side, not
      // whatever (if anything) was staged in poContext beforehand.
      const result = await commitPO({
        header: poContext,
        lineItems: poLineItems,
      }).unwrap();

      toast.success(
        `Supplier Purchase Order [${result.purchaseNumber}] saved and committed successfully.`,
        { autoClose: 6000 },
      );
      setLastSavedPoNumber(result.purchaseNumber);
      setPoLineItems([]);
      setPoContext(null);
    } catch (err) {
      console.log(err);
      toast.error(
        extractErrorMessage(err as FetchBaseQueryError | SerializedError),
        { autoClose: 6000 },
      );
    }
  };

  // --- MATERIAL REACT TABLE BLUEPRINTS FOR VISIBLE SELECTION GRIDS ---

  // Shared match check for "is this the row currently loaded into the entry
  // form" - used both for the row-level highlight and, since a column's own
  // muiTableBodyCellProps completely replaces (not merges with) the
  // table-level default, for the itemCode column below that defines its own
  // cell props (mirrors the identical convention already used in
  // ConsumptionLedgerGrid/MaterialMasterList for the same reason).
  const isRowSelected = (row: AvailableBudgetLine): boolean =>
    !!activeBudgetLine && row.itemCode === activeBudgetLine.itemCode;

  const leftColumns = useMemo<MRT_ColumnDef<AvailableBudgetLine>[]>(
    () => [
      {
        accessorKey: "itemCode",
        header: "Item Code ID",
        size: 120,
        muiTableBodyCellProps: ({ row }) => ({
          sx: {
            fontFamily: "monospace",
            fontWeight: "bold",
            ...(isRowSelected(row.original) && {
              backgroundColor: "#ffca28 !important",
              color: "#3e2723 !important",
            }),
          },
        }),
      },
      {
        // The specific material type (e.g. "BUTTON"/"FABRIC"/"ZIPPER") next to the
        // raw ItemCode so operators don't have to decode the composite code by eye.
        accessorKey: "mainMaterialName",
        header: "Main Material",
        size: 100,
      },
      {
        accessorKey: "balanceQuantity",
        header: "Budget Bal.",
        size: 90,
        Cell: ({ cell, row }) =>
          `${cell.getValue<number>().toLocaleString()} ${row.original.itemUnit}`,
      },
      {
        // Trim Sheet Approval status - informational (see isStyleApproved on
        // AvailableBudgetLine); the real gate is server-side at commit time.
        accessorKey: "isStyleApproved",
        header: "Approval",
        size: 90,
        Cell: ({ cell }) =>
          cell.getValue<boolean>() ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "success.main",
              }}
            >
              <CheckCircleIcon fontSize="small" />
              <Typography variant="caption">Approved</Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "text.disabled",
              }}
            >
              <LockIcon fontSize="small" />
              <Typography variant="caption">Not Approved</Typography>
            </Box>
          ),
      },
    ],
    // activeBudgetLine is a dependency (not []) because the itemCode column's
    // muiTableBodyCellProps closes over isRowSelected(), which itself closes
    // over activeBudgetLine - without this dependency the column defs (and
    // that closure) would freeze at their initial mount-time value and the
    // selected-row highlight would never update after the first click.
    [activeBudgetLine],
  );

  const leftTable = useMaterialReactTable({
    columns: leftColumns,
    data: unfulfilledBudgetData,
    enablePagination: false,
    enableSorting: true,
    enableTopToolbar: false,
    initialState: { density: "compact" },
    muiTableBodyRowProps: ({ row }) => {
      const isSelected = isRowSelected(row.original);
      return {
        onClick: () => setActiveBudgetLine(row.original),
        sx: {
          cursor: "pointer",
          "&:hover": { backgroundColor: "#e8eaf6 !important" },
          // Grey out lines whose Style hasn't completed Trim Sheet Approval yet -
          // still clickable (the toast guard above explains why when they try),
          // but visually distinct so most operators won't bother selecting them.
          ...(!row.original.isStyleApproved && {
            opacity: 0.5,
            fontStyle: "italic",
          }),
          // Persistent highlight for whichever line is currently loaded into
          // the entry form on the right - matches the amber-highlight
          // convention already used for the active selection elsewhere
          // (ConsumptionLedgerGrid/MaterialMasterList). Row-level sx alone
          // isn't reliable in this MRT setup, so the same highlight is also
          // applied per-cell below via muiTableBodyCellProps.
          ...(isSelected && {
            borderLeft: "4px solid #e65100 !important",
          }),
        },
      };
    },
    // Table-level default cell highlight for the selected row - a column's
    // own muiTableBodyCellProps (itemCode, above) completely replaces this
    // rather than merging with it, which is why itemCode re-declares the
    // same highlight itself.
    muiTableBodyCellProps: ({ row }) => ({
      sx: {
        ...(isRowSelected(row.original) && {
          backgroundColor: "#ffca28 !important",
          color: "#3e2723 !important",
          fontWeight: "bold",
        }),
      },
    }),
    // Fluid grid layout: columns scale to fit the container width instead of the
    // default fixed-pixel layout, which forced horizontal scrolling once the 4
    // columns' declared sizes summed past this panel's available width (same fix
    // already used for the Material Consumption ledger grid - see Workflow
    // Conventions doc, "ledger grid too wide" fix).
    layoutMode: "grid",
    muiTableContainerProps: {
      sx: { maxWidth: "100%" },
    },
  });

  const bottomColumns = useMemo<MRT_ColumnDef<PODetailItemRow>[]>(
    () => [
      {
        accessorKey: "itemCode",
        header: "Item Code ID",
        size: 160,
        muiTableBodyCellProps: {
          sx: { fontFamily: "monospace", fontWeight: "bold" },
        },
      },
      { accessorKey: "refNo", header: "Ref No", size: 100 },
      {
        accessorKey: "orderQuantity",
        header: "Ordered Qty",
        size: 130,
        Cell: ({ cell, row }) =>
          `${cell.getValue<number>().toLocaleString()} ${row.original.orderUnit}`,
      },
      {
        accessorKey: "unitPrice",
        header: "Unit Price",
        size: 110,
        Cell: ({ cell }) => `$${cell.getValue<number>().toFixed(4)}`,
        muiTableBodyCellProps: { sx: { fontFamily: "monospace" } },
      },
      {
        accessorKey: "exportDate",
        header: "Delivery Date",
        size: 130,
        Cell: ({ cell }) => cell.getValue<string>() || "-",
      },
      {
        accessorKey: "lcNo",
        header: "LC Number",
        size: 120,
        Cell: ({ cell }) => cell.getValue<string>() || "-",
        muiTableBodyCellProps: { sx: { fontFamily: "monospace" } },
      },
    ],
    [],
  );

  const bottomTable = useMaterialReactTable({
    columns: bottomColumns,
    data: poLineItems,
    enablePagination: false,
    enableSorting: false,
    enableTopToolbar: false,
    enableColumnActions: false,
    enableColumnFilters: false,
    enableRowActions: true,
    positionActionsColumn: "last",
    displayColumnDefOptions: {
      "mrt-row-actions": { header: "Actions", size: 90 },
    },
    renderRowActions: ({ row }) => (
      <Button
        size="small"
        color="error"
        variant="text"
        onClick={() =>
          setPoLineItems((prev) => prev.filter((_, idx) => idx !== row.index))
        }
      >
        Remove
      </Button>
    ),
    initialState: { density: "compact" },
  });

  return (
    <Box sx={{ width: "100%", p: 1 }}>
      <Typography
        variant="h5"
        align="center"
        sx={{
          fontWeight: "bold",
          color: "#1a237e",
          mb: 2,
          mt: 1,
        }}
      >
        Supplier Purchase Order Entry
      </Typography>

      {lastSavedPoNumber && (
        <Alert
          severity="success"
          variant="filled"
          sx={{ mb: 2, fontWeight: "bold" }}
          onClose={() => setLastSavedPoNumber(null)}
        >
          Last Created P/O No: {lastSavedPoNumber}
        </Alert>
      )}

      {/* Mount your completed type-safe selector card component */}
      <SupplierPOHeaderSelector
        confirmedPurchaseNumber={lastSavedPoNumber}
        onHeaderContextLock={(context) => {
          setPoContext(context);
          setPoLineItems([]);
          setLastSavedPoNumber(null);
        }}
      />

      {poContext ? (
        <Box>
          {/* Moved here 2026-08-03 (was inside the bottom Running Summary panel,
              only visible after scrolling past the table+form below) so the
              guidance is visible immediately, between the header selector above
              and the table/form below, with no scrolling needed. */}
          {poLineItems.length === 0 && (
            // Text/border forced to black (2026-08-03) - the default MUI "warning"
            // outlined palette (amber-on-transparent) was hard to read against this
            // card's light surface; kept the horizontal margin (mx) so it doesn't
            // run flush against the card edges like the header selector above it.
            <Alert
              severity="warning"
              variant="outlined"
              sx={{
                mb: 3,
                mx: 2,
                color: "#000000",
                borderColor: "#000000",
                "& .MuiAlert-icon": { color: "#000000" },
              }}
            >
              No procurement detail rows have been staged yet. Highlight a
              material on the left and input contract metrics to add lines to
              this session.
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Left Flank Panel: Remaining Style Material Budget Checklist */}
            {/* Widened from md:4.5 to md:7 (2026-08-03) - the 4 columns (Item Code,
                Main Material, Budget Bal., Approval) were forcing horizontal scroll
                at the old width; the right form panel was narrowed to match and its
                fields switched to a single stacked column below. */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper elevation={2} sx={{ p: 2, minHeight: "400px" }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: "bold", color: "#ffffff", mb: 1.5 }}
                >
                  Available Material Budget Thresholds (bal_qty &gt; 0)
                </Typography>
                <MaterialReactTable table={leftTable} />
              </Paper>
            </Grid>

            {/* Right Flank Panel: Supplier Line Procurement Input Form */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper elevation={2} sx={{ p: 2, minHeight: "400px" }}>
                {activeBudgetLine ? (
                  <Card
                    variant="outlined"
                    sx={{
                      p: 2,
                      border: "1px solid #1a237e",
                      backgroundColor: "#f9f9f9",
                    }}
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
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="Reference Number"
                          size="small"
                          fullWidth
                          value={form.refNo}
                          onChange={(e) =>
                            handleInputChange("refNo", e.target.value)
                          }
                          // FIXED (2026-08-07): capped to match PODetails.RefNo's varchar(30)
                          // column - a longer value was previously accepted here and threw a SQL
                          // truncation error only when the Supplier PO was saved.
                          slotProps={{
                            htmlInput: {
                              maxLength: 30,
                            },
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
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
                          {systemUnits.map((u: Unit) => (
                            <MenuItem key={u.id} value={u.code}>
                              {u.code} ({u.description})
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
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
                      <Grid size={{ xs: 12 }}>
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
                      <Grid size={{ xs: 12 }}>
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
                      <Grid size={{ xs: 12 }}>
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

          {/* Bottom Summary Panel: Running Staged Purchase Order Spreadsheet Matrix.
              Only rendered once at least one line is staged - the "nothing staged
              yet" guidance now lives above the table/form (see the Alert above),
              so there's nothing useful for this panel to show before then. */}
          {poLineItems.length > 0 && (
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
                  disabled={isCommitting}
                  onClick={handleCommitPoToDatabase}
                >
                  {isCommitting
                    ? "Transmitting..."
                    : poContext.purchaseNumber
                      ? `Commit P/O [${poContext.purchaseNumber}]`
                      : "Commit New P/O"}
                </Button>
              </Box>

              <MaterialReactTable table={bottomTable} />
            </Paper>
          )}
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
