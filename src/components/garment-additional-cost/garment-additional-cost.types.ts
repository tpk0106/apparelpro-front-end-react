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

// RETIRED (2026-09-03): this screen used to carry its own isolated "mockup"
// dark-card look instead of the shared olive/copper theme every other screen
// uses (see the old header comment on garment-additional-cost.component.tsx
// for the original rationale). Now converted over to the shared theme
// (DASHBOARD_COLORS / useDropdownTheme / useApparelProTable-style tokens) -
// kept here, commented out, purely as a color reference in case anyone needs
// to see what the old mockup palette looked like:
//
// export const mockupColors = {
//   bg: "#0A0E14",          // page background
//   surface: "#141922",     // card/panel background
//   input: "#0D1117",       // form field background
//   border: "#232a36",      // card/field/table border
//   text: "#F4F6F8",        // primary text
//   muted: "#8B93A1",       // secondary/muted text, table headers
//   accent: "#60a5fa",      // sky-blue accent - buttons, selected state, links
//   accentText: "#93c5fd",  // lighter blue - info banner text
//   danger: "#f87171",      // delete icon color
// };
