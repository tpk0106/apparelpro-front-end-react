// Reports -> F. Operation Breakdown, PR_REP1.PRG.

export interface OperationBreakdownRow {
  displayOperationNo: number;
  operationCode: string;
  operationDescription: string;
  machineTypeCode: string;
  sam: number;
  quotaAt100: number;
  quotaAtEff1: number;
  quotaPcsPer2HrsAtEff1: number;
  quotaAtEff2: number;
  quotaPcsPer2HrsAtEff2: number;
  numberOfMachines: number;
  numberOfOperators: number;
}

export interface OperationBreakdownComponentGroup {
  componentCode: string;
  componentDescription: string;
  rows: OperationBreakdownRow[];
}

export interface OperationBreakdownReport {
  buyerCode: number;
  buyerName: string;
  order: string;
  typeCode: number;
  typeName: string;
  styleCode: string;
  eff1Percent: number;
  eff2Percent: number;
  workHoursPerDay: number;
  groups: OperationBreakdownComponentGroup[];
}
