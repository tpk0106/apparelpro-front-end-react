// Mirrors ApparelPro.WebApi.APIModels.OrderwiseInventory.ArnPrintHeaderAPIModel /
// ArnPrintLineAPIModel / ArnPrintDetailsAPIModel exactly.

export interface ArnPrintReportHeader {
  arnNumber: string;
  storeCode: string;
  invoiceNumber: string | null;
  subContractorCode: string;
  currency: string;
  transactionDate: string; // ISO date string
  totalValue: number;
  printedOn: string; // ISO date-time string
}

export interface ArnPrintReportLine {
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  value: number;
  balanceToReceive: number;
  buyerCode: number;
  order: string;
}

export interface ArnPrintReportDetails {
  header: ArnPrintReportHeader;
  lines: ArnPrintReportLine[];
}
