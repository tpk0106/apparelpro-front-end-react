// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory.GeneralRtn* exactly. ASP.NET
// Core's default JSON policy lowercases the first letter of each C# PascalCase property.

export interface GeneralRtnHeaderModel {
  rtnNumber: string; // allocated by the C# backend
  transactionDate: string; // ISO date (YYYY-MM-DD)
  departmentCode: string;
  storeCode: string;
}

export interface GeneralRtnLineItemRow {
  itemCode: string;
  unit: string;
  quantity: number;
}

export interface GeneralRtnSubmissionPayload {
  header: GeneralRtnHeaderModel;
  lines: GeneralRtnLineItemRow[];
}
