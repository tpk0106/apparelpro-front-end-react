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

import type { PostOrderCostSheetReport } from "./post-order-cost-sheet-report.types";
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import {
  plainTableBodyRowSx,
  plainTableHeaderCellSx,
  plainTableHeaderRowSx,
} from "../../../../themes/workspace-theme";
import KpiTile from "../../../common/kpi-tile";

interface Props {
  report: PostOrderCostSheetReport;
}

const formatQuantity = (value: number): string =>
  value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const formatMoney = (value: number): string =>
  value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatCost = (value: number): string =>
  value.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });

const formatDate = (value: string | null): string => {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "2-digit" });
};

function HeaderField({ label, value }: { label: string; value: string }) {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary, display: "block" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>
        {value}
      </Typography>
    </Grid>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.accent, mb: 1 }}>
      {children}
    </Typography>
  );
}

const cardSx = {
  p: 2,
  backgroundColor: DASHBOARD_COLORS.cardBg,
  border: `1px solid ${DASHBOARD_COLORS.border}`,
};

const totalRowSx = { backgroundColor: `${DASHBOARD_COLORS.pageBg} !important` };
const grandTotalRowSx = { backgroundColor: `${DASHBOARD_COLORS.accent}22 !important` };
const boldCellSx = { fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary };

