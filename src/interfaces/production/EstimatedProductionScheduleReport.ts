// Reports -> K. Estimated Production Schedule, PR_ESTL2.PRG.

export interface EstimatedProductionScheduleRow {
  lineCode: string;
  estStartDate: string;
  estEndDate: string;
  buyerCode: number;
  buyerName: string;
  styleCode: string;
  estimatedProductionPerDay: number;
  unit: string;
  leadTimeDays: number;
  numberOfDays: number;
  totalQuantity: number;
  shipDate: string;
  floatDays: number;
}

export interface EstimatedProductionScheduleReport {
  fromDate: string;
  toDate: string;
  rows: EstimatedProductionScheduleRow[];
}
