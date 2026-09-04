import { TableRow, TableCell, TextField, MenuItem, IconButton, Chip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import type { ArnLineItemRow } from "./additional-goods-receipt-note.types";
import type { Buyer } from "../../interfaces/references/Buyer";
import { useGetAllPurchaseOrdersByBuyerCode } from "../../tanstack-hooks/custom-hooks";
import { useGetReceivableStockByBuyerOrderQuery } from "../../tanstack-hooks/additional-goods-receipt-note.hooks";
import { useDropdownTheme } from "../../themes/useDropdownTheme";
import {
  plainTableBodyRowSx,
  deleteRowIconButtonSx,
  numberFieldNoSpinnerSx,
} from "../../themes/workspace-theme";

interface Props {
  row: ArnLineItemRow;
  index: number;
  buyersList: Buyer[];
  onChange: (field: keyof ArnLineItemRow, value: string | number | boolean | null) => void;
  onRemove: () => void;
}

// A separate component per row (not a shared hook call in the parent) because each
// line can point at a different Buyer/Order, so the item picker must be scoped
// per-row - same reasoning as GeneralPoLineRow's per-row Store-scoped item picker.
export default function AdditionalGoodsReceiptNoteLineRow({ row, index, buyersList, onChange, onRemove }: Props) {
  const { fieldSx: dropdownFieldSx, listboxSx: dropdownListboxSx } = useDropdownTheme();
  const dropdownMenuSlotProps = { select: { MenuProps: { slotProps: { paper: { sx: dropdownListboxSx } } } } };

  const { data: ordersList = [], isLoading: isOrdersLoading } = useGetAllPurchaseOrdersByBuyerCode(
    row.buyerCode ?? 0,
    !!row.buyerCode,
  );

  const { data: receivableStock = [], isLoading: isStockLoading } = useGetReceivableStockByBuyerOrderQuery(
    { buyerCode: row.buyerCode ?? 0, order: row.order },
    !!row.buyerCode && !!row.order,
  );

  // MUI's Select (used internally by TextField select) passes through the
  // MenuItem's actual value type in the change event, not a string - since
  // MenuItem value={b.buyerCode} is a number, e.target.value is already a
  // number at runtime despite MUI's own TS typing calling it `string`.
  // Comparing via String(b.buyerCode) === buyerCode was therefore always
  // false (string !== number under ===), so a buyer selection never
  // actually registered - the field looked blank and Order stayed disabled.
  const handleBuyerChange = (buyerCode: number) => {
    const buyer = buyersList.find((b) => b.buyerCode === buyerCode) ?? null;
    onChange("buyerCode", buyer?.buyerCode ?? null);
    onChange("buyerName", buyer?.name ?? "");
    onChange("order", "");
    onChange("itemCode", "");
  };

  const handleItemChange = (itemCode: string) => {
    const matched = receivableStock.find((s) => s.itemCode === itemCode);
    onChange("itemCode", itemCode);
    if (matched) {
      onChange("unit", matched.unit);
      onChange("additionalProcessCode", matched.additionalProcessCode);
      onChange("description", matched.description);
      onChange("storeCode", matched.storeCode);
      onChange("toDateIssued", matched.toDateIssued);
      onChange("toDateReceived", matched.toDateReceived);
      onChange("isSemiFinishedGarment", matched.isSemiFinishedGarment);
      onChange("receivableBalance", matched.receivableBalance);
    }
  };

  const isOverReceivable = row.isSemiFinishedGarment && row.quantity > row.receivableBalance;

  return (
    <TableRow sx={plainTableBodyRowSx(index, isOverReceivable)}>
      <TableCell>
        <TextField
          select
          size="small"
          variant="standard"
          fullWidth
          sx={dropdownFieldSx}
          slotProps={dropdownMenuSlotProps}
          value={row.buyerCode ?? ""}
          onChange={(e) => handleBuyerChange(e.target.value as unknown as number)}
        >
          {buyersList.map((b) => (
            <MenuItem key={b.buyerCode} value={b.buyerCode}>
              {b.name}
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
          sx={dropdownFieldSx}
          slotProps={dropdownMenuSlotProps}
          value={row.order}
          disabled={!row.buyerCode || isOrdersLoading}
          onChange={(e) => {
            onChange("order", e.target.value);
            onChange("itemCode", "");
          }}
        >
          {ordersList.map((orderStr) => (
            <MenuItem key={orderStr} value={orderStr}>
              {orderStr}
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
          sx={dropdownFieldSx}
          slotProps={dropdownMenuSlotProps}
          value={row.itemCode}
          disabled={!row.order || isStockLoading}
          onChange={(e) => handleItemChange(e.target.value)}
        >
          {receivableStock.map((s) => (
            <MenuItem key={s.itemCode} value={s.itemCode}>
              {s.description} [{s.itemCode}] - {s.additionalProcessCode}
            </MenuItem>
          ))}
        </TextField>
      </TableCell>

      <TableCell>{row.unit}</TableCell>

      <TableCell>
        {row.itemCode ? (
          <Chip
            size="small"
            variant="filled"
            color={isOverReceivable ? "error" : "primary"}
            label={row.isSemiFinishedGarment ? row.receivableBalance.toLocaleString() : "No cap"}
            sx={{ border: "1px solid #FFFFFF", "& .MuiChip-label": { color: "#FFFFFF" } }}
          />
        ) : null}
      </TableCell>

      <TableCell>
        <TextField
          type="number"
          size="small"
          variant="standard"
          fullWidth
          sx={{ ...dropdownFieldSx, ...numberFieldNoSpinnerSx }}
          error={isOverReceivable}
          value={row.quantity === 0 ? "" : row.quantity}
          onChange={(e) => onChange("quantity", Number(e.target.value))}
          slotProps={{ htmlInput: { min: 0 } }}
        />
      </TableCell>

      <TableCell>
        <TextField
          type="number"
          size="small"
          variant="standard"
          fullWidth
          sx={{ ...dropdownFieldSx, ...numberFieldNoSpinnerSx }}
          value={row.price === 0 ? "" : row.price}
          onChange={(e) => onChange("price", Number(e.target.value))}
          slotProps={{ htmlInput: { min: 0, step: "0.0001" } }}
        />
      </TableCell>

      <TableCell sx={{ textAlign: "center" }}>
        <IconButton color="error" size="small" onClick={onRemove} sx={deleteRowIconButtonSx}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
