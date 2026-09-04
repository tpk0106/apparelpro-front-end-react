import { useMemo } from "react";
import { TableRow, TableCell, TextField, MenuItem, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import type { GeneralPoLineItemRow } from "../../interfaces/general-inventory/general-po.types";
import type { GeneralStore } from "../../interfaces/general-inventory/general-inventory.types";
import { useGetAvailableGeneralStockChoicesQuery } from "../../tanstack-hooks/general-inventory/general-inventory-strn.hooks";
import { useGetUnits } from "../../tanstack-hooks/custom-hooks";
import type { Unit } from "../../interfaces/references/Unit";
import { useDropdownTheme } from "../../themes/useDropdownTheme";
import {
  plainTableBodyRowSx,
  deleteRowIconButtonSx,
  dateIconFieldSx,
  numberFieldNoSpinnerSx,
} from "../../themes/workspace-theme";

interface Props {
  row: GeneralPoLineItemRow;
  index: number;
  storesList: GeneralStore[];
  onChange: (field: keyof GeneralPoLineItemRow, value: string | number | null) => void;
  onRemove: () => void;
}

// A separate component per row (not a shared hook call in the parent) because each
// line can point at a different Store, so the item picker must be scoped per-row -
// this keeps the STRN available-choices hook call legitimately per-row instead of
// conditionally invoked inside a loop.
export default function GeneralPoLineRow({ row, index, storesList, onChange, onRemove }: Props) {
  const { fieldSx: dropdownFieldSx, listboxSx: dropdownListboxSx } = useDropdownTheme();
  const dropdownMenuSlotProps = { select: { MenuProps: { slotProps: { paper: { sx: dropdownListboxSx } } } } };

  const { data: stockChoicesList = [], isLoading: isStockLoading } =
    useGetAvailableGeneralStockChoicesQuery(row.storeCode, !!row.storeCode);

  const { data: unitsPageData } = useGetUnits({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "code",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const systemUnits = useMemo(() => unitsPageData?.items || [], [unitsPageData]);

  return (
    <TableRow sx={plainTableBodyRowSx(index)}>
      <TableCell>
        <TextField
          select
          size="small"
          variant="standard"
          fullWidth
          sx={dropdownFieldSx}
          slotProps={dropdownMenuSlotProps}
          value={row.storeCode}
          onChange={(e) => {
            onChange("storeCode", e.target.value);
            onChange("itemCode", "");
          }}
        >
          {storesList.map((s) => (
            <MenuItem key={s.code} value={s.code}>
              {s.code}
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
          disabled={!row.storeCode || isStockLoading}
          onChange={(e) => {
            const matched = stockChoicesList.find((opt) => opt.itemCode === e.target.value);
            onChange("itemCode", e.target.value);
            if (matched) onChange("unit", matched.unit || "PCS");
          }}
        >
          {stockChoicesList.map((item) => (
            <MenuItem key={item.itemCode} value={item.itemCode}>
              {item.description} [{item.itemCode}]
            </MenuItem>
          ))}
        </TextField>
      </TableCell>

      <TableCell>
        <TextField
          size="small"
          variant="standard"
          fullWidth
          sx={dropdownFieldSx}
          value={row.refNo ?? ""}
          onChange={(e) => onChange("refNo", e.target.value)}
        />
      </TableCell>

      <TableCell>
        <TextField
          select
          size="small"
          variant="standard"
          fullWidth
          sx={dropdownFieldSx}
          slotProps={dropdownMenuSlotProps}
          value={row.unit}
          onChange={(e) => onChange("unit", e.target.value)}
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
          sx={{ ...dropdownFieldSx, ...numberFieldNoSpinnerSx }}
          value={row.orderedQuantity === 0 ? "" : row.orderedQuantity}
          onChange={(e) => onChange("orderedQuantity", Number(e.target.value))}
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

      <TableCell>
        <TextField
          type="date"
          size="small"
          variant="standard"
          fullWidth
          sx={{ ...dropdownFieldSx, ...(dateIconFieldSx as Record<string, unknown>) }}
          value={row.expectedDate ?? ""}
          onChange={(e) => onChange("expectedDate", e.target.value || null)}
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
