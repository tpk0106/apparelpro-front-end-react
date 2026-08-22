// Reports -> D. Production Summary (Style Wise), PR_MPRO1.PRG,
// and its per-line Detailed companion variant.

export interface ProductionSummaryStyleWiseSectionQty {
  sectionCode: string;
  quantity: number;
}

export interface ProductionSummaryStyleWiseRow {
  buyerCode: number;
  buyerName: string;
  order: string;
  styleCode: string;
  description: string | null;
  orderQty: number;
  unit: string;
  sectionQuantities: ProductionSummaryStyleWiseSectionQty[];
  unitPrice: number;
  basisCode: string | null;
  value: number;
}

export interface ProductionSummaryStyleWiseReport {
  startDate: string;
  endDate: string;
  finalSectionCode: string;
  finalSectionDescription: string;
  sectionCodes: string[];
  sectionDescriptions: string[];
  rows: ProductionSummaryStyleWiseRow[];
}

export interface ProductionSummaryStyleWiseDetailedLine {
  lineCode: string;
  orderQty: number;
  sectionQuantities: ProductionSummaryStyleWiseSectionQty[];
}

export interface ProductionSummaryStyleWiseDetailedRow {
  buyerCode: number;
  buyerName: string;
  order: string;
  styleCode: string;
  description: string | null;
  unit: string;
  unitPrice: number;
  basisCode: string | null;
  value: number;
  lines: ProductionSummaryStyleWiseDetailedLine[];
}

export interface ProductionSummaryStyleWiseDetailedReport {
  startDate: string;
  endDate: string;
  finalSectionCode: string;
  finalSectionDescription: string;
  sectionCodes: string[];
  sectionDescriptions: string[];
  rows: ProductionSummaryStyleWiseDetailedRow[];
}
