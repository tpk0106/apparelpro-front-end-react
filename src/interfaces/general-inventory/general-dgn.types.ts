// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory.GeneralDgn* exactly. ASP.NET
// Core's default JSON policy lowercases the first letter of each C# PascalCase property.

export interface GeneralDgnHeaderModel {
  dgnNumber: string; // allocated by the C# backend
  transactionDate: string; // ISO date (YYYY-MM-DD)
  storeCode: string;
}

export interface GeneralDgnLineItemRow {
  itemCode: string;
  unit: string;
  quantity: number;
}

export interface GeneralDgnSubmissionPayload {
  header: GeneralDgnHeaderModel;
  lines: GeneralDgnLineItemRow[];
}
