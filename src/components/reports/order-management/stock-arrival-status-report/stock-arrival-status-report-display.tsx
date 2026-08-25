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

function HeaderField({ label, value }: { label: string; value: string }) {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
        {value}
      </Typography>
    </Grid>
  );
}

// Renders the "STOCK ARRIVAL STATUS REPORT" as one card per budgeted material item,
// each with its own nested table of Purchase Order lines - mirrors OD_STARV.PRG's
// nested od_sacc2 -> od_podet print loop.
export default function StockArrivalStatusReportDisplay({ report }: Props) {
  return (
    <Box>
      <Card
        variant="outlined"
        sx={{ p: 2, mb: 2.5, backgroundColor: "#fafafa", borderLeft: "5px solid #1a237e" }}
      >
        <Grid container spacing={2}>
          <HeaderField label="Buyer" value={`${report.buyerName} (${report.buyerCode})`} />
          <HeaderField label="Order" value={report.order} />
          <HeaderField label="Report Date" value={formatDate(report.asOfDate)} />
          <HeaderField label="Total Order Qty" value={`${formatQuantity(report.totalOrderQuantity)} ${report.unit}`} />
        </Grid>
      </Card>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {report.items.map((item, index) => (
          <Card key={`${item.itemCode}-${index}`} variant="outlined">
            <Box sx={{ p: 1.5, backgroundColor: "#eef1f7" }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>Item</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>{item.itemCode} - {item.description}</Typography>
                </Grid>
                <Grid size={{ xs: 4, sm: 2.5 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>Order Qty</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>{formatQuantity(item.orderedQuantity)} {item.unit}</Typography>
                </Grid>
                <Grid size={{ xs: 4, sm: 2.5 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>Received</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>{formatQuantity(item.totalReceivedQuantity)}</Typography>
                </Grid>
                <Grid size={{ xs: 4, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>Balance to Receive</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>{formatQuantity(item.balanceToReceive)}</Typography>
                </Grid>
              </Grid>
            </Box>

            {item.purchaseOrderLines.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>P/O No</TableCell>
                      <TableCell align="right">P/O Qty</TableCell>
                      <TableCell>Store</TableCell>
                      <TableCell>Supplier</TableCell>
                      <TableCell>Expected Date</TableCell>
                      <TableCell>Delay</TableCell>
                      <TableCell align="right">Supp. Return</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {item.purchaseOrderLines.map((line, lineIndex) => (
                      <TableRow key={`${line.purchaseOrderNumber}-${lineIndex}`}>
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
              <Typography variant="body2" sx={{ p: 2, fontStyle: "italic", color: "error.main" }}>
                ** Purchase Order Not Raised **
              </Typography>
            )}
          </Card>
        ))}
      </Box>
    </Box>
  );
}
