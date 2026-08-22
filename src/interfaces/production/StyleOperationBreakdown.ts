export type StyleOperationBreakdown = {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  componentSequence: number;
  operationNumber: number;
  componentCode: string;
  operationCode: string;
  machineTypeCode: string;
  sam: number;
  quota: number;
  numberOfMachines: number;
};

export type StyleOperationBreakdownSaveResult = {
  targetDailyOutput: number;
  operations: StyleOperationBreakdown[];
};
