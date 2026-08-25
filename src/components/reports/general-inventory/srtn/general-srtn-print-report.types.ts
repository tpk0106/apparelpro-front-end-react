// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory.GeneralSrtnPrintHeaderAPIModel /
// GeneralSrtnPrintLineAPIModel / GeneralSrtnPrintDetailsAPIModel exactly.

export interface GeneralSrtnPrintReportHeader {
  srtnNumber: string;
  storeCode: string;
  storeDescription: string;
  supplierCode: number;
  supplierName: string;
  stockType: string;
  transactionDate: string; // ISO date string
  printedOn: string; // ISO date-time string
}

export interface GeneralSrtnPrintReportLine {
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
}

export interface GeneralSrtnPrintReportDetails {
  header: GeneralSrtnPrintReportHeader;
  lines: GeneralSrtnPrintReportLine[];
}
