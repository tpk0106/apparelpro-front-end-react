export interface GarmentAdditionalCostRow {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  additionalCostCode: string;
  additionalCostName: string;
  description: string;
  stockCode: string;
  itemCode: string;
  feature1: string;
  feature2: string;
  feature3: string;
  feature4: string;
  color: string;
  size: string;
  storeCode: string;
  storeName: string;
  currency: string;
  unit: string;
  quantity: number;
  cost: number;
  isCostPerGarment: boolean;
  isSemiFinishedGarment: boolean;
}

export interface SaveGarmentAdditionalCostPayload {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  additionalCostCode: string;
  stockCode: string;
  itemCode: string;
  feature1: string;
  feature2: string;
  feature3: string;
  feature4: string;
  description: string;
  color: string;
  size: string;
  storeCode: string;
  currency: string;
  unit: string;
  quantity: number;
  cost: number;
  isCostPerGarment: boolean;
  isSemiFinishedGarment: boolean;
}

export interface GarmentAdditionalCostReportLine {
  itemCode: string;
  description: string;
  color: string;
  size: string;
  unit: string;
  quantity: number;
  storeCode: string;
  storeName: string;
  currency: string;
  price: number;
  value: number;
}

export interface GarmentAdditionalCostReportCategory {
  additionalCostCode: string;
  additionalCostName: string;
  lines: GarmentAdditionalCostReportLine[];
  totalValue: number;
}

export interface GarmentAdditionalCostReport {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  categories: GarmentAdditionalCostReportCategory[];
}

// Shared dark-card look for this feature only - see garment-additional-cost.component.tsx's
// header comment for why this stays isolated from the shared apparelProDarkTheme /
// useApparelProTable() hook that every other screen uses.
export const mockupColors = {
  bg: "#0A0E14",
  surface: "#141922",
  input: "#0D1117",
  border: "#232a36",
  text: "#F4F6F8",
  muted: "#8B93A1",
  accent: "#60a5fa",
  accentText: "#93c5fd",
  danger: "#f87171",
};
