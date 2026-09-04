import {
  Box,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import type { DailyProductionEntry } from "../../../interfaces/production/DailyProductionEntry";
import type { Unit } from "../../../interfaces/references/Unit";
import { DASHBOARD_COLORS } from "../../dashboard/dashboard-theme";
import { useDropdownTheme } from "../../../themes/useDropdownTheme";
import {
  plainTableHeaderRowSx,
  plainTableHeaderCellSx,
  plainTableBodyRowSx,
  numberFieldNoSpinnerSx,
} from "../../../themes/workspace-theme";

interface Props {
  rows: DailyProductionEntry[];
  unitOptions: Unit[];
  onChange: (sectionCode: string, field: "hours" | "unit" | "quantity", value: string) => void;
  isLoading: boolean;
}

const DailyProductionEntryTable = ({ rows, unitOptions, onChange, isLoading }: Props) => {
  const { fieldSx: dropdownFieldSx, listboxSx: dropdownListboxSx } = useDropdownTheme();
  const dropdownMenuSlotProps = { select: { MenuProps: { slotProps: { paper: { sx: dropdownListboxSx } } } } };

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary">Loading...</Typography>
      </Box>
    );
  }

  return (
    <Table size="small" sx={{ border: `1px solid ${DASHBOARD_COLORS.border}` }}>
      <TableHead>
        <TableRow sx={plainTableHeaderRowSx()}>
          <TableCell sx={plainTableHeaderCellSx()}>Section</TableCell>
          <TableCell align="right" sx={plainTableHeaderCellSx()}>Hours</TableCell>
          <TableCell sx={plainTableHeaderCellSx()}>Unit</TableCell>
          <TableCell align="right" sx={plainTableHeaderCellSx()}>Qty</TableCell>
          <TableCell align="right" sx={plainTableHeaderCellSx()}>To-date Qty</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, idx) => (
          <TableRow key={row.sectionCode} sx={plainTableBodyRowSx(idx)}>
            <TableCell>{row.sectionDescription}</TableCell>
            <TableCell align="right">
              <TextField
                type="number"
                size="small"
                value={row.hours}
                onChange={(e) => onChange(row.sectionCode, "hours", e.target.value)}
                sx={{ width: 100, ...dropdownFieldSx, ...numberFieldNoSpinnerSx }}
                slotProps={{ htmlInput: { style: { textAlign: "right" }, min: 0, max: 24, step: 0.1 } }}
              />
            </TableCell>
            <TableCell>
              <TextField
                select
                size="small"
                value={row.unit}
                onChange={(e) => onChange(row.sectionCode, "unit", e.target.value)}
                sx={{ width: 100, ...dropdownFieldSx }}
                slotProps={dropdownMenuSlotProps}
              >
                {!row.unit && <MenuItem value="">Select...</MenuItem>}
                {row.unit && !unitOptions.some((u) => u.code === row.unit) && (
                  <MenuItem value={row.unit}>{row.unit}</MenuItem>
                )}
                {unitOptions.map((u) => (
                  <MenuItem key={u.code} value={u.code}>{u.code}</MenuItem>
                ))}
              </TextField>
            </TableCell>
            <TableCell align="right">
              <TextField
                type="number"
                size="small"
                value={row.quantity}
                onChange={(e) => onChange(row.sectionCode, "quantity", e.target.value)}
                sx={{ width: 110, ...dropdownFieldSx, ...numberFieldNoSpinnerSx }}
                slotProps={{ htmlInput: { style: { textAlign: "right" } } }}
              />
            </TableCell>
            <TableCell align="right">
              <Typography color="text.secondary">{row.toDateQuantity}</Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DailyProductionEntryTable;
