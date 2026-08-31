// Mirrors ApparelPro.WebApi.APIModels.OrderwiseInventory.StockValuationMonthlyReport*
// exactly. DateOnly serializes as a "yyyy-MM-dd" string.

export interface StockValuationMonthlyReportHeader {
  fromDate: string;
  toDate: string;
  totalLineItems: number;
  totalReceivedValue: number;
  totalIssuedValue: number;
}

export interface StockValuationMonthlyReportLine {
  itemCode: string;
  description: string;
  unit: string;
  currency: string;
  unitPrice: number;
  receivedQuantity: number;
  receivedValue: number;
  issuedQuantity: number;
  issuedValue: number;
}
