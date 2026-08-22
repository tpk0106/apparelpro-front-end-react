// Reports -> E. Line Production Summary, PR_LPROD.PRG.

export interface LineProductionSummaryRow {
  lineCode: string;
  lineDescription: string;
  periodQty: number;
  cumulativeQty: number;
}

export interface LineProductionSummaryReport {
  startDate: string;
  endDate: string;
  finalSectionCode: string;
  finalSectionDescription: string;
  rows: LineProductionSummaryRow[];
  totalPeriodQty: number;
  totalCumulativeQty: number;
}
