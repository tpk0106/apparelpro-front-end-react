// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory.GeneralGrnPrintHeaderAPIModel /
// GeneralGrnPrintLineAPIModel / GeneralGrnPrintDetailsAPIModel exactly.

export interface GeneralGrnPrintReportHeader {
  grnNumber: string;
  poNumber: string;
  supplierCode: string;
  currencyCode: string;
  invoiceNumber: string | null;
  transactionDate: string; // ISO date string
  printedOn: string; // ISO date-time string
}

export interface GeneralGrnPrintReportLine {
  storeCode: string;
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
  price: number;
}

export interface GeneralGrnPrintReportDetails {
  header: GeneralGrnPrintReportHeader;
  lines: GeneralGrnPrintReportLine[];
}
