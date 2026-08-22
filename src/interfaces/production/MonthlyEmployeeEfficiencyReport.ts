// Reports -> I. Employee Efficiency (Monthly), PR_REP4.PRG.

export interface EmployeeMonthlyEfficiencyDayCell {
  day: number;
  operatorEfficiencyPercent: number | null;
}

export interface EmployeeMonthlyEfficiencyRow {
  employeeCode: string;
  employeeName: string;
  days: EmployeeMonthlyEfficiencyDayCell[];
  monthlyAverageEfficiencyPercent: number;
}

export interface MonthlyEmployeeEfficiencyReport {
  year: number;
  month: number;
  daysInMonth: number;
  workHoursPerDay: number;
  rows: EmployeeMonthlyEfficiencyRow[];
}
