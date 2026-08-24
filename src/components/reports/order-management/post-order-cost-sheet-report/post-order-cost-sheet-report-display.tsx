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
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
        {value}
      </Typography>
    </Grid>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#1a237e", mb: 1 }}>
      {children}
    </Typography>
  );
}

// Renders the "POST ORDER COST SHEET" - mirrors OD_PCOST.PRG's cost-per-piece /
// cost-per-dozen / total-value breakdown across materials, in-house production,
// additional costs and sub contracts, weighed against sales value, finance charges
// and freight to arrive at gross/net profit.
export default function PostOrderCostSheetReportDisplay({ report }: Props) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Card
        variant="outlined"
        sx={{ p: 2, backgroundColor: "#fafafa", borderLeft: "5px solid #1a237e" }}
      >
        <Grid container spacing={2}>
          <HeaderField label="Buyer" value={`${report.buyerName} (${report.buyerCode})`} />
          <HeaderField label="Order" value={report.order} />
          <HeaderField label="Total Order Qty" value={formatQuantity(report.totalOrderQuantity)} />
          <HeaderField label="Currency / Basis" value={`${report.currencyCode} / ${report.basisCode}`} />
          <HeaderField label="Order Date" value={formatDate(report.orderDate)} />
          <HeaderField label="Delivery On Doc." value={formatDate(report.deliveryOnDocumentDate)} />
          <HeaderField label="Production Started" value={formatDate(report.productionStartDate)} />
          <HeaderField label="Actual Shipped" value={formatDate(report.actualShippedDate)} />
        </Grid>
      </Card>

      {/* Styles */}
      <Card variant="outlined" sx={{ p: 2, backgroundColor: "#fafafa" }}>
        <SectionTitle>Styles</SectionTitle>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Style</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="right">Quantity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report.styles.map((s, i) => (
                <TableRow key={`${s.typeCode}-${s.styleCode}-${i}`}>
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
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Typography variant="body2">
            Average Unit Price: <strong>{formatMoney(report.averageUnitPrice)}</strong>
          </Typography>
        </Box>
      </Card>

      {/* Section quantities */}
      <Card variant="outlined" sx={{ p: 2, backgroundColor: "#fafafa" }}>
        <SectionTitle>Production Section Quantities</SectionTitle>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Section</TableCell>
                <TableCell align="right">Quantity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report.sectionQuantities.map((s) => (
                <TableRow key={s.sectionCode}>
                  <TableCell>{s.sectionDescription}{s.isFinal ? " (Final)" : ""}</TableCell>
                  <TableCell align="right">{formatQuantity(s.quantity)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Typography variant="body2">
            Total Value Of Sales: <strong>{formatMoney(report.totalValueOfSales)}</strong>
          </Typography>
        </Box>
      </Card>

      {/* Cost breakdown */}
      <Card variant="outlined" sx={{ p: 2, backgroundColor: "#fafafa" }}>
        <SectionTitle>Cost Breakdown (per piece / per dozen / total value)</SectionTitle>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell align="right">Per Piece ({report.currencyCode})</TableCell>
                <TableCell align="right">Per Dozen ({report.currencyCode})</TableCell>
                <TableCell align="right">Total Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report.materialGroups.map((m) => (
                <TableRow key={m.stockCategoryCode}>
                  <TableCell>{m.stockCategoryDescription || m.stockCategoryCode}</TableCell>
                  <TableCell align="right">{formatCost(m.perPieceCost)}</TableCell>
                  <TableCell align="right">{formatCost(m.perDozenCost)}</TableCell>
                  <TableCell align="right">{formatMoney(m.totalValue)}</TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ backgroundColor: "#eef1f7" }}>
                <TableCell sx={{ fontWeight: "bold" }}>T O T A L (Materials)</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>{formatCost(report.materialsPerPieceCost)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>{formatCost(report.materialsPerDozenCost)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>{formatMoney(report.materialsTotalValue)}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>PRODUCTION COST (In House)</TableCell>
                <TableCell align="right">{formatCost(report.productionCostPerPiece)}</TableCell>
                <TableCell align="right">{formatCost(report.productionCostPerDozen)}</TableCell>
                <TableCell align="right">{formatMoney(report.productionCostTotalValue)}</TableCell>
              </TableRow>

              {report.additionalCostGroups.map((a) => (
                <TableRow key={a.additionalCostCode}>
                  <TableCell>{a.additionalCostDescription}</TableCell>
                  <TableCell align="right">{formatCost(a.perPieceCost)}</TableCell>
                  <TableCell align="right">{formatCost(a.perDozenCost)}</TableCell>
                  <TableCell align="right">{formatMoney(a.totalValue)}</TableCell>
                </TableRow>
              ))}

              {(report.subContractPerPiece !== 0 || report.subContractTotalValue !== 0) && (
                <TableRow>
                  <TableCell>SUB CONTRACT</TableCell>
                  <TableCell align="right">{formatCost(report.subContractPerPiece)}</TableCell>
                  <TableCell align="right">{formatCost(report.subContractPerDozen)}</TableCell>
                  <TableCell align="right">{formatMoney(report.subContractTotalValue)}</TableCell>
                </TableRow>
              )}

              <TableRow sx={{ backgroundColor: "#eef1f7" }}>
                <TableCell sx={{ fontWeight: "bold" }}>T O T A L</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>{formatCost(report.productionTotalPerPiece)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>{formatCost(report.productionTotalPerDozen)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>{formatMoney(report.productionTotalValue)}</TableCell>
              </TableRow>

              <TableRow sx={{ backgroundColor: "#dde4f0" }}>
                <TableCell sx={{ fontWeight: "bold" }}>G R A N D   T O T A L</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>{formatCost(report.grandTotalPerPiece)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>{formatCost(report.grandTotalPerDozen)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>{formatMoney(report.grandTotalValue)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Profit summary */}
      <Card variant="outlined" sx={{ p: 2.5, backgroundColor: "#eef1f7", borderLeft: "5px solid #1a237e" }}>
        <Grid container spacing={2}>
          <HeaderField label="Days Utilised For Production" value={`${report.daysUtilised} Day${report.daysUtilised === 1 ? "" : "s"}`} />
          <HeaderField label="Average Day Production" value={`${formatQuantity(report.averageDayProduction)} Pcs`} />
          <HeaderField label="Gross Profit" value={formatMoney(report.grossProfit)} />
          <HeaderField label={`Finance Charges (${report.percentOfTotalValue}%)`} value={formatMoney(report.financeCharges)} />
          <HeaderField label="Freight Charges" value={formatMoney(report.freightCharges)} />
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1a237e" }}>
              Net Profit ({report.currencyCode})
            </Typography>
            <Typography variant="h6" fontWeight="bold">{formatMoney(report.netProfit)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary" display="block">Net Profit On Sales</Typography>
            <Typography variant="h6" fontWeight="bold">{report.netProfitOnSalesPercent.toFixed(2)}%</Typography>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}
