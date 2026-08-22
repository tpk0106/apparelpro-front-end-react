export type ProductionSummaryMonthlyCell = {
  styleCode: string | null;
  estQuantity: number | null;
  actQuantity: number | null;
  cumEstQuantity: number;
  cumActQuantity: number;
};

export type ProductionSummaryMonthlySubRow = {
  lineCells: ProductionSummaryMonthlyCell[];
  totalEstQuantity: number;
  totalActQuantity: number;
  totalCumEstQuantity: number;
  totalCumActQuantity: number;
};

export type ProductionSummaryMonthlyDayRow = {
  date: string;
  isHoliday: boolean;
  holidayDescription: string | null;
  subRows: ProductionSummaryMonthlySubRow[];
};

export type ProductionSummaryMonthlyReport = {
  year: number;
  month: number;
  finalSectionCode: string;
  finalSectionDescription: string;
  lineCodes: string[];
  lineDescriptions: string[];
  days: ProductionSummaryMonthlyDayRow[];
};
