import {
  Box,
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
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import {
  plainTableBodyRowSx,
  plainTableHeaderCellSx,
  plainTableHeaderRowSx,
} from "../../../../themes/workspace-theme";
import KpiTile from "../../../common/kpi-tile";

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
      <Grid container spacing={2} sx={{ mb: 2.5, flexDirection: "row" }} wrap="nowrap">
        <KpiTile
          label="Buyer"
          value={report.buyerName || String(report.buyerCode)}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 20 }}
        />
        <KpiTile
          label="Order"
          value={report.order}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 10 }}
        />
      </Grid>

      {report.styles.map((style) => (
        <Paper
          key={style.styleCode}
          variant="outlined"
          sx={{
            mb: 2,
            overflow: "hidden",
            backgroundColor: DASHBOARD_COLORS.cardBg,
            border: `1px solid ${DASHBOARD_COLORS.border}`,
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1,
              backgroundColor: DASHBOARD_COLORS.pageBg,
              borderBottom: `1px solid ${DASHBOARD_COLORS.border}`,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}
            >
              Style: {style.styleCode}
            </Typography>
          </Box>
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={plainTableHeaderRowSx()}>
                  <TableCell sx={plainTableHeaderCellSx()}>Colour</TableCell>
                  <TableCell sx={plainTableHeaderCellSx()}>Description</TableCell>
                  {report.sizeColumns.map((size) => (
                    <TableCell key={size} sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>
                      {size}
                    </TableCell>
                  ))}
                  <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {style.colours.map((colour, index) => (
                  <TableRow key={colour.colorCode} sx={plainTableBodyRowSx(index)}>
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
                <TableRow
                  sx={{
                    ...plainTableBodyRowSx(style.colours.length),
                    backgroundColor: `${DASHBOARD_COLORS.pageBg} !important`,
                  }}
                >
                  <TableCell colSpan={2}>
                    <Typography sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>
                      Total
                    </Typography>
                  </TableCell>
                  {report.sizeColumns.map((size) => (
                    <TableCell key={size} align="right">
                      <Typography sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>
                        {formatQuantity(style.sizeTotals[size] ?? 0)}
                      </Typography>
                    </TableCell>
                  ))}
                  <TableCell align="right">
                    <Typography sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>
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
