export interface SanHeaderModel {
  buyerCode: number;
  order: string;
  transactionDate: string; // ISO date string (YYYY-MM-DD)
}

export interface SanLineItemRow {
  storeCode: string; // "Basis"
  itemCode: string; // 22-char composite key
  unit: string;
  // NOT a movement delta, unlike every other note type's quantity field — this is the
  // corrected/true physical count the operator is declaring. The server SETS
  // OrderwiseStock.QtyInHand to this value outright (see StockAdjustmentNoteService).
  adjustedQuantity: number;
  // Read-only context carried alongside each row from GetAdjustableStockByBuyerOrderAsync
  // — never sent back to the server. qtyInHand is the count BEFORE this adjustment, kept
  // so the grid can show a before/after delta; there is deliberately no "max" ceiling
  // field here, since SAN has no ceiling.
  description: string;
  qtyInHand: number;
}

export interface SanSubmissionPayload {
  header: SanHeaderModel;
  lines: Array<{
    storeCode: string;
    itemCode: string;
    unit: string;
    adjustedQuantity: number;
  }>;
}

export interface SanMutationResponse {
  success: boolean;
  message: string;
  sanNumber: string;
}

// GET /adjustable-stock response row shape
export interface SanAdjustableStockRow {
  itemCode: string;
  storeCode: string;
  unit: string;
  description: string;
  qtyInHand: number;
}
