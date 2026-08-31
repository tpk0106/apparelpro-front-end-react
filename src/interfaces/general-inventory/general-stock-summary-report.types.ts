// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory.GeneralStockSummaryReport* exactly.
// ASP.NET Core's default JSON policy lowercases the first letter of each C#
// PascalCase property.

export interface GeneralStockSummaryReportHeader {
  month: number;
  year: number;
  currency1: string;
  currency2: string;
  grandTotalCurrency1: number;
  grandTotalCurrency2: number;
  totalStockTypes: number;
}

export type GeneralStockSummaryReportRowType = "Store" | "StockTypeSubtotal" | "GrandTotal";

export interface GeneralStockSummaryReportLine {
  stockTypeCode: string;
  stockTypeDescription: string;
  storeCode: string;
  storeDescription: string;
  valueInCurrency1: number;
  valueInCurrency2: number;
  rowType: GeneralStockSummaryReportRowType;
}
