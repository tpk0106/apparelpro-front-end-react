// Mirrors ApparelPro.WebApi.APIModels.OrderwiseInventory.RawMaterialControlSheet* exactly.

export interface RawMaterialControlSheetHeader {
  buyerCode: number;
  order: string;
  itemDescription: string;
  orderQuantity: number;
  unit: string;
  totalLineItems: number;
}

export interface RawMaterialControlSheetLine {
  stockCode: string;
  stockDescription: string;
  itemCode: string;
  description: string;
  unit: string;
  totalConsumption: number;
  exactConsumption: number;
  totalOrderQuantity: number;
  totalReceivedQuantity: number;
  totalIssuedQuantity: number;
  qtyInHand: number;
  unitPrice: number;
  currency: string;
}
