// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory.GeneralStockMaster* exactly.
// ASP.NET Core's default JSON policy lowercases the first letter of each C# PascalCase
// property.

export interface GeneralStockMasterEntryPayload {
  storeCode: string;
  stockCode: string;
  itemCode: string; // base 4-char item code (not the composite)
  feature1: string | null;
  feature2: string | null;
  feature3: string | null;
  feature4: string | null;

  description: string;
  unit: string;
  currencyCode: string;
  reorderLevel: number;
  reorderQuantity: number;
  minStock: number;
  maxStock: number;
}

export interface GeneralStockMasterUpdatePayload {
  storeCode: string;
  itemCode: string; // full 22-char composite - identifies the existing row

  description: string;
  unit: string;
  currencyCode: string;
  reorderLevel: number;
  reorderQuantity: number;
  minStock: number;
  maxStock: number;
}

export interface GeneralStockMasterRow {
  storeCode: string;
  itemCode: string; // full 22-char composite
  description: string;
  unit: string;
  currency: string;
  reorderLevel: number;
  reorderQuantity: number;
  minStock: number;
  maxStock: number;
  qtyInHand: number;
}
