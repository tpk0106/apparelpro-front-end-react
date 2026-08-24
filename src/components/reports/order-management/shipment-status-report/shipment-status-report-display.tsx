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

// Renders the "SHIPMENT STATUS REPORT" as one card per schedule line (Type/Style/Shp.
// Order No.), each with its own nested table of actually-invoiced quantities and a
// Balance to Ship total - mirrors OD_SHPST.PRG's nested od_part -> ie_coin2 print loop.
export default function ShipmentStatusReportDisplay({ report }: Props) {
  return (
    <Box>
      <Card
        variant="outlined"
        sx={{ p: 2, mb: 2.5, backgroundColor: "#fafafa", borderLeft: "5px solid #1a237e" }}
      >
        <Grid container spacing={2}>
          <HeaderField label="Buyer" value={`${report.buyerName} (${report.buyerCode})`} />
          <HeaderField label="Order" value={report.order} />
          <HeaderField label="Shipment Lines" value={String(report.rows.length)} />
        </Grid>
      </Card>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {report.rows.map((row, index) => (
          <Card
            key={`${row.typeCode}-${row.styleCode}-${row.shipmentOrderNo}-${index}`}
            variant="outlined"
          >
            <Box sx={{ p: 1.5, backgroundColor: "#eef1f7" }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">Type</Typography>
                  <Typography variant="body2" fontWeight="bold">{row.typeName}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 2.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block">Style</Typography>
                  <Typography variant="body2" fontWeight="bold">{row.styleCode}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 2.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block">Shp. Order No.</Typography>
                  <Typography variant="body2" fontWeight="bold">{row.shipmentOrderNo}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block">Unit</Typography>
                  <Typography variant="body2" fontWeight="bold">{row.unit}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 3.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block">Destination</Typography>
                  <Typography variant="body2" fontWeight="bold">{row.destinationCode}</Typography>
                </Grid>
              </Grid>
            </Box>

            {row.invoiceLines.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="right">Quantity Shipped</TableCell>
                      <TableCell>Ship Date</TableCell>
                      <TableCell>Invoice No</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.invoiceLines.map((line, lineIndex) => (
                      <TableRow key={`${line.invoiceNumber}-${lineIndex}`}>
                        <TableCell align="right">{formatQuantity(line.quantityShipped)}</TableCell>
                        <TableCell>{formatDate(line.invoiceDate)}</TableCell>
                        <TableCell>{line.invoiceNumber}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" sx={{ p: 2, fontStyle: "italic", color: "text.secondary" }}>
                No invoiced shipments yet.
              </Typography>
            )}

            <Divider />
            <Box sx={{ p: 1.5, display: "flex", justifyContent: "flex-end", gap: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Total Shipped: <strong>{formatQuantity(row.totalQuantityShipped)}</strong>
              </Typography>
              <Typography variant="body2">
                Balance to Ship: <strong>{formatQuantity(row.balanceToShip)}</strong>
              </Typography>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
