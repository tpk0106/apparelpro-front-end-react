// Mirrors ApparelPro.WebApi.Reports.Models.PurchaseOrderListReportAPIModel (and its
// nested line model) exactly. ASP.NET Core's default JSON policy lowercases the first
// letter of each C# PascalCase property, so PurchaseOrderNumber -> purchaseOrderNumber,
// etc.
//
// Backed by PurchaseOrderListReportController (api/purchase-order-list-report/po-numbers,
// /details, /pdf), which replicates OD_POLST.PRG's "PURCHASE ORDER LIST" print program
// scoped to a single Supplier Purchase Order number - every line item on that P/O,
// resolved back to the Buyer/Order/Type/Style it was raised against. See
// PurchaseOrderListReportServiceModel's SCOPE NOTE on the backend for the one legacy
// field with no modern equivalent (the P/O's creation Date/Time).

export interface PurchaseOrderListLine {
  itemCode: string;
  description: string;
  orderQuantity: number;
  orderUnit: string;
  unitPrice: number;
  buyerCode: number;
  buyerName: string;
  order: string;
  typeCode: number;
  typeName: string;
  styleCode: string;
}

export interface PurchaseOrderListReport {
  purchaseOrderNumber: string;
  supplierCode: string;
  supplierName: string;
  proformaInvoiceNo: string | null;
  proformaInvoiceDate: string | null; // ISO date string (DateOnly on the wire), nullable
  currencyCode: string;
  lines: PurchaseOrderListLine[];
}
