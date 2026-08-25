// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory.GeneralGtnPrintHeaderAPIModel /
// GeneralGtnPrintLineAPIModel / GeneralGtnPrintDetailsAPIModel exactly.

export interface GeneralGtnPrintReportHeader {
  gtnNumber: string;
  fromStoreCode: string;
  fromStoreDescription: string;
  toStoreCode: string;
  toStoreDescription: string;
  transactionDate: string; // ISO date string
  printedOn: string; // ISO date-time string
}

export interface GeneralGtnPrintReportLine {
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
}

export interface GeneralGtnPrintReportDetails {
  header: GeneralGtnPrintReportHeader;
  lines: GeneralGtnPrintReportLine[];
}
