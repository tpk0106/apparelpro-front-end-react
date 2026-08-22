export type DailyProductionTimeTicketEntry = {
  date: string;
  lineCode: string;
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  employeeCode: string;
  operationCode: string;
  quantity: number;
  nonProductiveHourCode: string | null;
  nonProductiveHours: number;
  workHours: number;
};

export type EmployeeEfficiencySummary = {
  employeeCode: string;
  workHours: number;
  nonProductiveHours: number;
  earnedMinutes: number;
  overEfficiencyPercent: number;
  operatorEfficiencyPercent: number;
};

export type DailyProductionTimeTicket = {
  entries: DailyProductionTimeTicketEntry[];
  employeeSummaries: EmployeeEfficiencySummary[];
};
