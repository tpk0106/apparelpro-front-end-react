export type ProductionLine = {
  lineCode: string;
  description: string;
  numberOfMachines: number;
  currencyCode: string;
  lineCostPerDay: number;
  minimumProductionPerOrder: number;
  unitCode: string;
  nextAllocationDate: string | null;
  estimatedNextAllocationDate: string | null;
};
