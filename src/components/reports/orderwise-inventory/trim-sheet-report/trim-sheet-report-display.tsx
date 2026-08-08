import type { ReactNode } from "react";
import {
  Alert,
  Box,
  Card,
  Chip,
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
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { format, parseISO } from "date-fns";

import type { TrimSheetReportDetails } from "./trim-sheet-report.types";

interface Props {
  report: TrimSheetReportDetails;
}

const formatMoney = (value: number): string =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatQuantity = (value: number): string =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });

// Renders the full "TRIM SHEET" report on screen, mirroring OD_TRIM.PRG's printed
// layout section-by-section: header, material lines grouped by stock code with a
// subtotal after each group, an honest placeholder for the two cost sources not yet
// migrated, a per-supplier value summary with grand total, an optional Estimated
// Profit block, and the approval stamp. See TrimSheetReportDetails' SCOPE NOTE
// (trim-sheet-report.types.ts) for what grandTotalValue does and doesn't include.
export default function TrimSheetReportDisplay({ report }: Props) {
  const currency = report.currencyCode || "N/A";

  console.log('report',report)

  return (
    <Box>
      {/* Header block. FIXED (2026-08-07): this was a plain unstyled <Paper> with no
          background override, so it silently inherited the app's dark theme surface color
          with no matching text-color override - the values rendered as dark text on a near-
          black background, effectively invisible. Restyled as an explicit light Card (same
          treatment already used by this feature's own selector header in
          trim-sheet-report-header.tsx: light background + a colored left border), so it reads
          correctly regardless of the surrounding theme. Also adds Buyer Name and Garment Type
          name, resolved server-side by TrimSheetReportService - previously only the raw
          numeric codes were shown. */}
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
            value={report.buyerName || String(report.buyerCode)}
          />
          <HeaderField label="Order" value={report.order} />
          <HeaderField
            label="Garment Type"
            value={report.typeName || String(report.typeCode)}
          />
          <HeaderField label="Style" value={report.styleCode} />
          <HeaderField label="Unit" value={report.unit} />
          <HeaderField
            label="Style Quantity"
            value={formatQuantity(report.styleQuantity)}
          />
          <HeaderField
            label="Unit Price"
            value={`${formatMoney(report.unitPrice)} ${currency}`}
          />
          <HeaderField
            label="Basis"
            value={`${report.basisCode} - ${report.basisDescription}`}
          />
          <HeaderField label="Report Currency" value={currency} />
        </Grid>
      </Card>

      {/* Material Consumption lines, grouped by stock code with a subtotal after each group */}
      {report.stockGroupSubtotals.map((group) => {
        const groupLines = report.lines.filter(
          (line) => line.stockCode === group.stockCode,
        );
        return (
          <Paper
            key={group.stockCode}
            variant="outlined"
            sx={{ mb: 2, overflow: "hidden" }}
          >
            <Box sx={{ px: 2, py: 1, backgroundColor: "#eef1f7" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                {group.stockCode} - {group.stockDescription}
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item Code</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Cons. / Garment</TableCell>
                    <TableCell align="right">Total Consumption</TableCell>
                    <TableCell align="right">
                      Unit Price ({currency})
                    </TableCell>
                    <TableCell align="right">Value ({currency})</TableCell>
                    <TableCell>Supplier</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupLines.map((line, index) => (
                    <TableRow key={`${line.itemCode}-${index}`}>
                      <TableCell>
                        {line.itemCode}
                        {[
                          line.feature1,
                          line.feature2,
                          line.feature3,
                          line.feature4,
                        ]
                          .filter(Boolean)
                          .join(" / ") && (
                          <Typography
                            variant="caption"
                            sx={{ display: "block", color: "text.secondary" }}
                          >
                            {[
                              line.feature1,
                              line.feature2,
                              line.feature3,
                              line.feature4,
                            ]
                              .filter(Boolean)
                              .join(" / ")}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{line.description}</TableCell>
                      <TableCell align="right">
                        {line.isConsumptionCalculated ? (
                          `${formatQuantity(line.quantityPerGarment)} ${line.consumptionUnit}`
                        ) : (
                          <Chip
                            label="** Ignored **"
                            size="small"
                            variant="outlined"
                            color="warning"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {formatQuantity(line.totalConsumption)} {line.itemUnit}
                      </TableCell>
                      <TableCell align="right">
                        {formatMoney(line.convertedUnitPrice)}
                      </TableCell>
                      <TableCell align="right">
                        {formatMoney(line.value)}
                      </TableCell>
                      <TableCell>
                        {line.supplierName || line.supplierCode || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
                Cost / Garment:{" "}
                <strong>{formatMoney(group.costPerGarment)}</strong>
              </Typography>
              <Typography variant="body2">
                Subtotal Value:{" "}
                <strong>
                  {formatMoney(group.subtotalValue)} {currency}
                </strong>
              </Typography>
              <Typography variant="body2">
                % of Unit Price:{" "}
                <strong>{group.percentageOfUnitPrice.toFixed(2)}%</strong>
              </Typography>
            </Box>
          </Paper>
        );
      })}

      {/* Honest placeholder for the two legacy cost sources not yet migrated */}
      {(!report.subContractSectionAvailable ||
        !report.productionLineSectionAvailable) && (
        <Alert
          icon={<InfoOutlinedIcon fontSize="inherit" />}
          severity="info"
          variant="outlined"
          sx={{ mb: 2.5 }}
        >
          Sub Contract costs and Production Line costs are not yet available
          in this system, so the totals below cover Material Consumption
          only. Contact Merchandising if a full legacy-equivalent total is
          required.
        </Alert>
      )}

      {/* Supplier value summary + grand total */}
      <Paper variant="outlined" sx={{ mb: 2.5, overflow: "hidden" }}>
        <Box sx={{ px: 2, py: 1, backgroundColor: "#eef1f7" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
            Supplier Value Summary
          </Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Supplier Code</TableCell>
                <TableCell>Supplier Name</TableCell>
                <TableCell align="right">Value ({currency})</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report.supplierTotals.map((supplier) => (
                <TableRow key={supplier.supplierCode}>
                  <TableCell>{supplier.supplierCode}</TableCell>
                  <TableCell>{supplier.supplierName || "—"}</TableCell>
                  <TableCell align="right">
                    {formatMoney(supplier.totalValue)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={2}>
                  <Typography sx={{ fontWeight: "bold" }}>
                    Total Value - {currency}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontWeight: "bold" }}>
                    {formatMoney(report.grandTotalValue)}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Estimated Profit - only present when the backend decided this caller may see it */}
      {report.profit && (
        <Paper
          variant="outlined"
          sx={{ p: 2, mb: 2.5, backgroundColor: "#fffde7" }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: "bold", mb: 1 }}
          >
            Estimated Profit (restricted view)
          </Typography>
          <Grid container spacing={2}>
            <HeaderField
              label="Unit Price / Garment"
              value={formatMoney(report.profit.unitPricePerGarment)}
            />
            <HeaderField
              label="Cost / Garment"
              value={`${formatMoney(report.profit.costPerGarment)} (${report.profit.costPercentageOfUnitPrice.toFixed(2)}%)`}
            />
            <HeaderField
              label="Estimated Profit / Garment"
              value={
                <Typography
                  component="span"
                  sx={{
                    fontWeight: 700,
                    color:
                      report.profit.estimatedProfitPerGarment < 0
                        ? "#c62828"
                        : "#1b5e20",
                  }}
                >
                  {formatMoney(report.profit.estimatedProfitPerGarment)} (
                  {report.profit.estimatedProfitPercentage.toFixed(2)}%)
                </Typography>
              }
            />
          </Grid>
        </Paper>
      )}

      {/* Approval stamp */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        {report.approvalStamp ? (
          <Typography
            variant="body2"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "#1b5e20",
              fontWeight: "bold",
            }}
          >
            <VerifiedUserIcon fontSize="small" />
            Approved by {report.approvalStamp.approvedByUserId} on{" "}
            {format(parseISO(report.approvalStamp.approvedDate), "dd-MMM-yyyy")}
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary" }}>
            Not yet approved.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

function HeaderField({
  label,
  value,
}: {
  label: string;
  value: string | number | ReactNode;
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
