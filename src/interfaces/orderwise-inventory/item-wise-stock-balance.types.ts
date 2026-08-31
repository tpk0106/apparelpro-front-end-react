// Mirrors ApparelPro.WebApi.APIModels.OrderwiseInventory.ItemWiseStockBalance* exactly.

export interface ItemWiseStockBalanceHeader {
  fromRange: string;
  toRange: string;
  currency: string;
  totalLineItems: number;
  totalReceivedValue: number;
  totalBalanceValue: number;
}

export type ItemWiseStockBalanceRowType = "Item" | "ItemGroupSubtotal" | "StockTypeSubtotal" | "GrandTotal";

export interface ItemWiseStockBalanceLine {
  stockTypeCode: string;
  stockTypeDescription: string;
  itemGroupCode: string;
  itemGroupDescription: string;
  buyerCode: number;
  order: string;
  itemCode: string;
  description: string;
  unit: string;
  unitPrice: number;
  receivedQuantity: number;
  receivedValue: number;
  qtyInHand: number;
  balanceValue: number;
  rowType: ItemWiseStockBalanceRowType;
}
