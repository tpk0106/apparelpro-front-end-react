import type { ReactNode } from "react";
import {
  Alert,
  Box,
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
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import {
  plainTableBodyRowSx,
  plainTableHeaderCellSx,
  plainTableHeaderRowSx,
} from "../../../../themes/workspace-theme";
import KpiTile from "../../../common/kpi-tile";

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

const cardSx = {
  backgroundColor: DASHBOARD_COLORS.cardBg,
  border: `1px solid ${DASHBOARD_COLORS.border}`,
};

// Renders the full "TRIM SHEET" report on screen, mirroring OD_TRIM.PRG's printed
// layout section-by-section: header, material lines grouped by stock code with a
// subtotal after each group, an honest placeholder for the two cost sources not yet
// migrated, a per-supplier value summary with grand total, an optional Estimated
// Profit block, and the approval stamp. See TrimSheetReportDetails' SCOPE NOTE
// (trim-sheet-report.types.ts) for what grandTotalValue does and doesn't include.
export default function TrimSheetReportDisplay({ report }: Props) {
  const currency = report.currencyCode || "N/A";

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2.5, flexDirection: "row" }} wrap="nowrap">
        <KpiTile
          label="Buyer"
          value={report.buyerName || String(report.buyerCode)}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 18 }}
        />
        <KpiTile
          label="Order"
          value={report.order}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 10 }}
        />
        <KpiTile
          label="Garment Type"
          value={report.typeName || String(report.typeCode)}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 10 }}
        />
        <KpiTile
          label="Style"
          value={report.styleCode}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 8 }}
        />
        <KpiTile
          label="Unit"
          value={report.unit}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 6 }}
        />
        <KpiTile
          label="Style Quantity"
          value={formatQuantity(report.styleQuantity)}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 10 }}
        />
        <KpiTile
          label="Unit Price"
          value={`${formatMoney(report.unitPrice)} ${currency}`}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 10 }}
        />
        <KpiTile
          label="Basis"
          value={`${report.basisCode} - ${report.basisDescription}`}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 12 }}
        />
        <KpiTile
          label="Report Currency"
          value={currency}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 6 }}
        />
      </Grid>

      {/* Material Consumption lines, grouped by stock code with a subtotal after each group */}
      {report.stockGroupSubtotals.map((group) => {
        const groupLines = report.lines.filter(
          (line) => line.stockCode === group.stockCode,
        );
        return (
          <Paper
            key={group.stockCode}
            variant="outlined"
            sx={{ mb: 2, overflow: "hidden", ...cardSx }}
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
                {group.stockCode} - {group.stockDescription}
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={plainTableHeaderRowSx()}>
                    <TableCell sx={plainTableHeaderCellSx()}>Item Code</TableCell>
                    <TableCell sx={plainTableHeaderCellSx()}>Description</TableCell>
                    <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>
                      Cons. / Garment
                    </TableCell>
                    <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>
                      Total Consumption
                    </TableCell>
                    <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>
                      Unit Price ({currency})
                    </TableCell>
                    <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>
                      Value ({currency})
                    </TableCell>
                    <TableCell sx={plainTableHeaderCellSx()}>Supplier</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupLines.map((line, index) => (
                    <TableRow key={`${line.itemCode}-${index}`} sx={plainTableBodyRowSx(index)}>
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
                            sx={{ display: "block", color: DASHBOARD_COLORS.textSecondary }}
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
            <Divider sx={{ borderColor: DASHBOARD_COLORS.border }} />
            <Box
              sx={{
                px: 2,
                py: 1,
                display: "flex",
                justifyContent: "flex-end",
                gap: 4,
                backgroundColor: DASHBOARD_COLORS.pageBg,
              }}
            >
              <Typography variant="body2" sx={{ color: DASHBOARD_COLORS.textPrimary }}>
                Cost / Garment:{" "}
                <strong>{formatMoney(group.costPerGarment)}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: DASHBOARD_COLORS.textPrimary }}>
                Subtotal Value:{" "}
                <strong>
                  {formatMoney(group.subtotalValue)} {currency}
                </strong>
              </Typography>
              <Typography variant="body2" sx={{ color: DASHBOARD_COLORS.textPrimary }}>
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
      <Paper variant="outlined" sx={{ mb: 2.5, overflow: "hidden", ...cardSx }}>
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
            Supplier Value Summary
          </Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={plainTableHeaderRowSx()}>
                <TableCell sx={plainTableHeaderCellSx()}>Supplier Code</TableCell>
                <TableCell sx={plainTableHeaderCellSx()}>Supplier Name</TableCell>
                <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>
                  Value ({currency})
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report.supplierTotals.map((supplier, index) => (
                <TableRow key={supplier.supplierCode} sx={plainTableBodyRowSx(index)}>
                  <TableCell>{supplier.supplierCode}</TableCell>
                  <TableCell>{supplier.supplierName || "—"}</TableCell>
                  <TableCell align="right">
                    {formatMoney(supplier.totalValue)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow
                sx={{
                  ...plainTableBodyRowSx(report.supplierTotals.length),
                  backgroundColor: `${DASHBOARD_COLORS.pageBg} !important`,
                }}
              >
                <TableCell colSpan={2}>
                  <Typography sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>
                    Total Value - {currency}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>
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
          sx={{ p: 2, mb: 2.5, ...cardSx }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: "bold", mb: 1, color: DASHBOARD_COLORS.accent }}
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
                        ? DASHBOARD_COLORS.critical
                        : DASHBOARD_COLORS.success,
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
      <Paper variant="outlined" sx={{ p: 2, ...cardSx }}>
        {report.approvalStamp ? (
          <Typography
            variant="body2"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: DASHBOARD_COLORS.success,
              fontWeight: "bold",
            }}
          >
            <VerifiedUserIcon fontSize="small" />
            Approved by {report.approvalStamp.approvedByUserId} on{" "}
            {format(parseISO(report.approvalStamp.approvedDate), "dd-MMM-yyyy")}
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ fontStyle: "italic", color: DASHBOARD_COLORS.textSecondary }}>
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
          color: DASHBOARD_COLORS.textSecondary,
        }}
      >
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 600, color: DASHBOARD_COLORS.textPrimary }}>
        {value}
      </Typography>
    </Grid>
  );
}
