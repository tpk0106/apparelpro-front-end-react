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

import type { GeneralSrtnLineItemRow } from "../../interfaces/general-inventory/general-srtn.types";
import { GeneralSrtnStockType } from "../../interfaces/general-inventory/general-srtn.types";
import type { GeneralStockItemAvailability } from "../../interfaces/general-inventory/general-inventory.types";
import {
  useGetAvailableGeneralStockChoicesQuery,
  useVerifyGeneralStockItemAvailabilityMutation,
} from "../../tanstack-hooks/general-inventory/general-inventory-strn.hooks";
import { useGetUnits } from "../../tanstack-hooks/custom-hooks";
import type { Unit } from "../../interfaces/references/Unit";

interface LinesGridProps {
  storeCode: string;
  stockType: string;
  lineItems: GeneralSrtnLineItemRow[];
  setLineItems: React.Dispatch<React.SetStateAction<GeneralSrtnLineItemRow[]>>;
  rowStockBalances: Record<number, GeneralStockItemAvailability>;
  setRowStockBalances: React.Dispatch<
    React.SetStateAction<Record<number, GeneralStockItemAvailability>>
  >;
}

// Item picker reuses STRN's endpoint (any item tracked at the store). The live balance
// badge (STRN's verify-stock, QtyInHand - ShadowBalance) only applies to Regular returns
// - Damaged returns are checked against DamagedQuantity instead, which has no live-badge
// endpoint yet; the server still enforces that ceiling on commit either way.
export default function SupplierReturnNoteLinesGrid({
  storeCode,
  stockType,
  lineItems,
  setLineItems,
  rowStockBalances,
  setRowStockBalances,
}: LinesGridProps) {
  const isRegular = stockType === GeneralSrtnStockType.Regular;

  const { mutateAsync: triggerStockCheck } =
    useVerifyGeneralStockItemAvailabilityMutation();

  const { data: stockChoicesList = [], isLoading: isStockLoading } =
    useGetAvailableGeneralStockChoicesQuery(storeCode, !!storeCode);

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
    field: keyof GeneralSrtnLineItemRow,
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
    currentLine: GeneralSrtnLineItemRow,
  ) => {
    if (!isRegular) return;
    const itemCode = currentLine.itemCode.trim();
    const currentUnit = currentLine.unit.trim().toUpperCase();
    if (!itemCode || !storeCode) return;

    try {
      const stockDetails = await triggerStockCheck({
        storeCode,
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
              Qty. Returned
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", width: "10%", textAlign: "center" }}>
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lineItems.map((row, idx) => {
            const balanceMetrics = isRegular ? rowStockBalances[idx] : undefined;
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
                  {!isRegular && row.itemCode && (
                    <Typography
                      variant="caption"
                      sx={{ mt: 0.5, display: "block", color: "text.secondary", fontStyle: "italic" }}
                    >
                      Checked against Damaged Quantity on save.
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
            The return list is currently empty. Click "Add Item" above.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
