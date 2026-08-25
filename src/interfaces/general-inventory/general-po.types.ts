// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory.GeneralPo* exactly. ASP.NET
// Core's default JSON policy lowercases the first letter of each C# PascalCase property.

export interface GeneralPoHeaderModel {
  poNumber: string; // blank on a new P/O - server allocates one
  isNewPurchaseOrder: boolean;
  supplierCode: string;
  orderDate: string; // ISO date (YYYY-MM-DD)
  basisCode: string;
  currencyCode: string;
  proformaInvoiceNo: string | null;
  proformaInvoiceDate: string | null; // ISO date or null
}

export interface GeneralPoLineItemRow {
  storeCode: string;
  itemCode: string;
  refNo: string | null;
  unit: string;
  orderedQuantity: number;
  price: number;
  expectedDate: string | null; // ISO date or null
}

export interface GeneralPOSubmissionPayload {
  header: GeneralPoHeaderModel;
  lines: GeneralPoLineItemRow[];
}

export interface GeneralPoCommitResult {
  poNumber: string;
  warnings: string[];
}
