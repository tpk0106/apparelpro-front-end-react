// Production Control -> End of Production Confirmation, PR_ENDPR.PRG.

export interface EndOfProductionStatus {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  currentProductionEndDate: string | null;
  hasProductionEntries: boolean;
}
