// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory.GeneralStrnPrintHeaderAPIModel /
// GeneralStrnPrintLineAPIModel / GeneralStrnPrintDetailsAPIModel exactly.

export interface GeneralStrnPrintReportHeader {
  srnNumber: string;
  storeCode: string;
  storeDescription: string;
  departmentCode: string;
  transactionDate: string; // ISO date string
  printedOn: string; // ISO date-time string
}

export interface GeneralStrnPrintReportLine {
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
}

export interface GeneralStrnPrintReportDetails {
  header: GeneralStrnPrintReportHeader;
  lines: GeneralStrnPrintReportLine[];
}
