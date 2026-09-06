import {
  Box,
  Card,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import type { YearSeasonOrdersReport } from "./year-season-orders-report.types";
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import {
  plainTableBodyRowSx,
  plainTableHeaderCellSx,
  plainTableHeaderRowSx,
} from "../../../../themes/workspace-theme";
import KpiTile from "../../../common/kpi-tile";

interface Props {
  report: YearSeasonOrdersReport;
}

const formatQuantity = (value: number): string =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const formatDate = (value: string): string => {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" });
};

// Renders the "ORDER CONFIRMATION REPORT" family as one card per order, each with its
// own nested table of Styles and a grand total value - mirrors OD_RPO2.PRG's nested
// od_po -> od_style print loop (mr_dart1-4 collapse into one shape, same pattern as
// Scheduled Shipments Report).
export default function YearSeasonOrdersReportDisplay({ report }: Props) {
  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2.5, flexDirection: "row" }} wrap="nowrap">
        <KpiTile
          label="Year Filter"
          value={report.year ? String(report.year) : "All Years"}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 12 }}
        />
        <KpiTile
          label="Season Filter"
          value={report.season ?? "All Seasons"}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 14 }}
        />
        <KpiTile
          label="Total Orders"
          value={String(report.rows.length)}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 8 }}
        />
      </Grid>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {report.rows.map((row, index) => (
          <Card
            key={`${row.buyerCode}-${row.order}-${index}`}
            variant="outlined"
            sx={{
              backgroundColor: DASHBOARD_COLORS.cardBg,
              border: `1px solid ${DASHBOARD_COLORS.border}`,
            }}
          >
            <Box
              sx={{
                p: 1.5,
                backgroundColor: DASHBOARD_COLORS.pageBg,
                borderBottom: `1px solid ${DASHBOARD_COLORS.border}`,
              }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary, display: "block" }}>Buyer</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>{row.buyerName}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 2 }}>
                  <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary, display: "block" }}>Order</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>{row.order}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 2 }}>
                  <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary, display: "block" }}>Date</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>{formatDate(row.orderDate)}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 2.5 }}>
                  <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary, display: "block" }}>Season</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>{row.seasonDescription || row.seasonCode}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 2.5 }}>
                  <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary, display: "block" }}>Currency</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>{row.currencyCode}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary, display: "block" }}>Description</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>{row.description || "-"}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 2 }}>
                  <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary, display: "block" }}>Country</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>{row.countryCode}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 2 }}>
                  <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary, display: "block" }}>Total Qty</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>{formatQuantity(row.totalQuantity)} {row.unit}</Typography>
                </Grid>
              </Grid>
            </Box>

            {row.styles.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={plainTableHeaderRowSx()}>
                      <TableCell sx={plainTableHeaderCellSx()}>Type</TableCell>
                      <TableCell sx={plainTableHeaderCellSx()}>Style</TableCell>
                      <TableCell sx={plainTableHeaderCellSx()}>Unit</TableCell>
                      <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Quantity</TableCell>
                      <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Unit Price</TableCell>
                      <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Total Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.styles.map((style, styleIndex) => (
                      <TableRow key={`${style.typeCode}-${style.styleCode}-${styleIndex}`} sx={plainTableBodyRowSx(styleIndex)}>
                        <TableCell>{style.typeName || style.typeCode}</TableCell>
                        <TableCell>{style.styleCode}</TableCell>
                        <TableCell>{style.unit}</TableCell>
                        <TableCell align="right">{formatQuantity(style.quantity)}</TableCell>
                        <TableCell align="right">{formatQuantity(style.unitPrice)}</TableCell>
                        <TableCell align="right">{formatQuantity(style.totalValue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" sx={{ p: 2, fontStyle: "italic", color: DASHBOARD_COLORS.textSecondary }}>
                No styles found for this order.
              </Typography>
            )}

            <Divider sx={{ borderColor: DASHBOARD_COLORS.border }} />
            <Box sx={{ p: 1.5, display: "flex", justifyContent: "flex-end" }}>
              <Typography variant="body2" sx={{ color: DASHBOARD_COLORS.textPrimary }}>
                Grand Total Value: <strong>{formatQuantity(row.grandTotalValue)}</strong>
              </Typography>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
