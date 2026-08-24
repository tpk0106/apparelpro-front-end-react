// Mirrors ApparelPro.WebApi.Reports.Models.StockArrivalStatusReportAPIModel (and its
// nested classes) exactly. ASP.NET Core's default JSON policy lowercases the first
// letter of each C# PascalCase property, so BuyerCode -> buyerCode, etc.
//
// Backed by StockArrivalStatusReportController (api/stock-arrival-status-report/details,
// /pdf), which replicates OD_STARV.PRG's "STOCK ARRIVAL STATUS REPORT". Buyer, Order, and
// As Of Date are all mandatory, matching the legacy screen's own "empty -> exit" checks.

export interface StockArrivalStatusReportScopeContext {
  buyerCode: number;
  order: string;
  asOfDate: string; // yyyy-MM-dd
}

export interface StockArrivalPoLine {
  purchaseOrderNumber: string;
  orderedQuantity: number;
  storeCode: string;
  supplierName: string;
  expectedDate: string | null;
  delayDays: number | null;
  supplierReturnQuantity: number;
}

export interface StockArrivalItem {
  itemCode: string;
  description: string;
  unit: string;
  orderedQuantity: number;
  totalReceivedQuantity: number;
  balanceToReceive: number;
  purchaseOrderLines: StockArrivalPoLine[];
}

export interface StockArrivalStatusReport {
  buyerCode: number;
  buyerName: string;
  order: string;
  asOfDate: string;
  totalOrderQuantity: number;
  unit: string;
  items: StockArrivalItem[];
}
