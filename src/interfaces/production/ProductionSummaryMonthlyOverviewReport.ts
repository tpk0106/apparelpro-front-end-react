export type ProductionSummaryMonthlyOverviewCell = {
  estQuantity: number;
  actQuantity: number;
  cumEstQuantity: number;
  cumActQuantity: number;
};

export type ProductionSummaryMonthlyOverviewDayRow = {
  date: string;
  isHoliday: boolean;
  holidayDescription: string | null;
  lineCells: ProductionSummaryMonthlyOverviewCell[];
  totalEstQuantity: number;
  totalActQuantity: number;
  totalCumEstQuantity: number;
  totalCumActQuantity: number;
};

export type ProductionSummaryMonthlyOverviewReport = {
  year: number;
  month: number;
  finalSectionCode: string;
  finalSectionDescription: string;
  lineCodes: string[];
  lineDescriptions: string[];
  days: ProductionSummaryMonthlyOverviewDayRow[];
};
