import type { ProductionLineAllocation } from "../production/ProductionLineAllocation";

export type CurrentStyle = {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  source: "latest-entry" | "pinned";
};

export type SectionProgress = {
  sectionCode: string;
  sectionDescription: string;
  toDateQuantity: number;
  ceilingQuantity: number;
};

export type ProductionProgress = {
  contractSectionCode: string;
  sections: SectionProgress[];
  lineAllocations: ProductionLineAllocation[];
};

export type DailyTrendPoint = {
  date: string;
  quantity: number;
};

export type DailyTrendSeries = {
  sectionCode: string;
  sectionDescription: string;
  points: DailyTrendPoint[];
};

export type ColorSizeMix = {
  color: string;
  size: string;
  quantity: number;
};

export type StockItemMovement = {
  itemCode: string;
  description: string;
  unit: string;
  receivedQuantity: number;
  issuedQuantity: number;
  balanceQuantity: number;
  damagedQuantity: number;
  isLow: boolean;
};

export type OrderwiseInventorySummary = {
  totalLineItems: number;
  fullyReceivedCount: number;
  damagedItemCount: number;
  shortfallCount: number;
  items: StockItemMovement[];
};

export type OrderManagementSummary = {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  orderQuantity: number | null;
  unit: string | null;
  unitPrice: number | null;
  orderDate: string;
  estimateApprovalDate: string | null;
  shippedQuantity: number;
  colorSizeMix: ColorSizeMix[];
};
