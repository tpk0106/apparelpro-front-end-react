// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory.GeneralPoPrintHeaderAPIModel /
// GeneralPoPrintLineAPIModel / GeneralPoPrintDetailsAPIModel exactly.

export interface GeneralPoPrintReportHeader {
  poNumber: string;
  orderDate: string | null;
  supplierCode: number;
  supplierName: string;
  supplierAddress: string;
  currencyCode: string;
  proformaInvoiceNo: string | null;
  proformaInvoiceDate: string | null;
  printedOn: string;
}

export interface GeneralPoPrintReportLine {
  refNo: string;
  itemCode: string;
  description: string;
  unit: string;
  orderedQuantity: number;
  price: number;
  expectedDate: string | null;
}

export interface GeneralPoPrintReportDetails {
  header: GeneralPoPrintReportHeader;
  lines: GeneralPoPrintReportLine[];
}
