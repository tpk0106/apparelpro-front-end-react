export interface RtnHeaderModel {
  buyerCode: number;
  order: string;
  transactionDate: string; // ISO date string (YYYY-MM-DD)
}

export interface RtnLineItemRow {
  storeCode: string; // "Basis"
  itemCode: string; // 22-char composite key
  unit: string;
  quantity: number;
  // Read-only context carried alongside each row from GetReturnableStockByBuyerOrderAsync —
  // never sent back to the server, used only to compute the client-side warning.
  description: string;
  qtyInHand: number;
  maxReturnableQuantity: number; // ToDateIssued ceiling — legacy "Total issues"
}

export interface RtnSubmissionPayload {
  header: RtnHeaderModel;
  lines: Array<{
    storeCode: string;
    itemCode: string;
    unit: string;
    quantity: number;
  }>;
}

export interface RtnMutationResponse {
  success: boolean;
  message: string;
  rtnNumber: string;
}

// GET /returnable-stock response row shape
export interface RtnReturnableStockRow {
  itemCode: string;
  storeCode: string;
  unit: string;
  description: string;
  qtyInHand: number;
  maxReturnableQuantity: number;
}
