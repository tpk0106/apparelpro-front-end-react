import {
  Box,
  Divider,
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
import { format, parseISO } from "date-fns";

import type { OrderDetailReport } from "./order-detail-report.types";
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import {
  plainTableBodyRowSx,
  plainTableHeaderCellSx,
  plainTableHeaderRowSx,
} from "../../../../themes/workspace-theme";
import KpiTile from "../../../common/kpi-tile";

interface Props {
  report: OrderDetailReport;
}

const formatMoney = (value: number): string =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatQuantity = (value: number): string =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Renders the full "ORDER CONFIRMATION" report on screen, mirroring OD_RPO1.PRG's
// prn_for1 printed layout: header, one block per Style expanded into its Part
// Shipment lines with a per-style subtotal (shown only when there's more than one
// shipment line, matching OrderDetailReportEngine.cs's PDF rendering rule), and an
// order-level grand total. See OrderDetailReport's SCOPE NOTE (order-detail-report.types.ts)
// for the two legacy fields intentionally not shown here (order Description; resolved
// Destination name).
export default function OrderDetailReportDisplay({ report }: Props) {
  const currency = report.currencyCode || "N/A";

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
        <KpiTile
          label="Order Date"
          value={format(parseISO(report.orderDate), "dd-MMM-yyyy")}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 10 }}
        />
        <KpiTile
          label="Unit"
          value={report.unit}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 6 }}
        />
        <KpiTile
          label="Currency"
          value={currency}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 6 }}
        />
      </Grid>

      {report.styles.map((style) => (
        <Paper
          key={`${style.typeCode}-${style.styleCode}`}
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
            <Typography
              variant="caption"
              sx={{ color: DASHBOARD_COLORS.textSecondary }}
            >
              Type: {style.typeName || String(style.typeCode)} &nbsp;|&nbsp;
              Qty: {formatQuantity(style.quantity)} {style.unit} &nbsp;|&nbsp;
              Unit Price: {formatMoney(style.unitPrice)} {currency}
            </Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={plainTableHeaderRowSx()}>
                  <TableCell sx={plainTableHeaderCellSx()}>New Order</TableCell>
                  <TableCell sx={plainTableHeaderCellSx()}>Destination</TableCell>
                  <TableCell sx={plainTableHeaderCellSx()}>Ship Date</TableCell>
                  <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>
                    Qty ({style.unit})
                  </TableCell>
                  <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>
                    Value ({currency})
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {style.partShipments.map((part, index) => (
                  <TableRow
                    key={`${part.newOrder}-${index}`}
                    sx={plainTableBodyRowSx(index)}
                  >
                    <TableCell>{part.newOrder}</TableCell>
                    <TableCell>{part.destinationCode}</TableCell>
                    <TableCell>
                      {format(parseISO(part.shipDate), "dd-MMM-yyyy")}
                    </TableCell>
                    <TableCell align="right">
                      {formatQuantity(part.quantity)}
                    </TableCell>
                    <TableCell align="right">
                      {formatMoney(part.value)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {style.partShipments.length > 1 && (
            <>
              <Divider sx={{ borderColor: DASHBOARD_COLORS.border }} />
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 4,
                  backgroundColor: DASHBOARD_COLORS.pageBg,
                }}
              >
                <Typography variant="body2" sx={{ color: DASHBOARD_COLORS.textPrimary }}>
                  Total Qty:{" "}
                  <strong>
                    {formatQuantity(style.totalQuantity)} {style.unit}
                  </strong>
                </Typography>
                <Typography variant="body2" sx={{ color: DASHBOARD_COLORS.textPrimary }}>
                  Total Value:{" "}
                  <strong>
                    {formatMoney(style.totalValue)} {currency}
                  </strong>
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      ))}

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "flex-end",
          backgroundColor: DASHBOARD_COLORS.cardBg,
          border: `1px solid ${DASHBOARD_COLORS.border}`,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}
        >
          Grand Total Value - {currency}: {formatMoney(report.grandTotalValue)}
        </Typography>
      </Paper>
    </Box>
  );
}
