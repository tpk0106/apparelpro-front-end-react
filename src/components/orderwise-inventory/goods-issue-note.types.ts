export interface GinHeaderModel {
  sourceStrnNumber: string;
  transactionDate: string; // ISO date string (YYYY-MM-DD)
  buyerCode: number;
  order: string;
  departmentCode: string;
}

export interface GinLineItemRow {
  stockCode: string;
  itemCode: string;
  storeCode: string;
  unit: string;
  quantity: number;
  // Read-only context carried alongside each row from GetIssuableStrnLinesAsync —
  // never sent back to the server, used only to compute the client-side warning.
  balanceToReceive: number;
  qtyInHand: number;
  strnBalance: number;
}

export interface GinSubmissionPayload {
  header: GinHeaderModel;
  lines: Array<{
    stockCode: string;
    itemCode: string;
    storeCode: string;
    unit: string;
    quantity: number;
  }>;
  overrideExactConsumptionCheck?: boolean;
}

export interface GinMutationResponse {
  success: boolean;
  message: string;
}

export interface GinIssuableStrnLine {
  stockCode: string;
  itemCode: string;
  storeCode: string;
  unit: string;
  balanceToReceive: number;
  qtyInHand: number;
  strnBalance: number;
}

// GET /issuable-lines response shape
export interface GinStrnLookupResult {
  buyerCode: number;
  order: string;
  departmentCode: string;
  lines: GinIssuableStrnLine[];
}

// GET /pending-strns response shape
export interface GinPendingStrn {
  strnNumber: string;
  departmentCode: string;
  transactionDate: string;
}
