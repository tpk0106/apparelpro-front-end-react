import {
  Box,
  Card,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import type { YearSeasonOrdersReport } from "./year-season-orders-report.types";

interface Props {
  report: YearSeasonOrdersReport;
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
    : d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" });
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

// Renders the "ORDER CONFIRMATION REPORT" family as one card per order, each with its
// own nested table of Styles and a grand total value - mirrors OD_RPO2.PRG's nested
// od_po -> od_style print loop (mr_dart1-4 collapse into one shape, same pattern as
// Scheduled Shipments Report).
export default function YearSeasonOrdersReportDisplay({ report }: Props) {
  return (
    <Box>
      <Card
        variant="outlined"
        sx={{ p: 2, mb: 2.5, backgroundColor: "#fafafa", borderLeft: "5px solid #1a237e" }}
      >
        <Grid container spacing={2}>
          <HeaderField label="Year Filter" value={report.year ? String(report.year) : "All Years"} />
          <HeaderField label="Season Filter" value={report.season ?? "All Seasons"} />
          <HeaderField label="Total Orders" value={String(report.rows.length)} />
        </Grid>
      </Card>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {report.rows.map((row, index) => (
          <Card key={`${row.buyerCode}-${row.order}-${index}`} variant="outlined">
            <Box sx={{ p: 1.5, backgroundColor: "#eef1f7" }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary" display="block">Buyer</Typography>
                  <Typography variant="body2" fontWeight="bold">{row.buyerName} ({row.buyerCode})</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">Order</Typography>
                  <Typography variant="body2" fontWeight="bold">{row.order}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">Date</Typography>
                  <Typography variant="body2" fontWeight="bold">{formatDate(row.orderDate)}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 2.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block">Season</Typography>
                  <Typography variant="body2" fontWeight="bold">{row.seasonDescription || row.seasonCode}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 2.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block">Currency</Typography>
                  <Typography variant="body2" fontWeight="bold">{row.currencyCode}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <Typography variant="caption" color="text.secondary" display="block">Description</Typography>
                  <Typography variant="body2" fontWeight="bold">{row.description || "-"}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">Country</Typography>
                  <Typography variant="body2" fontWeight="bold">{row.countryCode}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">Total Qty</Typography>
                  <Typography variant="body2" fontWeight="bold">{formatQuantity(row.totalQuantity)} {row.unit}</Typography>
                </Grid>
              </Grid>
            </Box>

            {row.styles.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Style</TableCell>
                      <TableCell>Unit</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.styles.map((style, styleIndex) => (
                      <TableRow key={`${style.typeCode}-${style.styleCode}-${styleIndex}`}>
                        <TableCell>{style.typeName || style.typeCode}</TableCell>
                        <TableCell>{style.styleCode}</TableCell>
                        <TableCell>{style.unit}</TableCell>
                        <TableCell align="right">{formatQuantity(style.quantity)}</TableCell>
                        <TableCell align="right">{formatQuantity(style.unitPrice)}</TableCell>
                        <TableCell align="right">{formatQuantity(style.totalValue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" sx={{ p: 2, fontStyle: "italic", color: "text.secondary" }}>
                No styles found for this order.
              </Typography>
            )}

            <Divider />
            <Box sx={{ p: 1.5, display: "flex", justifyContent: "flex-end" }}>
              <Typography variant="body2">
                Grand Total Value: <strong>{formatQuantity(row.grandTotalValue)}</strong>
              </Typography>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
