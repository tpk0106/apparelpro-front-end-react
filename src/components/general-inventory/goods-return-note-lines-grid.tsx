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

import type { GeneralRtnLineItemRow } from "../../interfaces/general-inventory/general-rtn.types";
import { useGetAvailableGeneralStockChoicesQuery } from "../../tanstack-hooks/general-inventory/general-inventory-strn.hooks";
import { useGetUnits } from "../../tanstack-hooks/custom-hooks";
import type { Unit } from "../../interfaces/references/Unit";

interface LinesGridProps {
  storeCode: string;
  lineItems: GeneralRtnLineItemRow[];
  setLineItems: React.Dispatch<React.SetStateAction<GeneralRtnLineItemRow[]>>;
}

// A return only ever increases stock, so unlike STRN/GIN/GTN there's no balance ceiling
// to check against here - the item just needs to already be tracked at the target Store
// (same api/general-inventory-strn/available-choices reuse pattern as GTN(General)).
export default function GoodsReturnNoteLinesGrid({
  storeCode,
  lineItems,
  setLineItems,
}: LinesGridProps) {
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
    field: keyof GeneralRtnLineItemRow,
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
            const availableChoicesForRow = stockChoicesList.filter(
              (item) =>
                item.itemCode === row.itemCode ||
                !usedItemCodes.has(item.itemCode),
            );

            return (
              <TableRow key={idx}>
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
                      }
                    }}
                  >
                    {availableChoicesForRow.map((item) => (
                      <MenuItem key={item.itemCode} value={item.itemCode}>
                        {item.description} [{item.itemCode}]
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>

                <TableCell>
                  <TextField
                    select
                    size="small"
                    variant="standard"
                    fullWidth
                    value={row.unit}
                    onChange={(e) => handleUpdateLineCell(idx, "unit", e.target.value)}
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
                    slotProps={{ htmlInput: { min: 0 } }}
                  />
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
