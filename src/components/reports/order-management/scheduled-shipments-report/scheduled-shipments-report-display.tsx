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

import type { ScheduledShipmentsReport } from "./scheduled-shipments-report.types";
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import {
  plainTableBodyRowSx,
  plainTableHeaderCellSx,
  plainTableHeaderRowSx,
} from "../../../../themes/workspace-theme";
import KpiTile from "../../../common/kpi-tile";

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

// Renders the "SCHEDULE SHIPMENT DETAIL REPORT" as one flat table - legacy hid the
// Buyer/Order/Type/Style columns progressively as they were filtered on (sha1/sha2/sha3),
// a dot-matrix ditto convention; this grid always shows every column instead.
export default function ScheduledShipmentsReportDisplay({ report }: Props) {
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
              <TableCell sx={plainTableHeaderCellSx()}>Unit</TableCell>
              <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Quantity</TableCell>
              <TableCell sx={plainTableHeaderCellSx()}>Destination</TableCell>
              <TableCell sx={plainTableHeaderCellSx()}>Ship Date</TableCell>
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
