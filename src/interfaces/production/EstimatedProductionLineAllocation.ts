export type EstimatedProductionLineAllocation = {
  buyerCode: number;
  styleCode: string;
  estimatedProductionPerDay: number;
  unit: string;
  leadTimeDays: number;
  totalQuantity: number;
  shipDate: string;
  lineCode: string;
  numberOfDays: number;
  estimatedStartDate: string;
  estimatedEndDate: string;
  isCritical: boolean;
};

export type ManualAllocateEstimatedProductionLine = {
  buyerCode: number;
  styleCode: string;
  estimatedProductionPerDay: number;
  unit: string;
  leadTimeDays: number;
  totalQuantity: number;
  shipDate: string;
  lineCode: string;
  estimatedStartDate: string;
};

export type AutomaticAllocateEstimatedProductionLine = {
  buyerCode: number;
  styleCode: string;
  estimatedProductionPerDay: number;
  unit: string;
  leadTimeDays: number;
  totalQuantity: number;
  shipDate: string;
};

export type EstimatedProductionLineAllocationResult = {
  allocation: EstimatedProductionLineAllocation | null;
  unallocatedQuantity: number;
};
