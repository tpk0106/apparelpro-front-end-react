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

interface Props {
  rows: DailyProductionEntry[];
  unitOptions: Unit[];
  onChange: (sectionCode: string, field: "hours" | "unit" | "quantity", value: string) => void;
  isLoading: boolean;
}

const DailyProductionEntryTable = ({ rows, unitOptions, onChange, isLoading }: Props) => {
  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary">Loading...</Typography>
      </Box>
    );
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Section</TableCell>
          <TableCell align="right">Hours</TableCell>
          <TableCell>Unit</TableCell>
          <TableCell align="right">Qty</TableCell>
          <TableCell align="right">To-date Qty</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.sectionCode}>
            <TableCell>{row.sectionDescription}</TableCell>
            <TableCell align="right">
              <TextField
                type="number"
                size="small"
                value={row.hours}
                onChange={(e) => onChange(row.sectionCode, "hours", e.target.value)}
                sx={{ width: 100 }}
                slotProps={{ htmlInput: { style: { textAlign: "right" } } }}
              />
            </TableCell>
            <TableCell>
              <TextField
                select
                size="small"
                value={row.unit}
                onChange={(e) => onChange(row.sectionCode, "unit", e.target.value)}
                sx={{ width: 100 }}
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
                sx={{ width: 110 }}
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
