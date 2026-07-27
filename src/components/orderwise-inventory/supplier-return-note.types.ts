export interface SrnHeaderModel {
  buyerCode: number;
  order: string;
  supplierCode: number;
  transactionDate: string; // ISO date string (YYYY-MM-DD)
}

export interface SrnLineItemRow {
  storeCode: string; // "Basis"
  itemCode: string; // 22-char composite key
  unit: string;
  quantity: number;
  // Read-only context carried alongside each row from GetReturnableStockByBuyerOrderAsync —
  // never sent back to the server, used only to compute the client-side warning.
  description: string;
  qtyInHand: number;
  maxReturnableQuantity: number; // = qtyInHand at lookup time (legacy "Attempt to Exceed Balance Quantity")
  // Advisory only — QtyInHand minus what's already reserved by open Stores Requisition
  // Notes. Can be negative even before this return is applied; never blocks submit.
  netAvailableAfterOutstandingRequisitions: number;
}

export interface SrnSubmissionPayload {
  header: SrnHeaderModel;
  lines: Array<{
    storeCode: string;
    itemCode: string;
    unit: string;
    quantity: number;
  }>;
}

export interface SrnMutationResponse {
  success: boolean;
  message: string;
  srnNumber: string;
}

// GET /returnable-stock response row shape
export interface SrnReturnableStockRow {
  itemCode: string;
  storeCode: string;
  unit: string;
  description: string;
  qtyInHand: number;
  maxReturnableQuantity: number;
  netAvailableAfterOutstandingRequisitions: number;
}
