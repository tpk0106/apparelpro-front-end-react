// Reports -> L. Production Analysis Summary (for Style), PR_MPRO2.PRG.

export interface ProductionAnalysisSectionQty {
  sectionCode: string;
  quantity: number;
}

export interface ProductionAnalysisRow {
  date: string;
  lineCode: string;
  sectionQuantities: ProductionAnalysisSectionQty[];
  total: number;
}

export interface ProductionAnalysisSummaryReport {
  buyerCode: number;
  buyerName: string;
  order: string;
  typeCode: number;
  styleCode: string;
  sectionCodes: string[];
  sectionDescriptions: string[];
  finalSectionCode: string;
  finalSectionDescription: string;
  rows: ProductionAnalysisRow[];
  sectionTotals: ProductionAnalysisSectionQty[];
  averageProductionQuantityOnFinalOutput: number;
  finalOutputProductionDays: number;
  totalDaysTakenForProduction: number;
}
