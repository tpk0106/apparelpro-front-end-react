// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory.GeneralSan* exactly. ASP.NET
// Core's default JSON policy lowercases the first letter of each C# PascalCase property.

export interface GeneralSanHeaderModel {
  sanNumber: string; // allocated by the C# backend
  transactionDate: string; // ISO date (YYYY-MM-DD)
  storeCode: string;
}

export interface GeneralSanLineItemRow {
  itemCode: string;
  unit: string;
  // Absolute new stock count for this item - a physical stock-take correction, not an
  // add/subtract adjustment.
  quantity: number;
  price: number;
  currencyCode: string;
}

export interface GeneralSanSubmissionPayload {
  header: GeneralSanHeaderModel;
  lines: GeneralSanLineItemRow[];
}
