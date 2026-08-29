// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory.GeneralStockReorderReport* exactly.
// ASP.NET Core's default JSON policy lowercases the first letter of each C#
// PascalCase property.

export interface GeneralStockReorderReportHeader {
  storeCode: string;
  storeDescription: string;
  totalLineItems: number;
}

export interface GeneralStockReorderReportLine {
  itemCode: string;
  description: string;
  unit: string;
  averagePrice: number;
  qtyInHand: number;
  reorderLevel: number;
  reorderQuantity: number;
}
