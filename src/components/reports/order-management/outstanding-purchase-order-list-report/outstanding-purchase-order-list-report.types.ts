// Mirrors ApparelPro.WebApi.Reports.Models.OutstandingPurchaseOrderListReportAPIModel
// (and its nested models) exactly. ASP.NET Core's default JSON policy lowercases the
// first letter of each C# PascalCase property.
//
// Backed by OutstandingPurchaseOrderListReportController (api/outstanding-purchase-
// order-list-report/details, /pdf), which replicates OD_PLST1.PRG's "LIST OF
// OUTSTANDING P/O's - Date Wise" report, corrected to check every Buyer/Order/Type/
// Style detail group on a P/O for a nonzero balance (not just the first group legacy
// happened to find) - see the ServiceModel's notes on the backend. Each outstanding
// group is its own row, so a P/O with multiple outstanding groups appears more than
// once.

export interface OutstandingPurchaseOrderGroup {
  buyerCode: number;
  buyerName: string;
  order: string;
  typeCode: number;
  typeName: string;
  styleCode: string;
}

export interface OutstandingPurchaseOrder {
  purchaseOrderNumber: string;
  createdDate: string | null; // ISO date string (DateOnly on the wire), nullable
  createdTime: string | null; // ISO time string (TimeOnly on the wire), nullable
  supplierCode: string;
  supplierName: string;
  proformaInvoiceNo: string | null;
  currencyCode: string;
  outstandingGroups: OutstandingPurchaseOrderGroup[];
}

export interface OutstandingPurchaseOrderBasisGroup {
  basisCode: string;
  basisName: string;
  purchaseOrders: OutstandingPurchaseOrder[];
}

export interface OutstandingPurchaseOrderListReport {
  startDate: string;
  endDate: string;
  basisCode: string | null;
  basisGroups: OutstandingPurchaseOrderBasisGroup[];
}
