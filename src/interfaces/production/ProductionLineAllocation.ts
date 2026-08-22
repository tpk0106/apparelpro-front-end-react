export type ProductionLineAllocation = {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  shipmentOrder: string;
  lineCode: string;
  estimatedProductionPerDay: number;
  totalQuantity: number;
  unit: string;
  leadTimeDays: number;
  numberOfMachines: number;
  costPerDay: number;
  currencyCode: string;
  numberOfDays: number;
  originalEstimatedStartDate: string;
  originalEstimatedEndDate: string;
  estimatedStartDate: string;
  estimatedEndDate: string;
  isCritical: boolean;
};

export type ManualAllocateProductionLine = {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  shipmentOrder: string;
  lineCode: string;
  estimatedProductionPerDay: number;
  unit: string;
  leadTimeDays: number;
  numberOfMachines: number;
  totalQuantity: number;
  estimatedStartDate: string;
};

export type AutomaticAllocateProductionLine = {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  shipmentOrder: string;
  estimatedProductionPerDay: number;
  unit: string;
  leadTimeDays: number;
  numberOfMachines: number;
};

export type ProductionLineAllocationResult = {
  commits: ProductionLineAllocation[];
  unallocatedQuantity: number;
};
