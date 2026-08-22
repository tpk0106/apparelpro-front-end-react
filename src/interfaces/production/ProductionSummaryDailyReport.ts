export type ProductionSummaryDailySectionTotal = {
  sectionCode: string;
  proQuantity: number;
  toDateQuantity: number;
  balance: number;
};

export type ProductionSummaryDailyLine = {
  buyerCode: number;
  buyerName: string;
  order: string;
  typeCode: number;
  styleCode: string;
  description: string | null;
  unit: string;
  lineCode: string;
  orderQuantity: number;
  sections: ProductionSummaryDailySectionTotal[];
};

export type ProductionSummaryDailyReport = {
  date: string;
  sectionCodes: string[];
  sectionDescriptions: string[];
  lines: ProductionSummaryDailyLine[];
  totalOrderQuantity: number;
  totals: ProductionSummaryDailySectionTotal[];
};
