// Reports -> J. Production Line Efficiency, PR_GRH1.PRG.

export interface LineEfficiencyDayCell {
  day: number;
  dayOfWeek: string;
  isHoliday: boolean;
  holidayDescription: string | null;
  efficiencyPercent: number | null;
}

export interface LineEfficiencyReport {
  lineCode: string;
  lineDescription: string;
  year: number;
  month: number;
  daysInMonth: number;
  finalSectionCode: string;
  finalSectionDescription: string;
  workHoursPerDay: number;
  days: LineEfficiencyDayCell[];
  monthlyAverageEfficiencyPercent: number;
}
