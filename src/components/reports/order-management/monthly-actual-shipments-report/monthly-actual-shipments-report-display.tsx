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

import type { MonthlyActualShipmentsReport } from "./monthly-actual-shipments-report.types";

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

function HeaderField({ label, value }: { label: string; value: string }) {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
        {value}
      </Typography>
    </Grid>
  );
}

// Renders the "MONTHLY ACTUAL SHIPMENTS" report as one flat table - every commercial
// invoice line shipped within the selected Month/Year.
export default function MonthlyActualShipmentsReportDisplay({ report }: Props) {
  const totalQuantity = report.rows.reduce((sum, r) => sum + r.quantity, 0);
  const totalValue = report.rows.reduce((sum, r) => sum + r.value, 0);

  return (
    <Box>
      <Card
        variant="outlined"
        sx={{ p: 2, mb: 2.5, backgroundColor: "#fafafa", borderLeft: "5px solid #1a237e" }}
      >
        <Grid container spacing={2}>
          <HeaderField label="Shipment Month" value={`${MONTH_NAMES[report.month - 1]} ${report.year}`} />
          <HeaderField label="Total Lines" value={String(report.rows.length)} />
          <HeaderField label="Total Value" value={formatMoney(totalValue)} />
        </Grid>
      </Card>

      <TableContainer component={Card} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#eef1f7" }}>
              <TableCell>Invoice No.</TableCell>
              <TableCell>Buyer</TableCell>
              <TableCell>Order No</TableCell>
              <TableCell>Style</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Balance</TableCell>
              <TableCell align="right">Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report.rows.map((row, index) => (
              <TableRow key={`${row.invoiceNumber}-${row.orderNo}-${row.styleCode}-${index}`}>
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
            <TableRow sx={{ backgroundColor: "#eef1f7" }}>
              <TableCell colSpan={5} sx={{ fontWeight: "bold" }}>T O T A L</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>{formatQuantity(totalQuantity)}</TableCell>
              <TableCell />
              <TableCell align="right" sx={{ fontWeight: "bold" }}>{formatMoney(totalValue)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
