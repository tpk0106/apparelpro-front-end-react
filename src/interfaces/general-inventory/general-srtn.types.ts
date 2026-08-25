// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory.GeneralSrtn* exactly. ASP.NET
// Core's default JSON policy lowercases the first letter of each C# PascalCase property.

export const GeneralSrtnStockType = {
  Regular: "Regular",
  Damaged: "Damaged",
} as const;

export type GeneralSrtnStockTypeValue =
  (typeof GeneralSrtnStockType)[keyof typeof GeneralSrtnStockType];

export interface GeneralSrtnHeaderModel {
  srtnNumber: string; // allocated by the C# backend
  transactionDate: string; // ISO date (YYYY-MM-DD)
  storeCode: string;
  supplierCode: number;
  stockType: GeneralSrtnStockTypeValue;
}

export interface GeneralSrtnLineItemRow {
  itemCode: string;
  unit: string;
  quantity: number;
}

export interface GeneralSrtnSubmissionPayload {
  header: GeneralSrtnHeaderModel;
  lines: GeneralSrtnLineItemRow[];
}
