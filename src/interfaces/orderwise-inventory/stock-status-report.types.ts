// Mirrors ApparelPro.WebApi.APIModels.OrderwiseInventory.StockStatusReport* exactly.

export interface StockStatusReportHeader {
  buyerCode: number;
  buyerName: string;
  order: string;
  totalLineItems: number;
}

export interface StockStatusReportLine {
  itemCode: string;
  description: string;
  unit: string;
  orderedQuantity: number;
  receivedQuantity: number;
  balanceToReceive: number;
  damagedQuantity: number;
  qtyInHand: number;
  storeCode: string;
}
