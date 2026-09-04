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

import type {
  OrderGtnLineItemRow,
  OrderGtnTransferableStockRow,
} from "../../interfaces/general-inventory/general-ogtn.types";
import { useDropdownTheme } from "../../themes/useDropdownTheme";
import { DASHBOARD_COLORS } from "../dashboard/dashboard-theme";
import {
  plainTableHeaderRowSx,
  plainTableHeaderCellSx,
  plainTableBodyRowSx,
  deleteRowIconButtonSx,
  numberFieldNoSpinnerSx,
} from "../../themes/workspace-theme";

interface LinesGridProps {
  storeCode: string;
  transferableStock: OrderGtnTransferableStockRow[];
  isStockLoading: boolean;
  lineItems: OrderGtnLineItemRow[];
  setLineItems: React.Dispatch<React.SetStateAction<OrderGtnLineItemRow[]>>;
}

export default function OrderGoodsTransferNoteLinesGrid({
  storeCode,
  transferableStock,
  isStockLoading,
  lineItems,
  setLineItems,
}: LinesGridProps) {
  const { fieldSx: dropdownFieldSx, listboxSx: dropdownListboxSx } = useDropdownTheme();
  const dropdownMenuSlotProps = { select: { MenuProps: { slotProps: { paper: { sx: dropdownListboxSx } } } } };

  const usedItemCodes = useMemo(
    () =>
      new Set(
        lineItems.map((item) => item.itemCode).filter((code) => code.trim() !== ""),
      ),
    [lineItems],
  );

  const handleUpdateLineCell = (
    index: number,
    field: keyof OrderGtnLineItemRow,
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
  };

  return (
    <Box sx={{ width: "100%", overflowX: "auto", mt: 2 }}>
      <Table size="small" sx={{ minWidth: 550, border: `1px solid ${DASHBOARD_COLORS.border}` }}>
        <TableHead>
          <TableRow sx={plainTableHeaderRowSx()}>
            <TableCell sx={{ ...plainTableHeaderCellSx(), width: "45%" }}>
              Item Code
            </TableCell>
            <TableCell sx={{ ...plainTableHeaderCellSx(), width: "20%" }}>
              Unit
            </TableCell>
            <TableCell sx={{ ...plainTableHeaderCellSx(), width: "25%" }}>
              Transfer Qty
            </TableCell>
            <TableCell sx={{ ...plainTableHeaderCellSx(), width: "10%", textAlign: "center" }}>
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lineItems.map((row, idx) => {
            const matchedStock = transferableStock.find(
              (s) => s.itemCode === row.itemCode,
            );
            const hasExceededBalance =
              matchedStock &&
              Number(row.quantity) > 0 &&
              Number(row.quantity) > matchedStock.availableBalance;

            const availableChoicesForRow = transferableStock.filter(
              (item) =>
                item.itemCode === row.itemCode ||
                !usedItemCodes.has(item.itemCode),
            );

            return (
              <TableRow
                key={idx}
                sx={plainTableBodyRowSx(idx, Boolean(hasExceededBalance))}
              >
                <TableCell>
                  <TextField
                    select
                    size="small"
                    variant="standard"
                    fullWidth
                    sx={dropdownFieldSx}
                    slotProps={dropdownMenuSlotProps}
                    value={row.itemCode}
                    disabled={isStockLoading || availableChoicesForRow.length === 0}
                    onChange={(e) => {
                      const selectedItemCode = e.target.value;
                      const matchedItem = transferableStock.find(
                        (opt) => opt.itemCode === selectedItemCode,
                      );
                      if (matchedItem) {
                        handleUpdateLineCell(idx, "itemCode", matchedItem.itemCode);
                        handleUpdateLineCell(idx, "unit", matchedItem.unit || "PCS");
                      }
                    }}
                  >
                    {availableChoicesForRow.map((item) => (
                      <MenuItem key={item.itemCode} value={item.itemCode}>
                        {item.description} [{item.itemCode}]
                      </MenuItem>
                    ))}
                  </TextField>

                  {matchedStock && (
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 0.5,
                        fontWeight: "bold",
                        color: hasExceededBalance ? "#d32f2f" : "#2e7d32",
                        display: "block",
                      }}
                    >
                      {matchedStock.description} (Avail:{" "}
                      {matchedStock.availableBalance.toLocaleString()}{" "}
                      {matchedStock.unit})
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  <TextField
                    size="small"
                    variant="standard"
                    fullWidth
                    sx={dropdownFieldSx}
                    value={row.unit}
                    disabled
                  />
                </TableCell>

                <TableCell>
                  <TextField
                    type="number"
                    size="small"
                    variant="standard"
                    fullWidth
                    sx={{ ...dropdownFieldSx, ...numberFieldNoSpinnerSx }}
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
                    sx={deleteRowIconButtonSx}
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
            {!storeCode && " Select a Store first."}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
