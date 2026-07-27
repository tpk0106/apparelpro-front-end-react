export interface DgnHeaderModel {
  buyerCode: number;
  order: string;
  transactionDate: string; // ISO date string (YYYY-MM-DD)
}

export interface DgnLineItemRow {
  storeCode: string; // "Basis"
  itemCode: string; // 22-char composite key
  unit: string;
  quantity: number;
  // Read-only context carried alongside each row from GetDamageableStockByBuyerOrderAsync —
  // never sent back to the server, used only to render grid context and the client-side
  // over-ceiling warning.
  description: string;
  qtyInHand: number;
  maxDamageableQuantity: number; // = qtyInHand at lookup time (legacy "Attempt to Exceed Balance Quantity")
}

export interface DgnSubmissionPayload {
  header: DgnHeaderModel;
  lines: Array<{
    storeCode: string;
    itemCode: string;
    unit: string;
    quantity: number;
  }>;
}

export interface DgnMutationResponse {
  success: boolean;
  message: string;
  dgnNumber: string;
}

// GET /damageable-stock response row shape
export interface DgnDamageableStockRow {
  itemCode: string;
  storeCode: string;
  unit: string;
  description: string;
  qtyInHand: number;
  maxDamageableQuantity: number;
}
