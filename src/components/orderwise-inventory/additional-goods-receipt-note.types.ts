export interface ArnHeaderModel {
  transactionDate: string; // ISO date string (YYYY-MM-DD)
  subContractorCode: string;
  invoiceNumber: string | null;
  // Currency the Price on every line is entered in - converted per-line into that
  // item's own order-level master currency on commit.
  currency: string;
}

// Unlike AIN (one Buyer/Order/Process for the whole note), every ARN line carries
// its own Buyer/Order/Process - a single ARN can receive processed goods back for
// several different orders in one note.
export interface ArnLineItemRow {
  buyerCode: number | null;
  buyerName: string; // display-only, never sent back to the server
  order: string;
  additionalProcessCode: string;
  itemCode: string; // 22-char composite key
  unit: string;
  quantity: number;
  price: number;
  // Read-only context carried alongside each row from
  // GetReceivableStockByBuyerOrderAsync - never sent back to the server.
  description: string;
  storeCode: string;
  toDateIssued: number;
  toDateReceived: number;
  isSemiFinishedGarment: boolean;
  receivableBalance: number;
}

export interface ArnSubmissionPayload {
  header: ArnHeaderModel;
  lines: Array<{
    buyerCode: number;
    order: string;
    additionalProcessCode: string;
    itemCode: string;
    unit: string;
    quantity: number;
    price: number;
  }>;
}

export interface ArnMutationResponse {
  success: boolean;
  message: string;
  arnNumber: string;
}

// GET /receivable-stock response row shape
export interface ArnReceivableStockRow {
  itemCode: string;
  storeCode: string;
  unit: string;
  description: string;
  additionalProcessCode: string;
  toDateIssued: number;
  toDateReceived: number;
  isSemiFinishedGarment: boolean;
  receivableBalance: number;
}
