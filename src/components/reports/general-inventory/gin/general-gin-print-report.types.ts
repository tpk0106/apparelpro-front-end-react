// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory.GeneralGinPrintHeaderAPIModel /
// GeneralGinPrintLineAPIModel / GeneralGinPrintDetailsAPIModel exactly.

export interface GeneralGinPrintReportHeader {
  ginNumber: string;
  storeCode: string;
  storeDescription: string;
  departmentCode: string;
  transactionDate: string; // ISO date string
  printedOn: string; // ISO date-time string
}

export interface GeneralGinPrintReportLine {
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
}

export interface GeneralGinPrintReportDetails {
  header: GeneralGinPrintReportHeader;
  lines: GeneralGinPrintReportLine[];
}
