export interface GtnHeaderModel {
  fromBuyerCode: number;
  fromOrder: string;
  toBuyerCode: number;
  toOrder: string;
  transactionDate: string; // ISO date string (YYYY-MM-DD)
}

export interface GtnLineItemRow {
  storeCode: string; // "Basis"
  itemCode: string; // 22-char composite key
  unit: string;
  quantity: number;
  // Read-only context carried alongside each row from GetTransferableStockAsync —
  // never sent back to the server, used only to compute the client-side warning.
  description: string;
  qtyInHand: number;
  maxTransferableQuantity: number; // From-side QtyInHand ceiling at lookup time
}

export interface GtnSubmissionPayload {
  header: GtnHeaderModel;
  lines: Array<{
    storeCode: string;
    itemCode: string;
    unit: string;
    quantity: number;
  }>;
}

export interface GtnMutationResponse {
  success: boolean;
  message: string;
  gtnNumber: string;
}

// GET /transferable-stock response row shape
export interface GtnTransferableStockRow {
  itemCode: string;
  storeCode: string;
  unit: string;
  description: string;
  qtyInHand: number;
  maxTransferableQuantity: number;
}