// Renders the "POST ORDER COST SHEET" - mirrors OD_PCOST.PRG's cost-per-piece /
// cost-per-dozen / total-value breakdown across materials, in-house production,
// additional costs and sub contracts, weighed against sales value, finance charges
// and freight to arrive at gross/net profit.
export default function PostOrderCostSheetReportDisplay({ report }: Props) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Grid container spacing={2} sx={{ flexDirection: "row" }} wrap="nowrap">
        <KpiTile
          label="Buyer"
          value={report.buyerName}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 20 }}
        />
        <KpiTile
          label="Order"
          value={report.order}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 10 }}
        />
        <KpiTile
          label="Total Order Qty"
          value={formatQuantity(report.totalOrderQuantity)}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 8 }}
        />
        <KpiTile
          label="Currency / Basis"
          value={`${report.currencyCode} / ${report.basisCode}`}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 8 }}
        />
        <KpiTile
          label="Order Date"
          value={formatDate(report.orderDate)}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 8 }}
        />
        <KpiTile
          label="Delivery On Doc."
          value={formatDate(report.deliveryOnDocumentDate)}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 8 }}
        />
        <KpiTile
          label="Production Started"
          value={formatDate(report.productionStartDate)}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 8 }}
        />
        <KpiTile
          label="Actual Shipped"
          value={formatDate(report.actualShippedDate)}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 8 }}
        />
      </Grid>

      {/* Styles */}
      <Card variant="outlined" sx={cardSx}>
        <SectionTitle>Styles</SectionTitle>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={plainTableHeaderRowSx()}>
                <TableCell sx={plainTableHeaderCellSx()}>Type</TableCell>
                <TableCell sx={plainTableHeaderCellSx()}>Style</TableCell>
                <TableCell sx={plainTableHeaderCellSx()}>Unit</TableCell>
                <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Unit Price</TableCell>
                <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Quantity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report.styles.map((s, i) => (
                <TableRow key={`${s.typeCode}-${s.styleCode}-${i}`} sx={plainTableBodyRowSx(i)}>
                  <TableCell>{s.typeName}</TableCell>
                  <TableCell>{s.styleCode}</TableCell>
                  <TableCell>{s.unit}</TableCell>
                  <TableCell align="right">{formatMoney(s.unitPrice)}</TableCell>
                  <TableCell align="right">{formatQuantity(s.quantity)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider sx={{ my: 1, borderColor: DASHBOARD_COLORS.border }} />
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Typography variant="body2" sx={{ color: DASHBOARD_COLORS.textPrimary }}>
            Average Unit Price: <strong>{formatMoney(report.averageUnitPrice)}</strong>
          </Typography>
        </Box>
      </Card>

      {/* Section quantities */}
      <Card variant="outlined" sx={cardSx}>
        <SectionTitle>Production Section Quantities</SectionTitle>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={plainTableHeaderRowSx()}>
                <TableCell sx={plainTableHeaderCellSx()}>Section</TableCell>
                <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Quantity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report.sectionQuantities.map((s, i) => (
                <TableRow key={s.sectionCode} sx={plainTableBodyRowSx(i)}>
                  <TableCell>{s.sectionDescription}{s.isFinal ? " (Final)" : ""}</TableCell>
                  <TableCell align="right">{formatQuantity(s.quantity)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider sx={{ my: 1, borderColor: DASHBOARD_COLORS.border }} />
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Typography variant="body2" sx={{ color: DASHBOARD_COLORS.textPrimary }}>
            Total Value Of Sales: <strong>{formatMoney(report.totalValueOfSales)}</strong>
          </Typography>
        </Box>
      </Card>

      {/* Cost breakdown */}
      <Card variant="outlined" sx={cardSx}>
        <SectionTitle>Cost Breakdown (per piece / per dozen / total value)</SectionTitle>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={plainTableHeaderRowSx()}>
                <TableCell sx={plainTableHeaderCellSx()}>Description</TableCell>
                <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Per Piece ({report.currencyCode})</TableCell>
                <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Per Dozen ({report.currencyCode})</TableCell>
                <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Total Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report.materialGroups.map((m, i) => (
                <TableRow key={m.stockCategoryCode} sx={plainTableBodyRowSx(i)}>
                  <TableCell>{m.stockCategoryDescription || m.stockCategoryCode}</TableCell>
                  <TableCell align="right">{formatCost(m.perPieceCost)}</TableCell>
                  <TableCell align="right">{formatCost(m.perDozenCost)}</TableCell>
                  <TableCell align="right">{formatMoney(m.totalValue)}</TableCell>
                </TableRow>
              ))}
              <TableRow sx={totalRowSx}>
                <TableCell sx={boldCellSx}>T O T A L (Materials)</TableCell>
                <TableCell align="right" sx={boldCellSx}>{formatCost(report.materialsPerPieceCost)}</TableCell>
                <TableCell align="right" sx={boldCellSx}>{formatCost(report.materialsPerDozenCost)}</TableCell>
                <TableCell align="right" sx={boldCellSx}>{formatMoney(report.materialsTotalValue)}</TableCell>
              </TableRow>

              <TableRow sx={plainTableBodyRowSx(report.materialGroups.length)}>
                <TableCell>PRODUCTION COST (In House)</TableCell>
                <TableCell align="right">{formatCost(report.productionCostPerPiece)}</TableCell>
                <TableCell align="right">{formatCost(report.productionCostPerDozen)}</TableCell>
                <TableCell align="right">{formatMoney(report.productionCostTotalValue)}</TableCell>
              </TableRow>

              {report.additionalCostGroups.map((a, i) => (
                <TableRow
                  key={a.additionalCostCode}
                  sx={plainTableBodyRowSx(report.materialGroups.length + 1 + i)}
                >
                  <TableCell>{a.additionalCostDescription}</TableCell>
                  <TableCell align="right">{formatCost(a.perPieceCost)}</TableCell>
                  <TableCell align="right">{formatCost(a.perDozenCost)}</TableCell>
                  <TableCell align="right">{formatMoney(a.totalValue)}</TableCell>
                </TableRow>
              ))}

              {(report.subContractPerPiece !== 0 || report.subContractTotalValue !== 0) && (
                <TableRow
                  sx={plainTableBodyRowSx(
                    report.materialGroups.length + 1 + report.additionalCostGroups.length,
                  )}
                >
                  <TableCell>SUB CONTRACT</TableCell>
                  <TableCell align="right">{formatCost(report.subContractPerPiece)}</TableCell>
                  <TableCell align="right">{formatCost(report.subContractPerDozen)}</TableCell>
                  <TableCell align="right">{formatMoney(report.subContractTotalValue)}</TableCell>
                </TableRow>
              )}

              <TableRow sx={totalRowSx}>
                <TableCell sx={boldCellSx}>T O T A L</TableCell>
                <TableCell align="right" sx={boldCellSx}>{formatCost(report.productionTotalPerPiece)}</TableCell>
                <TableCell align="right" sx={boldCellSx}>{formatCost(report.productionTotalPerDozen)}</TableCell>
                <TableCell align="right" sx={boldCellSx}>{formatMoney(report.productionTotalValue)}</TableCell>
              </TableRow>

              <TableRow sx={grandTotalRowSx}>
                <TableCell sx={boldCellSx}>G R A N D   T O T A L</TableCell>
                <TableCell align="right" sx={boldCellSx}>{formatCost(report.grandTotalPerPiece)}</TableCell>
                <TableCell align="right" sx={boldCellSx}>{formatCost(report.grandTotalPerDozen)}</TableCell>
                <TableCell align="right" sx={boldCellSx}>{formatMoney(report.grandTotalValue)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Profit summary */}
      <Card
        variant="outlined"
        sx={{
          p: 2.5,
          backgroundColor: DASHBOARD_COLORS.pageBg,
          border: `1px solid ${DASHBOARD_COLORS.border}`,
        }}
      >
        <Grid container spacing={2}>
          <HeaderField label="Days Utilised For Production" value={`${report.daysUtilised} Day${report.daysUtilised === 1 ? "" : "s"}`} />
          <HeaderField label="Average Day Production" value={`${formatQuantity(report.averageDayProduction)} Pcs`} />
          <HeaderField label="Gross Profit" value={formatMoney(report.grossProfit)} />
          <HeaderField label={`Finance Charges (${report.percentOfTotalValue}%)`} value={formatMoney(report.financeCharges)} />
          <HeaderField label="Freight Charges" value={formatMoney(report.freightCharges)} />
        </Grid>
        <Divider sx={{ my: 2, borderColor: DASHBOARD_COLORS.border }} />
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.accent }}>
              Net Profit ({report.currencyCode})
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>{formatMoney(report.netProfit)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary, display: "block" }}>Net Profit On Sales</Typography>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>{report.netProfitOnSalesPercent.toFixed(2)}%</Typography>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}
