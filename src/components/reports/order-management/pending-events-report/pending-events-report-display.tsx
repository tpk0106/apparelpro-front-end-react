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

import type { PendingEventsReport } from "./pending-events-report.types";
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import {
  plainTableBodyRowSx,
  plainTableHeaderCellSx,
  plainTableHeaderRowSx,
} from "../../../../themes/workspace-theme";
import KpiTile from "../../../common/kpi-tile";

interface Props {
  report: PendingEventsReport;
}

const formatDate = (value: string | null): string => {
  if (!value) return "***";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "2-digit" });
};

// Renders the "PENDING EVENTS" report as one card per Buyer/Order/Type/Style group,
// each listing its still-pending milestone events - mirrors OD_EVPND.PRG's print break
// on key change.
export default function PendingEventsReportDisplay({ report }: Props) {
  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2.5, flexDirection: "row" }} wrap="nowrap">
        <KpiTile
          label="As Of Date"
          value={formatDate(report.asOfDate)}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 10 }}
        />
        <KpiTile
          label="Styles With Pending Events"
          value={String(report.groups.length)}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 14 }}
        />
      </Grid>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {report.groups.map((group, index) => (
          <Card
            key={`${group.buyerCode}-${group.order}-${group.typeCode}-${group.styleCode}-${index}`}
            variant="outlined"
            sx={{
              backgroundColor: DASHBOARD_COLORS.cardBg,
              border: `1px solid ${DASHBOARD_COLORS.border}`,
            }}
          >
            <Box
              sx={{
                p: 1.5,
                backgroundColor: DASHBOARD_COLORS.pageBg,
                borderBottom: `1px solid ${DASHBOARD_COLORS.border}`,
              }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary, display: "block" }}>Buyer</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>{group.buyerName}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary, display: "block" }}>Order</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>{group.order}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary, display: "block" }}>Type</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>{group.typeName}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary, display: "block" }}>Style</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>{group.styleCode}</Typography>
                </Grid>
              </Grid>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={plainTableHeaderRowSx()}>
                    <TableCell sx={plainTableHeaderCellSx()}>Event Code</TableCell>
                    <TableCell sx={plainTableHeaderCellSx()}>Description</TableCell>
                    <TableCell sx={plainTableHeaderCellSx()}>Scheduled Date</TableCell>
                    <TableCell sx={plainTableHeaderCellSx()}>Remarks</TableCell>
                    <TableCell sx={plainTableHeaderCellSx()}>Delay</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {group.events.map((evt, evtIndex) => (
                    <TableRow key={`${evt.eventCode}-${evtIndex}`} sx={plainTableBodyRowSx(evtIndex)}>
                      <TableCell>{evt.eventCode}</TableCell>
                      <TableCell>{evt.description}</TableCell>
                      <TableCell>{formatDate(evt.scheduledDate)}</TableCell>
                      <TableCell>{evt.remarks || "-"}</TableCell>
                      <TableCell>
                        {evt.delayDays !== null ? `${evt.delayDays} Days` : "No Scheduled Date"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
