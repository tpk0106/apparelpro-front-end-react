import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { format, parseISO } from "date-fns";

import type { OutstandingPurchaseOrderListReport } from "./outstanding-purchase-order-list-report.types";

interface Props {
  report: OutstandingPurchaseOrderListReport;
}

// Renders the full "OUTSTANDING P/O's LISTING - Date Wise" report on screen, mirroring
// OutstandingPurchaseOrderListReportEngine.cs's PDF layout: one section per Basis (name
// shown, not code), each with a flat table - one row per outstanding Buyer/Order/Type/
// Style group found (a P/O with multiple outstanding groups appears more than once).
export default function OutstandingPurchaseOrderListReportDisplay({
  report,
}: Props) {
  if (report.basisGroups.length === 0) {
    return (
      <Paper
        elevation={0}
        variant="outlined"
        sx={{ p: 3, textAlign: "center", color: "text.secondary" }}
      >
        <Typography variant="body2">
          No outstanding Purchase Orders found for the given criteria.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {report.basisGroups.map((basisGroup) => (
        <Paper
          key={basisGroup.basisCode}
          variant="outlined"
          sx={{ mb: 2, overflow: "hidden" }}
        >
          <Box sx={{ px: 2, py: 1, backgroundColor: "#eef1f7" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              {basisGroup.basisName || basisGroup.basisCode}
            </Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>P/O No</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>P/I No</TableCell>
                  <TableCell>Currency</TableCell>
                  <TableCell>Buyer</TableCell>
                  <TableCell>Order</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Style</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {basisGroup.purchaseOrders.flatMap((po) =>
                  po.outstandingGroups.map((group, index) => (
                    <TableRow key={`${po.purchaseOrderNumber}-${index}`}>
                      <TableCell>{po.purchaseOrderNumber}</TableCell>
                      <TableCell>
                        {po.createdDate
                          ? format(parseISO(po.createdDate), "dd-MMM-yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {po.supplierName || po.supplierCode}
                      </TableCell>
                      <TableCell>{po.proformaInvoiceNo || "-"}</TableCell>
                      <TableCell>{po.currencyCode}</TableCell>
                      <TableCell>
                        {group.buyerName || String(group.buyerCode)}
                      </TableCell>
                      <TableCell>{group.order}</TableCell>
                      <TableCell>
                        {group.typeName || String(group.typeCode)}
                      </TableCell>
                      <TableCell>{group.styleCode}</TableCell>
                    </TableRow>
                  )),
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ))}
    </Box>
  );
}
