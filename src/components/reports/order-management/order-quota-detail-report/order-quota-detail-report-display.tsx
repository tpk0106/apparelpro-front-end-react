import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import type { OrderQuotaDetailReport } from "./order-quota-detail-report.types";
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import {
  plainTableBodyRowSx,
  plainTableHeaderCellSx,
  plainTableHeaderRowSx,
} from "../../../../themes/workspace-theme";
import KpiTile from "../../../common/kpi-tile";

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

// Renders the "ORDER QUOTA REPORT" as one flat table - legacy hid the
// Buyer/Order/Type/Style columns progressively as they were filtered on (sass1/sass2/sass3),
// a dot-matrix ditto convention; this grid always shows every column instead.
export default function OrderQuotaDetailReportDisplay({ report }: Props) {
  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2.5, flexDirection: "row" }} wrap="nowrap">
        <KpiTile
          label="Buyer Filter"
          value={report.buyerName ?? "All Buyers"}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 20 }}
        />
        <KpiTile
          label="Order Filter"
          value={report.order ?? "All Orders"}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 10 }}
        />
        <KpiTile
          label="Total Lines"
          value={String(report.rows.length)}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 8 }}
        />
      </Grid>

      <TableContainer
        component={Card}
        variant="outlined"
        sx={{ backgroundColor: DASHBOARD_COLORS.cardBg, border: `1px solid ${DASHBOARD_COLORS.border}` }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={plainTableHeaderRowSx()}>
              <TableCell sx={plainTableHeaderCellSx()}>Buyer</TableCell>
              <TableCell sx={plainTableHeaderCellSx()}>Order</TableCell>
              <TableCell sx={plainTableHeaderCellSx()}>Type</TableCell>
              <TableCell sx={plainTableHeaderCellSx()}>Style</TableCell>
              <TableCell sx={plainTableHeaderCellSx()}>Shp. Order No.</TableCell>
              <TableCell sx={plainTableHeaderCellSx()}>Quota Status</TableCell>
              <TableCell sx={plainTableHeaderCellSx()}>Quota Year</TableCell>
              <TableCell sx={plainTableHeaderCellSx()}>Quota Category</TableCell>
              <TableCell sx={plainTableHeaderCellSx()}>Quota Type</TableCell>
              <TableCell sx={plainTableHeaderCellSx()}>Unit</TableCell>
              <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Quantity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report.rows.map((row, index) => (
              <TableRow
                key={`${row.buyerCode}-${row.order}-${row.typeCode}-${row.styleCode}-${row.shipmentOrderNo}-${index}`}
                sx={plainTableBodyRowSx(index)}
              >
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
