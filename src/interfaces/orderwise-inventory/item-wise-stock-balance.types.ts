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

// Type-ahead search result backing the From/To Item range Autocomplete pickers.
export interface ItemCodeSearchResult {
  code: string;
  description: string;
}

export interface ItemWiseStockBalanceLine {
  stockTypeCode: string;
  stockTypeDescription: string;
  itemGroupCode: string;
  itemGroupDescription: string;
  buyerCode: number;
  buyerName: string;
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
