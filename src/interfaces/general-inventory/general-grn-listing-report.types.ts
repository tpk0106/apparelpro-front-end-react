// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory.GeneralGrnListingReport* exactly.
// ASP.NET Core's default JSON policy lowercases the first letter of each C#
// PascalCase property. DateOnly serializes as a "yyyy-MM-dd" string.

export interface GeneralGrnListingReportHeader {
  fromDate: string;
  toDate: string;
  storeCode: string | null;
  storeDescription: string | null;
  supplierCode: string | null;
  supplierName: string | null;
  totalTransactions: number;
  totalValue: number;
}

export interface GeneralGrnListingReportLine {
  transactionDate: string;
  grnNumber: string;
  invoiceNumber: string | null;
  poNumber: string | null;
  supplierCode: string | null;
  supplierName: string;
  storeCode: string;
  storeDescription: string;
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}
