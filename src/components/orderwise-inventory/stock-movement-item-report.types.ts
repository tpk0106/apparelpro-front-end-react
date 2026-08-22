// Mirrors ApparelPro.WebApi.APIModels.OrderwiseInventory.StockMovementItemOptionAPIModel /
// StockMovementItemReportHeaderAPIModel / StockMovementItemReportLineAPIModel exactly.

export interface StockMovementItemOption {
  itemCode: string;
  description: string;
}

export interface StockMovementItemReportHeader {
  buyerCode: number;
  buyerName: string;
  order: string;
  itemCode: string;
  description: string;
  unit: string;
  orderQuantity: number;
  transactionCount: number;
  closingBalance: number;
}

export interface StockMovementItemReportLine {
  transactionDate: string; // ISO date string
  documentNumber: string;
  transactionType: string;
  transactionTypeName: string;
  unit: string;
  quantity: number;
  balanceAfter: number;
}

export interface StockMovementItemReportLinesQueryParams {
  buyerCode: number;
  order: string;
  itemCode: string;
  pageSize: number;
  // 1-based — StockMovementItemReportService.GetLinesAsync does Skip((currentPage - 1) * pageSize).
  currentPage: number;
}

// Movement-direction convention — mirrors StockMovementItemReportEngine's PDF color
// logic exactly, so the on-screen grid and the exported PDF always agree. Anything not
// in either list ("0S" Stores Requisition, "3A" Stock Adjustment which SETS the balance
// rather than adding/subtracting, and "4X" Additional Issue Note which has zero effect
// per legacy IN_SMVE1.PRG) renders neutral — it isn't a plain inbound or outbound move.
export const INBOUND_TRANSACTION_TYPES = ["GR", "0X", "1T", "2R"];
export const OUTBOUND_TRANSACTION_TYPES = ["4I", "5D", "6T", "7S"];
