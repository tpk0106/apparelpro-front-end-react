// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory GIN models exactly.

export interface GeneralGinHeaderModel {
  ginNumber: string; // allocated by the C# backend
  sourceStrnNumber: string;
  transactionDate: string; // ISO date string (YYYY-MM-DD)
  storeCode: string;
  departmentCode: string;
}

export interface GeneralGinLineItemRow {
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
  // Read-only context carried alongside each row from GetIssuableStrnLinesAsync -
  // never sent back to the server, used only to compute client-side warnings.
  requestedQuantity: number;
  qtyInHand: number;
  shadowBalance: number;
  minStock: number;
}

export interface GeneralGinIssuableStrnLine {
  itemCode: string;
  description: string;
  unit: string;
  requestedQuantity: number;
  qtyInHand: number;
  shadowBalance: number;
  minStock: number;
}

export interface GeneralGinStrnLookupResult {
  srnNumber: string;
  storeCode: string;
  storeDescription: string;
  departmentCode: string;
  lines: GeneralGinIssuableStrnLine[];
}

export interface GeneralGinSubmissionPayload {
  header: GeneralGinHeaderModel;
  lines: Array<{ itemCode: string; unit: string; quantity: number }>;
  overrideMinStockCheck?: boolean;
}

export interface GeneralGinMutationResponse {
  success: boolean;
  message: string;
}
