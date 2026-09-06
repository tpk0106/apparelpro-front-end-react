import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import type { MonthlyActualShipmentsReport } from "./monthly-actual-shipments-report.types";
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import {
  plainTableBodyRowSx,
  plainTableHeaderCellSx,
  plainTableHeaderRowSx,
} from "../../../../themes/workspace-theme";
import KpiTile from "../../../common/kpi-tile";

interface Props {
  report: MonthlyActualShipmentsReport;
}

const formatQuantity = (value: number): string =>
  value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const formatMoney = (value: number): string =>
  value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (value: string): string => {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "2-digit" });
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Renders the "MONTHLY ACTUAL SHIPMENTS" report as one flat table - every commercial
// invoice line shipped within the selected Month/Year.
export default function MonthlyActualShipmentsReportDisplay({ report }: Props) {
  const totalQuantity = report.rows.reduce((sum, r) => sum + r.quantity, 0);
  const totalValue = report.rows.reduce((sum, r) => sum + r.value, 0);

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2.5, flexDirection: "row" }} wrap="nowrap">
        <KpiTile
          label="Shipment Month"
          value={`${MONTH_NAMES[report.month - 1]} ${report.year}`}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 14 }}
        />
        <KpiTile
          label="Total Lines"
          value={String(report.rows.length)}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 8 }}
        />
        <KpiTile
          label="Total Value"
          value={formatMoney(totalValue)}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 10 }}
        />
      </Grid>

      <TableContainer
        component={Card}
        variant="outlined"
        sx={{ backgroundColor: DASHBOARD_COLORS.cardBg, border: `1px solid ${DASHBOARD_COLORS.border}` }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={plainTableHeaderRowSx()}>
              <TableCell sx={plainTableHeaderCellSx()}>Invoice No.</TableCell>
              <TableCell sx={plainTableHeaderCellSx()}>Buyer</TableCell>
              <TableCell sx={plainTableHeaderCellSx()}>Order No</TableCell>
              <TableCell sx={plainTableHeaderCellSx()}>Style</TableCell>
              <TableCell sx={plainTableHeaderCellSx()}>Date</TableCell>
              <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Quantity</TableCell>
              <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Balance</TableCell>
              <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report.rows.map((row, index) => (
              <TableRow key={`${row.invoiceNumber}-${row.orderNo}-${row.styleCode}-${index}`} sx={plainTableBodyRowSx(index)}>
                <TableCell>{row.invoiceNumber}</TableCell>
                <TableCell>{row.buyerName}</TableCell>
                <TableCell>{row.orderNo}</TableCell>
                <TableCell>{row.styleCode}</TableCell>
                <TableCell>{formatDate(row.shipDate)}</TableCell>
                <TableCell align="right">{formatQuantity(row.quantity)}</TableCell>
                <TableCell align="right">{formatQuantity(row.balance)}</TableCell>
                <TableCell align="right">{formatMoney(row.value)}</TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: `${DASHBOARD_COLORS.pageBg} !important` }}>
              <TableCell colSpan={5} sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>T O T A L</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>{formatQuantity(totalQuantity)}</TableCell>
              <TableCell />
              <TableCell align="right" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>{formatMoney(totalValue)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
