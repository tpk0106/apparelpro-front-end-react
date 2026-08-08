import {
  Box,
  Card,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import type { ColorSizeReport } from "./color-size-report.types";

interface Props {
  report: ColorSizeReport;
}

const formatQuantity = (value: number): string =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

// Renders the full "COLOUR / SIZE DETAILS" report on screen, mirroring OD_CLSZ3.PRG's
// printed layout: one pivot table per Style (rows = Colour, columns = every distinct
// Size across the whole Buyer+Order), each closed out with a Total row. See
// ColorSizeReport's SCOPE NOTE (color-size-report.types.ts) for how the underlying
// per-Colour description/quantity data is derived on the backend.
export default function ColorSizeReportDisplay({ report }: Props) {
  return (
    <Box>
      <Card
        variant="outlined"
        sx={{
          p: 2,
          mb: 2.5,
          backgroundColor: "#fafafa",
          borderLeft: "5px solid #1a237e",
        }}
      >
        <Grid container spacing={2}>
          <HeaderField
            label="Buyer"
            value={report.buyerName || String(report.buyerCode)}
          />
          <HeaderField label="Order" value={report.order} />
        </Grid>
      </Card>

      {report.styles.map((style) => (
        <Paper key={style.styleCode} variant="outlined" sx={{ mb: 2, overflow: "hidden" }}>
          <Box sx={{ px: 2, py: 1, backgroundColor: "#eef1f7" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              Style: {style.styleCode}
            </Typography>
          </Box>
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Colour</TableCell>
                  <TableCell>Description</TableCell>
                  {report.sizeColumns.map((size) => (
                    <TableCell key={size} align="right">
                      {size}
                    </TableCell>
                  ))}
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {style.colours.map((colour) => (
                  <TableRow key={colour.colorCode}>
                    <TableCell>{colour.colorCode}</TableCell>
                    <TableCell>{colour.description || "—"}</TableCell>
                    {report.sizeColumns.map((size) => (
                      <TableCell key={size} align="right">
                        {colour.sizeQuantities[size] !== undefined
                          ? formatQuantity(colour.sizeQuantities[size])
                          : "—"}
                      </TableCell>
                    ))}
                    <TableCell align="right">
                      <strong>{formatQuantity(colour.totalQuantity)}</strong>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ backgroundColor: "#fafafa" }}>
                  <TableCell colSpan={2}>
                    <Typography sx={{ fontWeight: "bold" }}>Total</Typography>
                  </TableCell>
                  {report.sizeColumns.map((size) => (
                    <TableCell key={size} align="right">
                      <Typography sx={{ fontWeight: "bold" }}>
                        {formatQuantity(style.sizeTotals[size] ?? 0)}
                      </Typography>
                    </TableCell>
                  ))}
                  <TableCell align="right">
                    <Typography sx={{ fontWeight: "bold" }}>
                      {formatQuantity(style.grandTotal)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ))}
    </Box>
  );
}

function HeaderField({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          textTransform: "uppercase",
          color: "#5f6b7a",
        }}
      >
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 600, color: "#1a2027" }}>
        {value}
      </Typography>
    </Grid>
  );
}
