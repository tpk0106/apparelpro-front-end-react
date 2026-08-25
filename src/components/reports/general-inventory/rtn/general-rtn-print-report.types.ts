// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory.GeneralRtnPrintHeaderAPIModel /
// GeneralRtnPrintLineAPIModel / GeneralRtnPrintDetailsAPIModel exactly.

export interface GeneralRtnPrintReportHeader {
  rtnNumber: string;
  departmentCode: string;
  departmentName: string;
  storeCode: string;
  storeDescription: string;
  transactionDate: string; // ISO date string
  printedOn: string; // ISO date-time string
}

export interface GeneralRtnPrintReportLine {
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
}

export interface GeneralRtnPrintReportDetails {
  header: GeneralRtnPrintReportHeader;
  lines: GeneralRtnPrintReportLine[];
}
