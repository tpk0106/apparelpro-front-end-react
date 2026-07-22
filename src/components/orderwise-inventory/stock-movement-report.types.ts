// Mirrors ApparelPro.WebApi.APIModels.OrderwiseInventory.StockMovementReportHeaderAPIModel /
// StockMovementReportLineAPIModel exactly. ASP.NET Core's default JSON policy lowercases the
// first letter of each C# PascalCase property, so BuyerCode -> buyerCode, etc. No DTO layer
// needed on the frontend beyond these two interfaces.

export interface StockMovementReportHeader {
  buyerCode: number;
  // Added alongside the PDF fix that prints the buyer's name instead of the raw
  // code in the report header — the on-screen workspace already shows the name
  // via the buyer picker, so this isn't rendered a second time here, but it's
  // kept in sync with the API model for completeness.
  buyerName: string;
  order: string;
  totalLineItems: number;
  fullyReceivedCount: number;
  damagedItemCount: number;
  shortfallCount: number;
}

export interface StockMovementReportLine {
  itemCode: string;
  description: string;
  unit: string;
  orderedQuantity: number;
  receivedQuantity: number;
  requisitionedQuantity: number;
  issuedQuantity: number;
  // Placeholder columns — always 0 today. Stock Transfer, Supplier Return and Stock
  // Adjustment Note modules don't exist yet in Order Wise Inventory. Once they're built
  // and start posting OrderwiseStockTransaction rows with TransactionType "TI"/"TO"/"SR"/"AJ",
  // these reflect real figures automatically — no frontend changes required.
  transferInQuantity: number;
  transferOutQuantity: number;
  supplierReturnQuantity: number;
  lastAdjustmentQuantity: number;
  damagedQuantity: number;
  balanceQuantity: number;
}

// Columns with no backing module yet — the grid renders these dimmed/annotated rather
// than color-coded like the real inbound/outbound columns, so a 0 here is never read as
// "confirmed zero movement" the way a 0 in receivedQuantity would be.
export const PLACEHOLDER_LINE_COLUMNS: Array<keyof StockMovementReportLine> = [
  "transferInQuantity",
  "transferOutQuantity",
  "supplierReturnQuantity",
  "lastAdjustmentQuantity",
];

export interface StockMovementReportLinesQueryParams {
  buyerCode: number;
  order: string;
  pageSize: number;
  // 1-based — StockMovementReportService.GetStockMovementReportLinesAsync does
  // Skip((currentPage - 1) * pageSize), unlike the pageIndex (0-based) used elsewhere.
  currentPage: number;
  sortColumn?: string | null;
  sortOrder?: string | null;
  filterColumn?: string | null;
  filterQuery?: string | null;
}
