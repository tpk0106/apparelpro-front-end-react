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
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import {
  plainTableBodyRowSx,
  plainTableHeaderCellSx,
  plainTableHeaderRowSx,
} from "../../../../themes/workspace-theme";

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
        sx={{ p: 3, textAlign: "center", color: DASHBOARD_COLORS.textSecondary }}
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
          sx={{
            mb: 2,
            overflow: "hidden",
            backgroundColor: DASHBOARD_COLORS.cardBg,
            border: `1px solid ${DASHBOARD_COLORS.border}`,
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1,
              backgroundColor: DASHBOARD_COLORS.pageBg,
              borderBottom: `1px solid ${DASHBOARD_COLORS.border}`,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}
            >
              {basisGroup.basisName || basisGroup.basisCode}
            </Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={plainTableHeaderRowSx()}>
                  <TableCell sx={plainTableHeaderCellSx()}>P/O No</TableCell>
                  <TableCell sx={plainTableHeaderCellSx()}>Date</TableCell>
                  <TableCell sx={plainTableHeaderCellSx()}>Supplier</TableCell>
                  <TableCell sx={plainTableHeaderCellSx()}>P/I No</TableCell>
                  <TableCell sx={plainTableHeaderCellSx()}>Currency</TableCell>
                  <TableCell sx={plainTableHeaderCellSx()}>Buyer</TableCell>
                  <TableCell sx={plainTableHeaderCellSx()}>Order</TableCell>
                  <TableCell sx={plainTableHeaderCellSx()}>Type</TableCell>
                  <TableCell sx={plainTableHeaderCellSx()}>Style</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {basisGroup.purchaseOrders.flatMap((po) =>
                  po.outstandingGroups.map((group, index) => (
                    <TableRow key={`${po.purchaseOrderNumber}-${index}`} sx={plainTableBodyRowSx(index)}>
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
