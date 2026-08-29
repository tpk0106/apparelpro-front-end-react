// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory.GeneralSanPrintHeaderAPIModel /
// GeneralSanPrintLineAPIModel / GeneralSanPrintDetailsAPIModel exactly.

export interface GeneralSanPrintReportHeader {
  sanNumber: string;
  storeCode: string;
  storeDescription: string;
  transactionDate: string; // ISO date string
  printedOn: string; // ISO date-time string
}

export interface GeneralSanPrintReportLine {
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
}

export interface GeneralSanPrintReportDetails {
  header: GeneralSanPrintReportHeader;
  lines: GeneralSanPrintReportLine[];
}
