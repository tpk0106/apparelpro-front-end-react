// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory.GeneralStockMovementReport* exactly.
// ASP.NET Core's default JSON policy lowercases the first letter of each C#
// PascalCase property. DateOnly/TimeOnly serialize as "yyyy-MM-dd"/"HH:mm:ss" strings.

export interface GeneralStockMovementReportHeader {
  storeCode: string;
  storeDescription: string;
  itemCode: string;
  itemDescription: string;
  unit: string;
  month: number;
  year: number;
  broughtForwardBalance: number;
  carriedForwardBalance: number;
  transactionCount: number;
}

export interface GeneralStockMovementReportLine {
  transactionDate: string;
  transactionTime: string | null;
  transactionTypeCode: string;
  documentTypeDescription: string;
  documentNumber: string;
  status: string;
  sourceTarget: string;
  amount: number;
  runningBalance: number;
}
