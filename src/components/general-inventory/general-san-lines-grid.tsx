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

import type { GeneralSanLineItemRow } from "../../interfaces/general-inventory/general-san.types";
import { useGetAvailableGeneralStockChoicesQuery } from "../../tanstack-hooks/general-inventory/general-inventory-strn.hooks";
import { useGetUnits, useGetCurrenciesQuery } from "../../tanstack-hooks/custom-hooks";
import type { Unit } from "../../interfaces/references/Unit";

interface LinesGridProps {
  storeCode: string;
  lineItems: GeneralSanLineItemRow[];
  setLineItems: React.Dispatch<React.SetStateAction<GeneralSanLineItemRow[]>>;
}

// A stock adjustment SETS QtyInHand to the entered quantity (a physical stock-take
// correction), so unlike STRN/GIN/GTN there's no balance ceiling to check against - any
// non-negative count is valid. Price can be entered in a different currency than the
// item's own master currency; the server converts it before valuing (same pattern GRN
// already uses), so a per-line Currency picker sits alongside Price here.
export default function GeneralSanLinesGrid({ storeCode, lineItems, setLineItems }: LinesGridProps) {
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
  const systemUnits = useMemo(() => unitsPageData?.items || [], [unitsPageData]);

  const { data: currencyPageData } = useGetCurrenciesQuery({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "code",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const currenciesList = useMemo(() => currencyPageData?.items ?? [], [currencyPageData]);

  const usedItemCodes = useMemo(
    () =>
      new Set(
        lineItems.map((item) => item.itemCode).filter((code) => code.trim() !== ""),
      ),
    [lineItems],
  );

  const handleUpdateLineCell = (
    index: number,
    field: keyof GeneralSanLineItemRow,
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
      <Table size="small" sx={{ minWidth: 750, border: "1px solid #e0e0e0" }}>
        <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold", width: "30%" }}>Item Code</TableCell>
            <TableCell sx={{ fontWeight: "bold", width: "15%" }}>Unit</TableCell>
            <TableCell sx={{ fontWeight: "bold", width: "18%" }}>New Qty. In Hand</TableCell>
            <TableCell sx={{ fontWeight: "bold", width: "17%" }}>Price</TableCell>
            <TableCell sx={{ fontWeight: "bold", width: "12%" }}>Currency</TableCell>
            <TableCell sx={{ fontWeight: "bold", width: "8%", textAlign: "center" }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lineItems.map((row, idx) => {
            const availableChoicesForRow = stockChoicesList.filter(
              (item) => item.itemCode === row.itemCode || !usedItemCodes.has(item.itemCode),
            );
            const matchedChoice = stockChoicesList.find((opt) => opt.itemCode === row.itemCode);

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
                      const matchedItem = stockChoicesList.find((opt) => opt.itemCode === selectedItemCode);
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
                  {matchedChoice && (
                    <Typography
                      variant="caption"
                      sx={{ mt: 0.5, display: "block", color: "text.secondary" }}
                    >
                      Currently recorded: {matchedChoice.qtyInHand.toLocaleString()} {matchedChoice.unit}
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
                    onChange={(e) => handleUpdateLineCell(idx, "quantity", Number(e.target.value))}
                    slotProps={{ htmlInput: { min: 0 } }}
                  />
                </TableCell>

                <TableCell>
                  <TextField
                    type="number"
                    size="small"
                    variant="standard"
                    fullWidth
                    value={row.price === 0 ? "" : row.price}
                    onChange={(e) => handleUpdateLineCell(idx, "price", Number(e.target.value))}
                    slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                  />
                </TableCell>

                <TableCell>
                  <TextField
                    select
                    size="small"
                    variant="standard"
                    fullWidth
                    value={row.currencyCode}
                    onChange={(e) => handleUpdateLineCell(idx, "currencyCode", e.target.value)}
                  >
                    {currenciesList.map((c) => (
                      <MenuItem key={c.code} value={c.code}>
                        {c.code}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>

                <TableCell sx={{ textAlign: "center" }}>
                  <IconButton color="error" size="small" onClick={() => handleRemoveRow(idx)}>
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
            The adjustment list is currently empty. Click "Add Item" above.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
