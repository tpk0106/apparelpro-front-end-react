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

import type { OrderQuotaDetailReport } from "./order-quota-detail-report.types";

interface Props {
  report: OrderQuotaDetailReport;
}

const formatQuantity = (value: number): string =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const formatQuotaStatus = (value: string): string =>
  value === "Q" ? "Quota" : "Non-Quota";

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

// Renders the "ORDER QUOTA REPORT" as one flat table - legacy hid the
// Buyer/Order/Type/Style columns progressively as they were filtered on (sass1/sass2/sass3),
// a dot-matrix ditto convention; this grid always shows every column instead.
export default function OrderQuotaDetailReportDisplay({ report }: Props) {
  return (
    <Box>
      <Card
        variant="outlined"
        sx={{ p: 2, mb: 2.5, backgroundColor: "#fafafa", borderLeft: "5px solid #1a237e" }}
      >
        <Grid container spacing={2}>
          <HeaderField label="Buyer Filter" value={report.buyerCode ? String(report.buyerCode) : "All Buyers"} />
          <HeaderField label="Order Filter" value={report.order ?? "All Orders"} />
          <HeaderField label="Total Lines" value={String(report.rows.length)} />
        </Grid>
      </Card>

      <TableContainer component={Card} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#eef1f7" }}>
              <TableCell>Buyer</TableCell>
              <TableCell>Order</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Style</TableCell>
              <TableCell>Shp. Order No.</TableCell>
              <TableCell>Quota Status</TableCell>
              <TableCell>Quota Year</TableCell>
              <TableCell>Quota Category</TableCell>
              <TableCell>Quota Type</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell align="right">Quantity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report.rows.map((row, index) => (
              <TableRow key={`${row.buyerCode}-${row.order}-${row.typeCode}-${row.styleCode}-${row.shipmentOrderNo}-${index}`}>
                <TableCell>{row.buyerName}</TableCell>
                <TableCell>{row.order}</TableCell>
                <TableCell>{row.typeName}</TableCell>
                <TableCell>{row.styleCode}</TableCell>
                <TableCell>{row.shipmentOrderNo}</TableCell>
                <TableCell>{formatQuotaStatus(row.quotaStatus)}</TableCell>
                <TableCell>{row.fromYearMonth} - {row.toYearMonth}</TableCell>
                <TableCell>{row.quotaCategory}</TableCell>
                <TableCell>{row.quotaType}</TableCell>
                <TableCell>{row.unit}</TableCell>
                <TableCell align="right">{formatQuantity(row.quantity)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
