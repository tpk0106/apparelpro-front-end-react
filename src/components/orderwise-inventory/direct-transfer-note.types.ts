export interface DtnHeaderModel {
  fromBuyerCode: number;
  fromOrder: string;
  toBuyerCode: number;
  toOrder: string;
  transactionDate: string; // ISO date string (YYYY-MM-DD)
}

export interface DtnLineItemRow {
  storeCode: string; // "Basis" - shared by both sides
  fromItemCode: string; // 22-char composite key, from-side
  // The destination item this line's quantity should become - user-selected from
  // toOrderItems (the To Order's own material requirement), empty until picked. The
  // one field with no equivalent in GtnLineItemRow, since GTN always keeps the same
  // item code on both sides.
  toItemCode: string;
  unit: string;
  quantity: number;
  // Read-only context carried alongside each row from GetFromStockAsync — never sent
  // back to the server, used only to compute the client-side warning.
  description: string;
  qtyInHand: number;
  maxTransferableQuantity: number; // From-side QtyInHand ceiling at lookup time
}

export interface DtnSubmissionPayload {
  header: DtnHeaderModel;
  lines: Array<{
    storeCode: string;
    fromItemCode: string;
    toItemCode: string;
    unit: string;
    quantity: number;
  }>;
}

export interface DtnMutationResponse {
  success: boolean;
  message: string;
  dtnNumber: string;
}

// GET /from-stock response row shape
export interface DtnFromStockRow {
  itemCode: string;
  storeCode: string;
  unit: string;
  description: string;
  qtyInHand: number;
  maxTransferableQuantity: number;
}

// GET /to-order-items response row shape
export interface DtnToItem {
  itemCode: string;
  description: string;
  unit: string;
}
