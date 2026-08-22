// Reports -> G. Manpower Requirement, PR_REP3.PRG.

export interface ManpowerMachineTimeRow {
  machineTypeCode: string;
  machineTypeDescription: string;
  totalSam: number;
}

export interface ManpowerRequirementReport {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  lineCode: string | null;
  machineRows: ManpowerMachineTimeRow[];
  manualRows: ManpowerMachineTimeRow[];
  grandTotalSam: number;
  totalMachineTimeSam: number;
  pcsPerMachineAt100: number;
  pcsPerMachineAtEff1: number;
  pcsPerMachineAtEff2: number | null;
  machineCount: number;
  targetOutputAt100: number;
  targetOutputAtEff1: number;
  targetOutputAtEff2: number | null;
  estimatedStandardHours: number;
  eff1Percent: number;
  eff2Percent: number;
  workHoursPerDay: number;
}
