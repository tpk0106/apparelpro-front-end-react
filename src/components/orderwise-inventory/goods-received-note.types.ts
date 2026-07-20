export interface GrnHeaderModel {
  purchaseOrderNumber: string;
  transactionDate: string; // ISO date string (YYYY-MM-DD)
  storeCode: string;
  supplierCode: string;
}

export interface GrnLineItemRow {
  buyer: number;
  order: string;
  type: number;
  style: string;
  itemCode: string;
  unit: string;
  quantity: number;
  // Read-only context carried alongside each row from GetReceivableLinesByPoAsync —
  // never sent back to the server, used only to compute the client-side warning.
  orderQuantity: number;
  balance: number;   // outstanding qty not yet received
  qtyInHand: number; // current live stock, for context only
}

export interface GrnSubmissionPayload {
  header: GrnHeaderModel;
  lines: Array<{
    buyer: number;
    order: string;
    type: number;
    style: string;
    itemCode: string;
    unit: string;
    quantity: number;
  }>;
}

export interface GrnMutationResponse {
  success: boolean;
  message: string;
}

export interface GrnReceivableLine {
  buyer: number;
  order: string;
  type: number;
  style: string;
  itemCode: string;
  unit: string;
  orderQuantity: number;
  balance: number;
  qtyInHand: number;
}

// GET /receivable-lines response shape
export interface GrnPoLookupResult {
  purchaseOrderNumber: string;
  storeCode: string;
  supplierCode: string;
  lines: GrnReceivableLine[];
}

// GET /pending-pos response shape
export interface GrnPendingPo {
  purchaseOrderNumber: string;
  supplierCode: string;
  storeCode: string;
}
