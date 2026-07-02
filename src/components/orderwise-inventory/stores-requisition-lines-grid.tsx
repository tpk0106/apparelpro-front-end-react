import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  MenuItem,
  IconButton,
  Typography,
  //   Badge,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

// Import your strict, validated type interfaces
import type {
  RequisitionLineItemRow,
  StockItemAvailabilityDetails,
} from "./orderwise-inventory.types";
import {
  useGetAvailableStockChoicesQuery,
  useLazyVerifyStockItemAvailabilityQuery,
} from "../../services/order-wise-inventory.services";

// Import global master lookup reference hook to populate the Unit select dropdown cell
import {
  useGetAllUnitsQuery,
  type UnitServiceModel,
} from "../../services/material-consumption.services";

// 1. Ensure you import the Autocomplete component near the top of StoresRequisitionLinesGrid.tsx:
// import Autocomplete from "@mui/material/Autocomplete";

interface LinesGridProps {
  buyerCode: number;
  order: string;
  defaultStoreCode: string;
  lineItems: RequisitionLineItemRow[];
  setLineItems: React.Dispatch<React.SetStateAction<RequisitionLineItemRow[]>>;
}

export default function StoresRequisitionLinesGrid({
  buyerCode,
  order,
  defaultStoreCode,
  lineItems,
  setLineItems,
}: LinesGridProps) {
  // 1. Central Asynchronous Trigger Hook: Runs lazy vertical inventory balance checks on cellular blur
  const [triggerStockCheck] = useLazyVerifyStockItemAvailabilityQuery();

  // Local state container caching live balance metrics row-by-row to show warnings beneath textboxes
  const [rowStockBalances, setRowStockBalances] = useState<
    Record<number, StockItemAvailabilityDetails>
  >({});

  // 2. Fetch all available stock options for this order to drive the lookup dropdown choices
  // (Assuming you have an existing stock lookup query hook registered in your services layer)
  // Stream the live selections map array from the C# backend on demand
  const { data: stockChoicesList = [], isLoading: isStockLoading } =
    useGetAvailableStockChoicesQuery(
      { buyerCode, order, storeCode: defaultStoreCode },
      { skip: buyerCode === 0 || !order || !defaultStoreCode },
    );

  useEffect(() => {
    console.log("stock Choice: ", stockChoicesList);
    console.log("default store code: ", defaultStoreCode);
  });

  // ... Inside your table lines mapping loop (.map((row, idx) => {)):

  // 2. Query System Reference Units to populate the Unit column selection dropdowns
  const { data: unitsPageData } = useGetAllUnitsQuery({
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

  // --- CELL-LEVEL WORKFLOW VALIDATION PASSES ---

  const handleUpdateLineCell = (
    index: number,
    field: keyof RequisitionLineItemRow,
    value: any,
  ) => {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveRow = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
    setRowStockBalances((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  // 🚀 CLIPPER STOCK BALANCE RECONCILIATION: Fires instantly when an item code or store code loses focus!
  const handleExecuteCellBlurCheck = async (
    index: number,
    currentLine: RequisitionLineItemRow,
  ) => {
    const rawCode = currentLine.itemCode.trim();
    const basisCode = currentLine.storeCode.trim().toUpperCase();
    const currentUnit = currentLine.unit.trim().toUpperCase();

    // Skip validation until both basic coordinates are explicitly entered into the cells
    if (rawCode.length < 3 || basisCode === "") return;

    // Separate the category stock code (first 2 chars) from the item code tracking parameters safely
    // const stockPrefix = rawCode.substring(0, 2);
    // const mainItemCode = rawCode.substring(2);

    try {
      // Trigger the lazy network promise to fetch live balances out of OrderwiseStocks
      const stockDetails = await triggerStockCheck({
        buyerCode,
        order,
        storeCode: basisCode, // Maps storeCode to your Basis context column
        itemCode: rawCode, // Full code lookup match string
        targetUnit: currentUnit,
      }).unwrap();

      if (stockDetails) {
        // Cache the live row summary metric into component memory to update on-screen badges
        setRowStockBalances((prev) => ({ ...prev, [index]: stockDetails }));
      }
    } catch (err) {
      console.warn(
        "Inventory check skipped or item not tracked yet in stock ledger pools:",
        err,
      );
    }
  };
  return (
    <Box sx={{ width: "100%", overflowX: "auto", mt: 2 }}>
      <Table size="small" sx={{ minWidth: 650, border: "1px solid #e0e0e0" }}>
        <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold", width: "30%" }}>
              Item Code
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", width: "15%" }}>
              Basis (Store)
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", width: "15%" }}>
              Unit
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", width: "20%" }}>
              Requested Qty
            </TableCell>
            <TableCell
              sx={{ fontWeight: "bold", width: "10%", textAlign: "center" }}
            >
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lineItems.map((row, idx) => {
            // Unpack cached vertical database balance metrics for this row index if present
            const balanceMetrics = rowStockBalances[idx];
            const hasExceededBalance =
              balanceMetrics &&
              Number(row.quantity) > balanceMetrics.netAvailableBalance;

            return (
              <TableRow
                key={idx}
                sx={{
                  backgroundColor: hasExceededBalance ? "#fff3e0" : "inherit",
                  "&:hover": { backgroundColor: "#fcfcfc" },
                }}
              >
                {/* Cell 1: Item Code Input Input */}

                {/* Cell 1: REPLACED THE BLIND TEXTFIELD WITH AN AUTOCOMPLETE SEARCH SELECTION CARD */}

                {/* Cell 1: FIXED REFACTOR — Auto-populating drop-down list displays all items instantly for the user! */}
                <TableCell>
                  <TextField
                    select
                    size="small"
                    variant="standard"
                    fullWidth
                    value={row.itemCode}
                    disabled={isStockLoading || stockChoicesList.length === 0}
                    onChange={(e) => {
                      const selectedItemCode = e.target.value;
                      const matchedDbItem = stockChoicesList.find(
                        (opt: any) => opt.itemCode === selectedItemCode,
                      );

                      if (matchedDbItem) {
                        // AUTOMATED REQUISITION FILL-OUT: Instantly populates your spreadsheet columns!
                        handleUpdateLineCell(
                          idx,
                          "itemCode",
                          matchedDbItem.itemCode,
                        );
                        handleUpdateLineCell(
                          idx,
                          "storeCode",
                          defaultStoreCode,
                        );
                        handleUpdateLineCell(
                          idx,
                          "unit",
                          matchedDbItem.unit || "PCS",
                        );

                        // Fire your cell blur validator using the verified database choice parameters
                        const updatedRow = {
                          stockCode: matchedDbItem.itemCode.substring(0, 2),
                          itemCode: matchedDbItem.itemCode,
                          storeCode: defaultStoreCode,
                          unit: matchedDbItem.unit || "PCS",
                          quantity: row.quantity,
                        };
                        handleExecuteCellBlurCheck(idx, updatedRow);
                      }
                    }}
                  >
                    {stockChoicesList.map((item: any) => (
                      <MenuItem key={item.itemCode} value={item.itemCode}>
                        {item.itemCode} — {item.description}
                      </MenuItem>
                    ))}
                  </TextField>

                  {/* Live inventory balance indicator text badges continue perfectly below */}
                  {balanceMetrics && (
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 0.5,
                        fontWeight: "bold",
                        color: hasExceededBalance ? "#d32f2f" : "#2e7d32",
                        display: "block",
                      }}
                    >
                      {balanceMetrics.description} (Avail:{" "}
                      {balanceMetrics.netAvailableBalance.toLocaleString()}{" "}
                      {balanceMetrics.unit})
                    </Typography>
                  )}
                </TableCell>
                {/* <TableCell>
                  <Autocomplete
                    options={stockChoicesList}
                    loading={isStockLoading}
                    // Displays both the code and the readable name together (e.g. "0202BT - BLUE PLASTIC BUTTONS")
                    getOptionLabel={(option: any) =>
                      option ? `${option.itemCode} - ${option.description}` : ""
                    }
                    value={
                      stockChoicesList.find(
                        (opt: any) => opt.itemCode === row.itemCode,
                      ) || null
                    }
                    onChange={(_, selectedOption: any) => {
                      if (selectedOption) {
                        // AUTOMATED FILL-OUT: Pulls the correct parameters straight out of your database selection row!
                        handleUpdateLineCell(
                          idx,
                          "itemCode",
                          selectedOption.itemCode,
                        );
                        handleUpdateLineCell(
                          idx,
                          "storeCode",
                          selectedOption.storeCode || defaultStoreCode,
                        );
                        handleUpdateLineCell(
                          idx,
                          "unit",
                          selectedOption.unit || "PCS",
                        );

                        
                        const completedRow = {
                          stockCode: selectedOption.stockCode,
                          itemCode: selectedOption.itemCode,
                          storeCode:
                            selectedOption.storeCode || defaultStoreCode,
                          unit: selectedOption.unit || "PCS",
                          quantity: row.quantity,
                        };
                        handleExecuteCellBlurCheck(idx, completedRow);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Search Item Code or Description... [F1]"
                        size="small"
                        variant="standard"
                        fullWidth
                        slotProps={{
                          htmlInput: {
                            ...params.inputProps,
                            style: {
                              fontSize: "13px",
                              fontFamily: "monospace",
                            },
                          },
                        }}
                      />
                    )}
                  />

                  
                  {balanceMetrics && (
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 0.5,
                        fontWeight: "bold",
                        color: hasExceededBalance ? "#d32f2f" : "#2e7d32",
                        display: "block",
                      }}
                    >
                      {balanceMetrics.description} (Avail:{" "}
                      {balanceMetrics.netAvailableBalance.toLocaleString()}{" "}
                      {balanceMetrics.unit})
                    </Typography>
                  )}
                </TableCell> */}

                {/* <TableCell>
                  <TextField
                    size="small"
                    variant="standard"
                    fullWidth
                    placeholder="e.g., 0202BT"
                    value={row.itemCode}
                    onChange={(e) =>
                      handleUpdateLineCell(
                        idx,
                        "itemCode",
                        e.target.value.toUpperCase(),
                      )
                    }
                    onBlur={() => handleExecuteCellBlurCheck(idx, row)}
                    slotProps={{
                      htmlInput: {
                        style: {
                          fontSize: "13px",
                          fontFamily: "monospace",
                          textTransform: "uppercase",
                        },
                      },
                    }}
                  />
                  {balanceMetrics && (
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 0.5,
                        fontWeight: "bold",
                        color: hasExceededBalance ? "#d32f2f" : "#2e7d32",
                        display: "block",
                      }}
                    >
                      {balanceMetrics.description} (Avail:{" "}
                      {balanceMetrics.netAvailableBalance.toLocaleString()}{" "}
                      {balanceMetrics.unit})
                    </Typography>
                  )}
                </TableCell> */}

                {/* Cell 2: Basis Store Code Input */}
                <TableCell>
                  <TextField
                    size="small"
                    variant="standard"
                    fullWidth
                    placeholder="STR"
                    value={row.storeCode}
                    onChange={(e) =>
                      handleUpdateLineCell(
                        idx,
                        "storeCode",
                        e.target.value.toUpperCase(),
                      )
                    }
                    onBlur={() => handleExecuteCellBlurCheck(idx, row)}
                    slotProps={{
                      htmlInput: {
                        style: {
                          fontSize: "13px",
                          textTransform: "uppercase",
                          maxLength: 3,
                        },
                      },
                    }}
                  />
                </TableCell>

                {/* Cell 3: Unit Selection Dropdown Menu Selector */}
                <TableCell>
                  <TextField
                    select
                    size="small"
                    variant="standard"
                    fullWidth
                    value={row.unit}
                    onChange={(e) => {
                      handleUpdateLineCell(idx, "unit", e.target.value);
                      // Force re-evaluation of balances under the newly targeted unit type context
                      const modifiedRow = { ...row, unit: e.target.value };
                      handleExecuteCellBlurCheck(idx, modifiedRow);
                    }}
                    slotProps={{ htmlInput: { style: { fontSize: "13px" } } }}
                  >
                    {systemUnits.map((u: UnitServiceModel) => (
                      <MenuItem key={u.id} value={u.code}>
                        {u.code}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>

                {/* Cell 4: Requested Quantity Weight Input Box */}
                <TableCell>
                  <TextField
                    type="number"
                    size="small"
                    variant="standard"
                    fullWidth
                    value={row.quantity === 0 ? "" : row.quantity}
                    onChange={(e) =>
                      handleUpdateLineCell(
                        idx,
                        "quantity",
                        Number(e.target.value),
                      )
                    }
                    error={Boolean(hasExceededBalance)}
                    slotProps={{
                      htmlInput: {
                        style: { fontSize: "13px", fontFamily: "monospace" },
                        min: 0,
                      },
                    }}
                  />
                  {hasExceededBalance && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ fontWeight: "bold", display: "block", mt: 0.5 }}
                    >
                      ⚠️ Allocation Deficit: Attempt to exceed balance quantity!
                    </Typography>
                  )}
                </TableCell>

                {/* Cell 5: Action Purge Row Button Control */}
                <TableCell sx={{ textAlign: "center" }}>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => handleRemoveRow(idx)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {lineItems.length === 0 && (
        <Box
          sx={{
            p: 3,
            textAlign: "center",
            border: "1px dashed #ccc",
            borderTop: "none",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            The requisition list is currently empty. Click the button above to
            add a line item.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
