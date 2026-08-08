import {
  Box,
  Card,
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

import type { PurchaseOrderListReport } from "./purchase-order-list-report.types";

interface Props {
  report: PurchaseOrderListReport;
}

const formatQuantity = (value: number): string =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatMoney = (value: number): string =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Renders the full "PURCHASE ORDER LIST" report on screen, mirroring
// PurchaseOrderListReportEngine.cs's PDF layout: header fields, then a single flat
// table of every line item on the P/O (no grand total row - legacy doesn't have one
// for this report). See PurchaseOrderListReport's doc comment
// (purchase-order-list-report.types.ts) for the one legacy field intentionally not
// shown here (the P/O's creation Date/Time).
export default function PurchaseOrderListReportDisplay({ report }: Props) {
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
          <HeaderField label="P/O No." value={report.purchaseOrderNumber} />
          <HeaderField
            label="Supplier"
            value={report.supplierName || report.supplierCode}
          />
          <HeaderField label="Currency" value={report.currencyCode} />
          <HeaderField
            label="P/I No."
            value={report.proformaInvoiceNo || "-"}
          />
          <HeaderField
            label="P/I Date"
            value={
              report.proformaInvoiceDate
                ? format(parseISO(report.proformaInvoiceDate), "dd-MMM-yyyy")
                : "-"
            }
          />
        </Grid>
      </Card>

      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Item Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Order Qty</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell>Buyer</TableCell>
                <TableCell>Order</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Style</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report.lines.map((line, index) => (
                <TableRow key={`${line.itemCode}-${index}`}>
                  <TableCell>{line.itemCode}</TableCell>
                  <TableCell>{line.description}</TableCell>
                  <TableCell align="right">
                    {formatQuantity(line.orderQuantity)}
                  </TableCell>
                  <TableCell>{line.orderUnit}</TableCell>
                  <TableCell align="right">
                    {formatMoney(line.unitPrice)}
                  </TableCell>
                  <TableCell>
                    {line.buyerName || String(line.buyerCode)}
                  </TableCell>
                  <TableCell>{line.order}</TableCell>
                  <TableCell>
                    {line.typeName || String(line.typeCode)}
                  </TableCell>
                  <TableCell>{line.styleCode}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
