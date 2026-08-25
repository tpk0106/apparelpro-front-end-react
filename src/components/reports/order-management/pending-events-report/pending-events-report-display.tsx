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

// Renders the "PENDING EVENTS" report as one card per Buyer/Order/Type/Style group,
// each listing its still-pending milestone events - mirrors OD_EVPND.PRG's print break
// on key change.
export default function PendingEventsReportDisplay({ report }: Props) {
  return (
    <Box>
      <Card
        variant="outlined"
        sx={{ p: 2, mb: 2.5, backgroundColor: "#fafafa", borderLeft: "5px solid #1a237e" }}
      >
        <Grid container spacing={2}>
          <HeaderField label="As Of Date" value={formatDate(report.asOfDate)} />
          <HeaderField label="Styles With Pending Events" value={String(report.groups.length)} />
        </Grid>
      </Card>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {report.groups.map((group, index) => (
          <Card key={`${group.buyerCode}-${group.order}-${group.typeCode}-${group.styleCode}-${index}`} variant="outlined">
            <Box sx={{ p: 1.5, backgroundColor: "#eef1f7" }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>Buyer</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>{group.buyerName}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>Order</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>{group.order}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>Type</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>{group.typeName}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>Style</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>{group.styleCode}</Typography>
                </Grid>
              </Grid>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Event Code</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Scheduled Date</TableCell>
                    <TableCell>Remarks</TableCell>
                    <TableCell>Delay</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {group.events.map((evt, evtIndex) => (
                    <TableRow key={`${evt.eventCode}-${evtIndex}`}>
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
