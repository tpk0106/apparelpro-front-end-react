export interface AinHeaderModel {
  buyerCode: number;
  order: string;
  transactionDate: string; // ISO date string (YYYY-MM-DD)
  subContractorCode: string;
  // Additional Cost code - the Additional Process (e.g. embroidery) this material
  // is being issued for. The server validates this is already assigned to the
  // Buyer/Order via GarmentAdditionalCosts (the modern equivalent of od_aitm).
  additionalProcessCode: string;
}

export interface AinLineItemRow {
  storeCode: string; // "Basis"
  itemCode: string; // 22-char composite key
  unit: string;
  // The quantity being issued on THIS AIN - defaults to 0 (unlike SAN's
  // adjustedQuantity, which defaults to the current on-hand count, AIN is an
  // additive issue against an existing allocation). Ceiling is availableForIssue,
  // enforced here and, authoritatively, again server-side.
  quantity: number;
  // Read-only context carried alongside each row from
  // GetIssuableStockByBuyerOrderAsync - never sent back to the server.
  description: string;
  orderedQuantity: number;
  shadowBalance: number;
  toDateIssued: number;
  qtyInHand: number;
  // Server-computed ceiling = min(OrderedQuantity - ShadowBalance - ToDateIssued,
  // QtyInHand) - combines the legacy order-allocation headroom check with a
  // physical-availability guard.
  availableForIssue: number;
}

export interface AinSubmissionPayload {
  header: AinHeaderModel;
  lines: Array<{
    storeCode: string;
    itemCode: string;
    unit: string;
    quantity: number;
  }>;
}

export interface AinMutationResponse {
  success: boolean;
  message: string;
  ainNumber: string;
}

// GET /issuable-stock response row shape
export interface AinIssuableStockRow {
  itemCode: string;
  storeCode: string;
  unit: string;
  description: string;
  orderedQuantity: number;
  shadowBalance: number;
  toDateIssued: number;
  qtyInHand: number;
  availableForIssue: number;
}
