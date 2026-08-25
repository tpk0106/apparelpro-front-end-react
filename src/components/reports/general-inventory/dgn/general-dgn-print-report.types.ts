// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory.GeneralDgnPrintHeaderAPIModel /
// GeneralDgnPrintLineAPIModel / GeneralDgnPrintDetailsAPIModel exactly.

export interface GeneralDgnPrintReportHeader {
  dgnNumber: string;
  storeCode: string;
  storeDescription: string;
  transactionDate: string; // ISO date string
  printedOn: string; // ISO date-time string
}

export interface GeneralDgnPrintReportLine {
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
}

export interface GeneralDgnPrintReportDetails {
  header: GeneralDgnPrintReportHeader;
  lines: GeneralDgnPrintReportLine[];
}
