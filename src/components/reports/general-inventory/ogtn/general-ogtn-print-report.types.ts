// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory.OrderGtnPrintHeaderAPIModel /
// OrderGtnPrintLineAPIModel / OrderGtnPrintDetailsAPIModel exactly.

export interface OrderGtnPrintReportHeader {
  ogtnNumber: string;
  direction: string;
  buyerCode: number;
  buyerName: string;
  order: string;
  transactionDate: string; // ISO date string
  printedOn: string; // ISO date-time string
}

export interface OrderGtnPrintReportLine {
  storeCode: string;
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
}

export interface OrderGtnPrintReportDetails {
  header: OrderGtnPrintReportHeader;
  lines: OrderGtnPrintReportLine[];
}
