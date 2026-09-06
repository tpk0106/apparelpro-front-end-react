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

import type { CostOfProductionReport } from "./cost-of-production-report.types";
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import {
  plainTableBodyRowSx,
  plainTableHeaderCellSx,
  plainTableHeaderRowSx,
} from "../../../../themes/workspace-theme";
import KpiTile from "../../../common/kpi-tile";

interface Props {
  report: CostOfProductionReport;
}

const formatQuantity = (value: number): string =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const formatMoney = (value: number): string =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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

// Renders the "COST OF PRODUCTION" report - mirrors OD_FCOST.PRG's five sections
// (materials, additional costs, sub contracts, style revenue, line costing) followed
// by the final Estimated vs Actual profit margin.
export default function CostOfProductionReportDisplay({ report }: Props) {
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
          value={`${formatQuantity(report.totalOrderQuantity)} ${report.unit}`}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 10 }}
        />
        <KpiTile
          label="Currency"
          value={report.currencyCode}
          loading={false}
          size={{ xs: 12, sm: 6, md: 3, lg: 6 }}
        />
      </Grid>

      {/* Materials */}
      <Card variant="outlined" sx={cardSx}>
        <SectionTitle>Materials Received</SectionTitle>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={plainTableHeaderRowSx()}>
                <TableCell sx={plainTableHeaderCellSx()}>Item Code</TableCell>
                <TableCell sx={plainTableHeaderCellSx()}>Category</TableCell>
                <TableCell sx={plainTableHeaderCellSx()}>Description</TableCell>
                <TableCell sx={plainTableHeaderCellSx()}>Unit</TableCell>
                <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Quantity</TableCell>
                <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Price</TableCell>
                <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report.materials.map((m, i) => (
                <TableRow key={`${m.itemCode}-${i}`} sx={plainTableBodyRowSx(i)}>
                  <TableCell>{m.itemCode}</TableCell>
                  <TableCell>{m.stockCategoryDescription || m.stockCategoryCode}</TableCell>
                  <TableCell>{m.description}</TableCell>
                  <TableCell>{m.unit}</TableCell>
                  <TableCell align="right">{formatQuantity(m.quantity)}</TableCell>
                  <TableCell align="right">{formatMoney(m.price)}</TableCell>
                  <TableCell align="right">{formatMoney(m.value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider sx={{ my: 1, borderColor: DASHBOARD_COLORS.border }} />
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 3 }}>
          <Typography variant="body2" sx={{ color: DASHBOARD_COLORS.textSecondary }}>
            Estimated: <strong>{formatMoney(report.estimatedMaterialsValue)}</strong>
          </Typography>
          <Typography variant="body2" sx={{ color: DASHBOARD_COLORS.textPrimary }}>
            Actual Total: <strong>{formatMoney(report.totalMaterialsValue)}</strong>
          </Typography>
        </Box>
      </Card>

      {/* Additional Costs */}
      {report.additionalCostGroups.length > 0 && (
        <Card variant="outlined" sx={cardSx}>
          <SectionTitle>Additional Costs</SectionTitle>
          {report.additionalCostGroups.map((group, gi) => (
            <Box key={`${group.additionalCostCode}-${gi}`} sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5, color: DASHBOARD_COLORS.textPrimary }}>
                {group.additionalCostDescription}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={plainTableHeaderRowSx()}>
                      <TableCell sx={plainTableHeaderCellSx()}>Item Code</TableCell>
                      <TableCell sx={plainTableHeaderCellSx()}>Description</TableCell>
                      <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Qty/Garment</TableCell>
                      <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Received</TableCell>
                      <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Price</TableCell>
                      <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Cost</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.lines.map((line, li) => (
                      <TableRow key={`${line.itemCode}-${li}`} sx={plainTableBodyRowSx(li)}>
                        <TableCell>{line.itemCode}</TableCell>
                        <TableCell>{line.description}</TableCell>
                        <TableCell align="right">{formatQuantity(line.quantityPerGarment)}</TableCell>
                        <TableCell align="right">{formatQuantity(line.receivedQuantity)}</TableCell>
                        <TableCell align="right">{formatMoney(line.pricePerUnit)}</TableCell>
                        <TableCell align="right">{formatMoney(line.cost)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="body2" sx={{ textAlign: "right", mt: 0.5, color: DASHBOARD_COLORS.textPrimary }}>
                Group Total: <strong>{formatMoney(group.totalCost)}</strong>
              </Typography>
            </Box>
          ))}
          <Divider sx={{ my: 1, borderColor: DASHBOARD_COLORS.border }} />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 3 }}>
            <Typography variant="body2" sx={{ color: DASHBOARD_COLORS.textSecondary }}>
              Estimated: <strong>{formatMoney(report.estimatedAdditionalCostValue)}</strong>
            </Typography>
            <Typography variant="body2" sx={{ color: DASHBOARD_COLORS.textPrimary }}>
              Actual Total: <strong>{formatMoney(report.totalAdditionalCostValue)}</strong>
            </Typography>
          </Box>
        </Card>
      )}

      {/* Sub Contracts */}
      {report.subContracts.length > 0 && (
        <Card variant="outlined" sx={cardSx}>
          <SectionTitle>Sub Contracts</SectionTitle>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={plainTableHeaderRowSx()}>
                  <TableCell sx={plainTableHeaderCellSx()}>Sub Contractor</TableCell>
                  <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Cost/Garment</TableCell>
                  <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Quantity</TableCell>
                  <TableCell sx={plainTableHeaderCellSx()}>Unit</TableCell>
                  <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Cost</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.subContracts.map((sc, i) => (
                  <TableRow key={`${sc.subContractorCode}-${i}`} sx={plainTableBodyRowSx(i)}>
                    <TableCell>{sc.subContractorName}</TableCell>
                    <TableCell align="right">{formatMoney(sc.costPerGarment)}</TableCell>
                    <TableCell align="right">{formatQuantity(sc.quantity)}</TableCell>
                    <TableCell>{sc.unit}</TableCell>
                    <TableCell align="right">{formatMoney(sc.cost)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Divider sx={{ my: 1, borderColor: DASHBOARD_COLORS.border }} />
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Typography variant="body2" sx={{ color: DASHBOARD_COLORS.textPrimary }}>
              Total Sub Contract Cost: <strong>{formatMoney(report.totalSubContractValue)}</strong>
            </Typography>
          </Box>
        </Card>
      )}

      {/* Style Revenue */}
      <Card variant="outlined" sx={cardSx}>
        <SectionTitle>Style Revenue - Estimated vs Actual</SectionTitle>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={plainTableHeaderRowSx()}>
                <TableCell sx={plainTableHeaderCellSx()}>Style</TableCell>
                <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Unit Price</TableCell>
                <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Est. Qty</TableCell>
                <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Est. Value</TableCell>
                <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Actual Qty</TableCell>
                <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Actual Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report.styleRevenues.map((s, i) => (
                <TableRow key={`${s.styleCode}-${i}`} sx={plainTableBodyRowSx(i)}>
                  <TableCell>{s.styleCode}</TableCell>
                  <TableCell align="right">{formatMoney(s.unitPrice)}</TableCell>
                  <TableCell align="right">{formatQuantity(s.estimatedQuantity)}</TableCell>
                  <TableCell align="right">{formatMoney(s.estimatedValue)}</TableCell>
                  <TableCell align="right">{formatQuantity(s.actualProducedQuantity + s.subContractReceivedQuantity)}</TableCell>
                  <TableCell align="right">{formatMoney(s.actualProducedValue + s.subContractReceivedValue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Line Costing */}
      {report.lineCosts.length > 0 && (
        <Card variant="outlined" sx={cardSx}>
          <SectionTitle>Production Line Cost - Estimated vs Actual</SectionTitle>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={plainTableHeaderRowSx()}>
                  <TableCell sx={plainTableHeaderCellSx()}>Style</TableCell>
                  <TableCell sx={plainTableHeaderCellSx()}>Line</TableCell>
                  <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Est. Days</TableCell>
                  <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Est. Cost</TableCell>
                  <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Actual Days</TableCell>
                  <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "right" }}>Actual Cost</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.lineCosts.map((l, i) => (
                  <TableRow key={`${l.styleCode}-${l.lineCode}-${i}`} sx={plainTableBodyRowSx(i)}>
                    <TableCell>{l.styleCode}</TableCell>
                    <TableCell>{l.lineDescription}</TableCell>
                    <TableCell align="right">{formatQuantity(l.estimatedDays)}</TableCell>
                    <TableCell align="right">{formatMoney(l.estimatedCost)}</TableCell>
                    <TableCell align="right">{formatQuantity(l.actualDays)}</TableCell>
                    <TableCell align="right">{formatMoney(l.actualCost)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Final margin */}
      <Card
        variant="outlined"
        sx={{
          p: 2.5,
          backgroundColor: DASHBOARD_COLORS.pageBg,
          border: `1px solid ${DASHBOARD_COLORS.border}`,
        }}
      >
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.accent }}>
              Profit Margin ({report.currencyCode})
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary, display: "block" }}>Estimated</Typography>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>{formatMoney(report.estimatedProfitMargin)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary, display: "block" }}>Actual</Typography>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>{formatMoney(report.actualProfitMargin)}</Typography>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}
