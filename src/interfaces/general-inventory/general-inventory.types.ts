// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory exactly. ASP.NET Core's default
// JSON policy lowercases the first letter of each C# PascalCase property.

export interface GeneralStockItemAvailability {
  itemCode: string;
  description: string;
  unit: string;
  physicalQtyInHand: number;
  shadowAllocatedBalance: number;
  netAvailableBalance: number;
}

export interface GeneralStockLookupRow {
  itemCode: string;
  storeCode: string;
  unit: string;
  description: string;
  qtyInHand: number;
}

export interface GeneralStore {
  code: string;
  description: string;
}

export interface GeneralRequisitionHeaderModel {
  srnNumber: string; // allocated by the C# backend
  transactionDate: string; // ISO date (YYYY-MM-DD)
  storeCode: string;
  departmentCode: string;
}

export interface GeneralRequisitionLineItemRow {
  itemCode: string;
  unit: string;
  quantity: number;
}

export interface GeneralRequisitionSubmissionPayload {
  header: GeneralRequisitionHeaderModel;
  lines: GeneralRequisitionLineItemRow[];
}

export interface VerifyGeneralStockQueryParams {
  storeCode: string;
  itemCode: string;
  targetUnit: string;
}

export interface GeneralInventoryMutationResponse {
  success: boolean;
  message: string;
}
