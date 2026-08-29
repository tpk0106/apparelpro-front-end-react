// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory.GeneralStockValuationReport* exactly.
// ASP.NET Core's default JSON policy lowercases the first letter of each C#
// PascalCase property.

export interface GeneralStockValuationReportHeader {
  storeCode: string;
  storeDescription: string;
  fromItemCode: string;
  toItemCode: string;
  totalValue: number;
  totalLineItems: number;
}

export interface GeneralStockValuationReportLine {
  itemCode: string;
  description: string;
  unit: string;
  qtyInHand: number;
  value: number;
  damagedQuantity: number;
  reorderLevel: number;
  reorderQuantity: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  currency: string;
}
