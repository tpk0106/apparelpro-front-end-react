// Mirrors ApparelPro.WebApi.APIModels.OrderwiseInventory.StockValuationReport* exactly.

export interface StockValuationReportStyle {
  styleCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface StockValuationReportHeader {
  buyerCode: number;
  buyerName: string;
  order: string;
  currency: string;
  styles: StockValuationReportStyle[];
  totalReceivedValue: number;
  totalIssuedValue: number;
  totalBalanceValue: number;
}

export type StockValuationReportRowType = "Item" | "StockTypeSubtotal" | "GrandTotal";

export interface StockValuationReportLine {
  stockTypeCode: string;
  stockTypeDescription: string;
  itemCode: string;
  description: string;
  unit: string;
  unitPrice: number;
  orderedQuantity: number;
  receivedQuantity: number;
  receivedValue: number;
  issuedQuantity: number;
  issuedValue: number;
  qtyInHand: number;
  balanceValue: number;
  rowType: StockValuationReportRowType;
}
