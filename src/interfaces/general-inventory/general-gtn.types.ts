// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory.GeneralGtn* exactly. ASP.NET
// Core's default JSON policy lowercases the first letter of each C# PascalCase property.

export interface GeneralGtnHeaderModel {
  gtnNumber: string; // allocated by the C# backend
  transactionDate: string; // ISO date (YYYY-MM-DD)
  fromStoreCode: string;
  toStoreCode: string;
}

export interface GeneralGtnLineItemRow {
  itemCode: string;
  unit: string;
  quantity: number;
}

export interface GeneralGtnSubmissionPayload {
  header: GeneralGtnHeaderModel;
  lines: GeneralGtnLineItemRow[];
}
