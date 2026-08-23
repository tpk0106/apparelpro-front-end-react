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

import type { ScheduledShipmentsReport } from "./scheduled-shipments-report.types";

interface Props {
  report: ScheduledShipmentsReport;
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
    : d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "2-digit" });
};

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

// Renders the "SCHEDULE SHIPMENT DETAIL REPORT" as one flat table - legacy hid the
// Buyer/Order/Type/Style columns progressively as they were filtered on (sha1/sha2/sha3),
// a dot-matrix ditto convention; this grid always shows every column instead.
export default function ScheduledShipmentsReportDisplay({ report }: Props) {
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
              <TableCell>Unit</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell>Destination</TableCell>
              <TableCell>Ship Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report.rows.map((row, index) => (
              <TableRow key={`${row.buyerCode}-${row.order}-${row.typeCode}-${row.styleCode}-${row.shipmentOrderNo}-${index}`}>
                <TableCell>{row.buyerName}</TableCell>
                <TableCell>{row.order}</TableCell>
                <TableCell>{row.typeCode}</TableCell>
                <TableCell>{row.styleCode}</TableCell>
                <TableCell>{row.shipmentOrderNo}</TableCell>
                <TableCell>{row.unit}</TableCell>
                <TableCell align="right">{formatQuantity(row.quantity)}</TableCell>
                <TableCell>{row.destinationCode}</TableCell>
                <TableCell>{formatDate(row.shipDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
