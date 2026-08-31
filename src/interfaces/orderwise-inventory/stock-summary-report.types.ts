// Mirrors ApparelPro.WebApi.APIModels.OrderwiseInventory.StockSummaryReport* exactly.

export interface StockSummaryReportHeader {
  currency1: string;
  currency2: string;
  grandTotalCurrency1: number;
  grandTotalCurrency2: number;
  totalStockTypes: number;
}

export type StockSummaryReportRowType = "Store" | "StockTypeSubtotal" | "GrandTotal";

export interface StockSummaryReportLine {
  stockTypeCode: string;
  stockTypeDescription: string;
  storeCode: string;
  valueInCurrency1: number;
  valueInCurrency2: number;
  rowType: StockSummaryReportRowType;
}
