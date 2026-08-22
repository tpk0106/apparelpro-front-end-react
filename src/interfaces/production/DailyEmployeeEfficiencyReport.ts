// Reports -> H. Employee Efficiency (Daily), PR_EEF1.PRG.

export interface EmployeeEfficiencyRow {
  employeeCode: string;
  employeeName: string;
  workHours: number;
  earnedHours: number;
  nonProductiveHours: number;
  overEfficiencyPercent: number;
  operatorEfficiencyPercent: number;
}

export interface DailyEmployeeEfficiencyReport {
  date: string;
  lineCode: string | null;
  lineDescription: string | null;
  rows: EmployeeEfficiencyRow[];
}
