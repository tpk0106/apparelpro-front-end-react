import type { ProductionLineAllocation } from "../production/ProductionLineAllocation";

export type CurrentStyle = {
  buyerCode: number;
  buyerName: string;
  order: string;
  typeCode: number;
  typeName: string;
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

// Order pipeline (2026-09-06): mirrors ApparelPro.WebApi.APIModels.Dashboard.OrderPipeline*
// exactly. Stage: 0 Merchandising, 1 Approval, 2 Supplier PO, 3 GRN,
// 4 Production, 5 Shipment, 6 Complete. See each *StageDetail type for what
// "done" means at that stage and why (backend comments have the full story -
// none of this is a stored status flag except Approval's ApprovedDate).
export type MerchandisingStageDetail = {
  styleSaved: boolean;
  breakdownDone: boolean;
  consumptionDone: boolean;
};

export type ApprovalStageDetail = {
  isApproved: boolean;
  approvedBy: string | null;
  approvedDate: string | null;
};

export type SupplierPoStageDetail = {
  raisedQuantity: number;
  raisedValue: number;
  outstandingQuantity: number;
  outstandingValue: number;
  currency: string;
};

export type GrnStageDetail = {
  orderedQuantity: number;
  receivedQuantity: number;
  orderedValue: number;
  receivedValue: number;
};

export type ProductionStageDetail = {
  targetQuantity: number;
  actualQuantity: number;
};

export type ShipmentStageDetail = {
  targetQuantity: number;
  scheduledQuantity: number;
  targetValue: number;
  scheduledValue: number;
};

export type OrderPipelineRow = {
  buyerCode: number;
  buyerName: string;
  order: string;
  typeCode: number;
  styleCode: string;
  quantity: number | null;
  unit: string | null;
  stage: number;
  daysInStage: number;
  isOverdue: boolean;
  merchandising: MerchandisingStageDetail;
  approval: ApprovalStageDetail;
  supplierPo: SupplierPoStageDetail;
  grn: GrnStageDetail;
  production: ProductionStageDetail;
  shipment: ShipmentStageDetail;
};

export type OrderPipelineResult = {
  items: OrderPipelineRow[];
  totalItems: number;
  stageCounts: number[];
  overdueCount: number;
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
