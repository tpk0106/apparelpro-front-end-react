// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory.GeneralTransactionListReport* exactly.
// ASP.NET Core's default JSON policy lowercases the first letter of each C#
// PascalCase property. DateOnly/TimeOnly serialize as "yyyy-MM-dd"/"HH:mm:ss" strings.

export interface GeneralTransactionListReportHeader {
  fromDate: string;
  toDate: string;
  transactionTypeCode: string | null;
  itemCodePrefix: string | null;
  totalLineItems: number;
}

export interface GeneralTransactionListReportLine {
  transactionDate: string;
  transactionTime: string | null;
  transactionTypeCode: string;
  documentTypeDescription: string;
  documentNumber: string;
  storeCode: string;
  itemCode: string;
  description: string;
  quantity: number;
  unit: string;
}
