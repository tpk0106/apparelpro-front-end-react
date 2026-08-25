import React, { useMemo } from "react";
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import type { GeneralGtnLineItemRow } from "../../interfaces/general-inventory/general-gtn.types";
import type { GeneralStockItemAvailability } from "../../interfaces/general-inventory/general-inventory.types";
import {
  useGetAvailableGeneralStockChoicesQuery,
  useVerifyGeneralStockItemAvailabilityMutation,
} from "../../tanstack-hooks/general-inventory/general-inventory-strn.hooks";
import { useGetUnits } from "../../tanstack-hooks/custom-hooks";
import type { Unit } from "../../interfaces/references/Unit";

interface LinesGridProps {
  fromStoreCode: string;
  lineItems: GeneralGtnLineItemRow[];
  setLineItems: React.Dispatch<React.SetStateAction<GeneralGtnLineItemRow[]>>;
  rowStockBalances: Record<number, GeneralStockItemAvailability>;
  setRowStockBalances: React.Dispatch<
    React.SetStateAction<Record<number, GeneralStockItemAvailability>>
  >;
}

// Item picker and live balance check reuse the STRN endpoints - the "available
// balance" GTN needs to respect (QtyInHand - ShadowBalance on the From Stores)
// is exactly what STRN's own reservation check already computes.
export default function GoodsTransferNoteLinesGrid({
  fromStoreCode,
  lineItems,
  setLineItems,
  rowStockBalances,
  setRowStockBalances,
}: LinesGridProps) {
  const { mutateAsync: triggerStockCheck } =
    useVerifyGeneralStockItemAvailabilityMutation();

  const { data: stockChoicesList = [], isLoading: isStockLoading } =
    useGetAvailableGeneralStockChoicesQuery(fromStoreCode, !!fromStoreCode);

  const { data: unitsPageData } = useGetUnits({
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

  const usedItemCodes = useMemo(
    () =>
      new Set(
        lineItems.map((item) => item.itemCode).filter((code) => code.trim() !== ""),
      ),
    [lineItems],
  );

  const handleUpdateLineCell = (
    index: number,
    field: keyof GeneralGtnLineItemRow,
    value: string | number,
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

  const handleExecuteCellBlurCheck = async (
    index: number,
    currentLine: GeneralGtnLineItemRow,
  ) => {
    const itemCode = currentLine.itemCode.trim();
    const currentUnit = currentLine.unit.trim().toUpperCase();
    if (!itemCode || !fromStoreCode) return;

    try {
      const stockDetails = await triggerStockCheck({
        storeCode: fromStoreCode,
        itemCode,
        targetUnit: currentUnit,
      });
      if (stockDetails) {
        setRowStockBalances((prev) => ({ ...prev, [index]: stockDetails }));
      }
    } catch {
      // Item not tracked, or the balance check failed - no live badge for this row.
    }
  };

  return (
    <Box sx={{ width: "100%", overflowX: "auto", mt: 2 }}>
      <Table size="small" sx={{ minWidth: 550, border: "1px solid #e0e0e0" }}>
        <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold", width: "45%" }}>
              Item Code
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", width: "20%" }}>
              Unit
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", width: "25%" }}>
              Transfer Qty
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", width: "10%", textAlign: "center" }}>
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lineItems.map((row, idx) => {
            const balanceMetrics = rowStockBalances[idx];
            const hasExceededBalance =
              balanceMetrics &&
              Number(row.quantity) > balanceMetrics.netAvailableBalance;

            const availableChoicesForRow = stockChoicesList.filter(
              (item) =>
                item.itemCode === row.itemCode ||
                !usedItemCodes.has(item.itemCode),
            );

            return (
              <TableRow
                key={idx}
                sx={{ backgroundColor: hasExceededBalance ? "#fff3e0" : "inherit" }}
              >
                <TableCell>
                  <TextField
                    select
                    size="small"
                    variant="standard"
                    fullWidth
                    value={row.itemCode}
                    disabled={isStockLoading || availableChoicesForRow.length === 0}
                    onChange={(e) => {
                      const selectedItemCode = e.target.value;
                      const matchedItem = stockChoicesList.find(
                        (opt) => opt.itemCode === selectedItemCode,
                      );
                      if (matchedItem) {
                        handleUpdateLineCell(idx, "itemCode", matchedItem.itemCode);
                        handleUpdateLineCell(idx, "unit", matchedItem.unit || "PCS");
                        handleExecuteCellBlurCheck(idx, {
                          itemCode: matchedItem.itemCode,
                          unit: matchedItem.unit || "PCS",
                          quantity: row.quantity,
                        });
                      }
                    }}
                  >
                    {availableChoicesForRow.map((item) => (
                      <MenuItem key={item.itemCode} value={item.itemCode}>
                        {item.description} [{item.itemCode}]
                      </MenuItem>
                    ))}
                  </TextField>

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

                <TableCell>
                  <TextField
                    select
                    size="small"
                    variant="standard"
                    fullWidth
                    value={row.unit}
                    onChange={(e) => {
                      handleUpdateLineCell(idx, "unit", e.target.value);
                      handleExecuteCellBlurCheck(idx, { ...row, unit: e.target.value });
                    }}
                  >
                    {systemUnits.map((u: Unit) => (
                      <MenuItem key={u.id} value={u.code}>
                        {u.code}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>

                <TableCell>
                  <TextField
                    type="number"
                    size="small"
                    variant="standard"
                    fullWidth
                    value={row.quantity === 0 ? "" : row.quantity}
                    onChange={(e) =>
                      handleUpdateLineCell(idx, "quantity", Number(e.target.value))
                    }
                    error={Boolean(hasExceededBalance)}
                    slotProps={{ htmlInput: { min: 0 } }}
                  />
                  {hasExceededBalance && (
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: "bold", display: "block", mt: 0.5, color: "error.main" }}
                    >
                      Attempt to Exceed Balance Quantity!
                    </Typography>
                  )}
                </TableCell>

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
        <Box sx={{ p: 3, textAlign: "center", border: "1px dashed #ccc", borderTop: "none" }}>
          <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
            The transfer list is currently empty. Click "Add Item" above.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
