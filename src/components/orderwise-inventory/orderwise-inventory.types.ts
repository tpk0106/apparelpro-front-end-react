export interface StockItemAvailabilityDetails {
  itemCode: string;
  description: string;
  unit: string;
  physicalQtyInHand: number;
  shadowAllocatedBalance: number;
  requisitionedSrnBalance: number;
  netAvailableBalance: number;
}

export interface RequisitionHeaderModel {
  srnNumber: string; // Will be allocated by the C# backend common service
  transactionDate: string; // ISO date string format (YYYY-MM-DD)
  buyerCode: number;
  order: string;
  departmentCode: string;
}

export interface RequisitionLineItemRow {
  stockCode: string; // Category prefix (e.g. "02")
  itemCode: string; // Item ID (e.g. "02BT")
  storeCode: string; // The "Basis" Code (e.g. "STR")
  unit: string;
  quantity: number;
}

export interface RequisitionSubmissionPayload {
  header: RequisitionHeaderModel;
  lines: RequisitionLineItemRow[];
}

export interface VerifyStockQueryParams {
  buyerCode: number;
  order: string;
  storeCode: string;
  itemCode: string;
  targetUnit: string;
}

export interface InventoryMutationResponse {
  success: boolean;
  message: string;
}
