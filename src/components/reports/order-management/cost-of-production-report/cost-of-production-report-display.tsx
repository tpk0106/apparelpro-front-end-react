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

// Renders the "COST OF PRODUCTION" report - mirrors OD_FCOST.PRG's five sections
// (materials, additional costs, sub contracts, style revenue, line costing) followed
// by the final Estimated vs Actual profit margin.
export default function CostOfProductionReportDisplay({ report }: Props) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Card
        variant="outlined"
        sx={{ p: 2, backgroundColor: "#fafafa", borderLeft: "5px solid #1a237e" }}
      >
        <Grid container spacing={2}>
          <HeaderField label="Buyer" value={`${report.buyerName} (${report.buyerCode})`} />
          <HeaderField label="Order" value={report.order} />
          <HeaderField label="Total Order Qty" value={`${formatQuantity(report.totalOrderQuantity)} ${report.unit}`} />
          <HeaderField label="Currency" value={report.currencyCode} />
        </Grid>
      </Card>

      {/* Materials */}
      <Card variant="outlined" sx={{ p: 2, backgroundColor: "#fafafa" }}>
        <SectionTitle>Materials Received</SectionTitle>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Item Code</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report.materials.map((m, i) => (
                <TableRow key={`${m.itemCode}-${i}`}>
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
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Estimated: <strong>{formatMoney(report.estimatedMaterialsValue)}</strong>
          </Typography>
          <Typography variant="body2">
            Actual Total: <strong>{formatMoney(report.totalMaterialsValue)}</strong>
          </Typography>
        </Box>
      </Card>

      {/* Additional Costs */}
      {report.additionalCostGroups.length > 0 && (
        <Card variant="outlined" sx={{ p: 2, backgroundColor: "#fafafa" }}>
          <SectionTitle>Additional Costs</SectionTitle>
          {report.additionalCostGroups.map((group, gi) => (
            <Box key={`${group.additionalCostCode}-${gi}`} sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5 }}>
                {group.additionalCostDescription}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item Code</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Qty/Garment</TableCell>
                      <TableCell align="right">Received</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Cost</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.lines.map((line, li) => (
                      <TableRow key={`${line.itemCode}-${li}`}>
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
              <Typography variant="body2" sx={{ textAlign: "right", mt: 0.5 }}>
                Group Total: <strong>{formatMoney(group.totalCost)}</strong>
              </Typography>
            </Box>
          ))}
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Estimated: <strong>{formatMoney(report.estimatedAdditionalCostValue)}</strong>
            </Typography>
            <Typography variant="body2">
              Actual Total: <strong>{formatMoney(report.totalAdditionalCostValue)}</strong>
            </Typography>
          </Box>
        </Card>
      )}

      {/* Sub Contracts */}
      {report.subContracts.length > 0 && (
        <Card variant="outlined" sx={{ p: 2, backgroundColor: "#fafafa" }}>
          <SectionTitle>Sub Contracts</SectionTitle>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Sub Contractor</TableCell>
                  <TableCell align="right">Cost/Garment</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell align="right">Cost</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.subContracts.map((sc, i) => (
                  <TableRow key={`${sc.subContractorCode}-${i}`}>
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
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Typography variant="body2">
              Total Sub Contract Cost: <strong>{formatMoney(report.totalSubContractValue)}</strong>
            </Typography>
          </Box>
        </Card>
      )}

      {/* Style Revenue */}
      <Card variant="outlined" sx={{ p: 2, backgroundColor: "#fafafa" }}>
        <SectionTitle>Style Revenue - Estimated vs Actual</SectionTitle>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Style</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="right">Est. Qty</TableCell>
                <TableCell align="right">Est. Value</TableCell>
                <TableCell align="right">Actual Qty</TableCell>
                <TableCell align="right">Actual Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report.styleRevenues.map((s, i) => (
                <TableRow key={`${s.styleCode}-${i}`}>
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
        <Card variant="outlined" sx={{ p: 2, backgroundColor: "#fafafa" }}>
          <SectionTitle>Production Line Cost - Estimated vs Actual</SectionTitle>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Style</TableCell>
                  <TableCell>Line</TableCell>
                  <TableCell align="right">Est. Days</TableCell>
                  <TableCell align="right">Est. Cost</TableCell>
                  <TableCell align="right">Actual Days</TableCell>
                  <TableCell align="right">Actual Cost</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.lineCosts.map((l, i) => (
                  <TableRow key={`${l.styleCode}-${l.lineCode}-${i}`}>
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
      <Card variant="outlined" sx={{ p: 2.5, backgroundColor: "#eef1f7", borderLeft: "5px solid #1a237e" }}>
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1a237e" }}>
              Profit Margin ({report.currencyCode})
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>Estimated</Typography>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>{formatMoney(report.estimatedProfitMargin)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>Actual</Typography>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>{formatMoney(report.actualProfitMargin)}</Typography>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}
