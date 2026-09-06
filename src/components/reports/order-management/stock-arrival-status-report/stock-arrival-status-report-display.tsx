import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import type { StockArrivalStatusReport } from "./stock-arrival-status-report.types";
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import {
  plainTableBodyRowSx,
  plainTableHeaderCellSx,
  plainTableHeaderRowSx,
} from "../../../../themes/workspace-theme";
import KpiTile from "../../../common/kpi-tile";

interface Props {
  report: StockArrivalStatusReport;
}

const formatQuantity = (value: number): string =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const formatDate = (value: string | null): string => {
  if (!value) return "Not Specified";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "2-digit" });
};

// Renders the "STOCK ARRIVAL STATUS REPORT" as one card per budgeted material item,
// each with its own nested table of Purchase Order lines - mirrors OD_STARV.PRG's
// nested od_sacc2 -> od_podet print loop.
export default function StockArrivalStatusReportDisplay({ report }: Props) {
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
          label="Report Date"
          value={formatDate(report.asOfDate)}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 10 }}
        />
        <KpiTile
          label="Total Order Qty"
          value={`${formatQuantity(report.totalOrderQuantity)} ${report.unit}`}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 10 }}
        />
      </Grid>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {report.items.map((item, index) => (
          <Card
            key={`${item.itemCode}-${index}`}
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
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary, display: "block" }}>Item</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>{item.itemCode} - {item.description}</Typography>
                </Grid>
                <Grid size={{ xs: 4, sm: 2.5 }}>
                  <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary, display: "block" }}>Order Qty</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>{formatQuantity(item.orderedQuantity)} {item.unit}</Typography>
                </Grid>
                <Grid size={{ xs: 4, sm: 2.5 }}>
                  <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary, display: "block" }}>Received</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>{formatQuantity(item.totalReceivedQuantity)}</Typography>
                </Grid>
                <Grid size={{ xs: 4, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary, display: "block" }}>Balance to Receive</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>{formatQuantity(item.balanceToReceive)}</Typography>
                </Grid>
              </Grid>
            </Box>

            {item.purchaseOrderLines.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={plainTableHeaderRowSx()}>
                      <TableCell sx={plainTableHeaderCellSx()}>P/O No</TableCell>
                      <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>P/O Qty</TableCell>
                      <TableCell sx={plainTableHeaderCellSx()}>Store</TableCell>
                      <TableCell sx={plainTableHeaderCellSx()}>Supplier</TableCell>
                      <TableCell sx={plainTableHeaderCellSx()}>Expected Date</TableCell>
                      <TableCell sx={plainTableHeaderCellSx()}>Delay</TableCell>
                      <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Supp. Return</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {item.purchaseOrderLines.map((line, lineIndex) => (
                      <TableRow key={`${line.purchaseOrderNumber}-${lineIndex}`} sx={plainTableBodyRowSx(lineIndex)}>
                        <TableCell>{line.purchaseOrderNumber}</TableCell>
                        <TableCell align="right">{formatQuantity(line.orderedQuantity)}</TableCell>
                        <TableCell>{line.storeCode}</TableCell>
                        <TableCell>{line.supplierName}</TableCell>
                        <TableCell>{formatDate(line.expectedDate)}</TableCell>
                        <TableCell>{line.delayDays !== null ? `${line.delayDays} days` : "-"}</TableCell>
                        <TableCell align="right">{formatQuantity(line.supplierReturnQuantity)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" sx={{ p: 2, fontStyle: "italic", color: DASHBOARD_COLORS.critical }}>
                ** Purchase Order Not Raised **
              </Typography>
            )}
          </Card>
        ))}
      </Box>
    </Box>
  );
}
