// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory.GeneralPurchaseOrderListReport* exactly.
// ASP.NET Core's default JSON policy lowercases the first letter of each C#
// PascalCase property. DateOnly/TimeOnly serialize as "yyyy-MM-dd"/"HH:mm:ss" strings.

export interface GeneralPurchaseOrderListReportHeader {
  fromDate: string;
  toDate: string;
  totalLineItems: number;
}

export interface GeneralPurchaseOrderListReportLine {
  poNumber: string;
  orderDate: string | null;
  orderTime: string | null;
  supplierName: string;
  basisCode: string | null;
  proformaInvoiceNo: string | null;
  currencyCode: string | null;
  preparedBy: string;
}
