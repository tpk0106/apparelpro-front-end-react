export type ProductionScheduleLine = {
  lineCode: string;
  estimatedStartDate: string;
  estimatedEndDate: string;
  buyerCode: number;
  buyerName: string;
  order: string;
  typeCode: number;
  styleCode: string;
  shipmentOrder: string;
  estimatedProductionPerDay: number;
  unit: string;
  leadTimeDays: number;
  numberOfDays: number;
  totalQuantity: number;
  shipDate: string | null;
  floatDays: number | null;
};

export type ProductionScheduleReport = {
  fromDate: string;
  toDate: string;
  lines: ProductionScheduleLine[];
};
