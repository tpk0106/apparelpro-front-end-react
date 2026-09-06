import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { format, parseISO } from "date-fns";

import type { PurchaseOrderListReport } from "./purchase-order-list-report.types";
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import {
  plainTableBodyRowSx,
  plainTableHeaderCellSx,
  plainTableHeaderRowSx,
} from "../../../../themes/workspace-theme";
import KpiTile from "../../../common/kpi-tile";

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
      <Grid container spacing={2} sx={{ mb: 2.5, flexDirection: "row" }} wrap="nowrap">
        <KpiTile
          label="P/O No."
          value={report.purchaseOrderNumber}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 10 }}
        />
        <KpiTile
          label="Supplier"
          value={report.supplierName || report.supplierCode}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 20 }}
        />
        <KpiTile
          label="Currency"
          value={report.currencyCode}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 6 }}
        />
        <KpiTile
          label="P/I No."
          value={report.proformaInvoiceNo || "-"}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 10 }}
        />
        <KpiTile
          label="P/I Date"
          value={
            report.proformaInvoiceDate
              ? format(parseISO(report.proformaInvoiceDate), "dd-MMM-yyyy")
              : "-"
          }
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 10 }}
        />
      </Grid>

      <Paper
        variant="outlined"
        sx={{
          overflow: "hidden",
          backgroundColor: DASHBOARD_COLORS.cardBg,
          border: `1px solid ${DASHBOARD_COLORS.border}`,
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={plainTableHeaderRowSx()}>
                <TableCell sx={plainTableHeaderCellSx()}>Item Code</TableCell>
                <TableCell sx={plainTableHeaderCellSx()}>Description</TableCell>
                <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>
                  Order Qty
                </TableCell>
                <TableCell sx={plainTableHeaderCellSx()}>Unit</TableCell>
                <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>
                  Unit Price
                </TableCell>
                <TableCell sx={plainTableHeaderCellSx()}>Buyer</TableCell>
                <TableCell sx={plainTableHeaderCellSx()}>Order</TableCell>
                <TableCell sx={plainTableHeaderCellSx()}>Type</TableCell>
                <TableCell sx={plainTableHeaderCellSx()}>Style</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report.lines.map((line, index) => (
                <TableRow key={`${line.itemCode}-${index}`} sx={plainTableBodyRowSx(index)}>
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
