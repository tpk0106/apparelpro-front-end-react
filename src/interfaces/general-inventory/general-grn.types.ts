// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory GRN models exactly.

export interface GeneralGrnHeaderModel {
  grnNumber: string; // allocated by the C# backend
  poNumber: string;
  transactionDate: string; // ISO date string (YYYY-MM-DD)
  supplierCode: string;
  currencyCode: string;
  invoiceNumber?: string;
}

export interface GeneralGrnLineItemRow {
  storeCode: string;
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
  price: number;
  // Read-only context carried alongside each row from GetReceivableLinesByPoAsync -
  // never sent back to the server, used only to compute client-side warnings.
  orderQuantity: number;
  balance: number;
  qtyInHand: number;
  maxStock: number;
}

export interface GeneralGrnReceivableLine {
  storeCode: string;
  itemCode: string;
  description: string;
  unit: string;
  orderQuantity: number;
  balance: number;
  qtyInHand: number;
  maxStock: number;
}

export interface GeneralGrnPoLookupResult {
  poNumber: string;
  supplierCode: string;
  currencyCode: string | null;
  lines: GeneralGrnReceivableLine[];
}

export interface GeneralGrnSubmissionPayload {
  header: GeneralGrnHeaderModel;
  lines: Array<{
    storeCode: string;
    itemCode: string;
    unit: string;
    quantity: number;
    price: number;
  }>;
  maxStockOverrideConfirmed?: boolean;
}

export interface GeneralGrnMutationResponse {
  success: boolean;
  message: string;
}
