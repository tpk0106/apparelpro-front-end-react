import {
  Box,
  Card,
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
      <Card
        variant="outlined"
        sx={{
          p: 2,
          mb: 2.5,
          backgroundColor: "#fafafa",
          borderLeft: "5px solid #1a237e",
        }}
      >
        <Grid container spacing={2}>
          <HeaderField
            label="Buyer"
            value={`${report.buyerCode} - ${report.buyerName || "N/A"}`}
          />
          <HeaderField label="Order" value={report.order} />
          <HeaderField
            label="Order Date"
            value={format(parseISO(report.orderDate), "dd-MMM-yyyy")}
          />
          <HeaderField label="Unit" value={report.unit} />
          <HeaderField label="Currency" value={currency} />
        </Grid>
      </Card>

      {report.styles.map((style) => (
        <Paper
          key={`${style.typeCode}-${style.styleCode}`}
          variant="outlined"
          sx={{ mb: 2, overflow: "hidden" }}
        >
          <Box sx={{ px: 2, py: 1, backgroundColor: "#eef1f7" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              Style: {style.styleCode}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Type: {style.typeCode} - {style.typeName || "N/A"} &nbsp;|&nbsp;
              Qty: {formatQuantity(style.quantity)} {style.unit} &nbsp;|&nbsp;
              Unit Price: {formatMoney(style.unitPrice)} {currency}
            </Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>New Order</TableCell>
                  <TableCell>Destination</TableCell>
                  <TableCell>Ship Date</TableCell>
                  <TableCell align="right">Qty ({style.unit})</TableCell>
                  <TableCell align="right">Value ({currency})</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {style.partShipments.map((part, index) => (
                  <TableRow key={`${part.newOrder}-${index}`}>
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
              <Divider />
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 4,
                  backgroundColor: "#fafafa",
                }}
              >
                <Typography variant="body2">
                  Total Qty:{" "}
                  <strong>
                    {formatQuantity(style.totalQuantity)} {style.unit}
                  </strong>
                </Typography>
                <Typography variant="body2">
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

      <Paper variant="outlined" sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          Grand Total Value - {currency}: {formatMoney(report.grandTotalValue)}
        </Typography>
      </Paper>
    </Box>
  );
}

function HeaderField({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          textTransform: "uppercase",
          color: "#5f6b7a",
        }}
      >
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 600, color: "#1a2027" }}>
        {value}
      </Typography>
    </Grid>
  );
}
