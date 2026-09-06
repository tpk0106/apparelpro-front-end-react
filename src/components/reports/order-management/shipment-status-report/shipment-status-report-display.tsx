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

import type { ShipmentStatusReport } from "./shipment-status-report.types";
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import {
  plainTableBodyRowSx,
  plainTableHeaderCellSx,
  plainTableHeaderRowSx,
} from "../../../../themes/workspace-theme";
import KpiTile from "../../../common/kpi-tile";

interface Props {
  report: ShipmentStatusReport;
}

const formatQuantity = (value: number): string =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const formatDate = (value: string | null): string => {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "2-digit" });
};

// Renders the "SHIPMENT STATUS REPORT" as one card per schedule line (Type/Style/Shp.
// Order No.), each with its own nested table of actually-invoiced quantities and a
// Balance to Ship total - mirrors OD_SHPST.PRG's nested od_part -> ie_coin2 print loop.
export default function ShipmentStatusReportDisplay({ report }: Props) {
  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2.5, flexDirection: "row" }} wrap="nowrap">
        <KpiTile
          label="Buyer"
          value={report.buyerName}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 20 }}
        />
        <KpiTile
          label="Order"
          value={report.order}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 10 }}
        />
        <KpiTile
          label="Shipment Lines"
          value={String(report.rows.length)}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 8 }}
        />
      </Grid>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {report.rows.map((row, index) => (
          <Card
            key={`${row.typeCode}-${row.styleCode}-${row.shipmentOrderNo}-${index}`}
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
                <Grid size={{ xs: 6, sm: 2 }}>
                  <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary, display: "block" }}>Type</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>{row.typeName}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 2.5 }}>
                  <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary, display: "block" }}>Style</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>{row.styleCode}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 2.5 }}>
                  <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary, display: "block" }}>Shp. Order No.</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>{row.shipmentOrderNo}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 1.5 }}>
                  <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary, display: "block" }}>Unit</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>{row.unit}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 3.5 }}>
                  <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary, display: "block" }}>Destination</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>{row.destinationCode}</Typography>
                </Grid>
              </Grid>
            </Box>

            {row.invoiceLines.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={plainTableHeaderRowSx()}>
                      <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Quantity Shipped</TableCell>
                      <TableCell sx={plainTableHeaderCellSx()}>Ship Date</TableCell>
                      <TableCell sx={plainTableHeaderCellSx()}>Invoice No</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.invoiceLines.map((line, lineIndex) => (
                      <TableRow key={`${line.invoiceNumber}-${lineIndex}`} sx={plainTableBodyRowSx(lineIndex)}>
                        <TableCell align="right">{formatQuantity(line.quantityShipped)}</TableCell>
                        <TableCell>{formatDate(line.invoiceDate)}</TableCell>
                        <TableCell>{line.invoiceNumber}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" sx={{ p: 2, fontStyle: "italic", color: DASHBOARD_COLORS.textSecondary }}>
                No invoiced shipments yet.
              </Typography>
            )}

            <Divider sx={{ borderColor: DASHBOARD_COLORS.border }} />
            <Box sx={{ p: 1.5, display: "flex", justifyContent: "flex-end", gap: 3 }}>
              <Typography variant="body2" sx={{ color: DASHBOARD_COLORS.textSecondary }}>
                Total Shipped: <strong>{formatQuantity(row.totalQuantityShipped)}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: DASHBOARD_COLORS.textPrimary }}>
                Balance to Ship: <strong>{formatQuantity(row.balanceToShip)}</strong>
              </Typography>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
