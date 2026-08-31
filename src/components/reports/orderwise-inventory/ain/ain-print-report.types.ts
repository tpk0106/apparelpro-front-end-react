// Mirrors ApparelPro.WebApi.APIModels.OrderwiseInventory.AinPrintHeaderAPIModel /
// AinPrintLineAPIModel / AinPrintDetailsAPIModel exactly.

export interface AinPrintReportHeader {
  ainNumber: string;
  buyerCode: number;
  buyerName: string;
  order: string;
  subContractorCode: string;
  additionalProcessCode: string;
  transactionDate: string; // ISO date string
  printedOn: string; // ISO date-time string
}

export interface AinPrintReportLine {
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
  storeCode: string;
}

export interface AinPrintReportDetails {
  header: AinPrintReportHeader;
  lines: AinPrintReportLine[];
}
