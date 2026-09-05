// Mirrors ApparelPro.WebApi.APIModels.OrderwiseInventory.GrnPrintHeaderAPIModel /
// GrnPrintLineAPIModel / GrnPrintDetailsAPIModel exactly - same convention as
// gin-print-report.types.ts. ASP.NET Core's default JSON policy lowercases the
// first letter of each C# PascalCase property, so GrnNumber -> grnNumber, etc.

export interface GrnPrintReportHeader {
  grnNumber: string;
  buyerCode: number;
  buyerName: string;
  order: string;
  supplierCode: number | null;
  supplierName: string;
  poNumber: string;
  storeCode: string;
  transactionDate: string; // ISO date string
  // Legacy always prints the current system date/time on every print run, not
  // the original transaction date - same convention as STRN/GIN's own print.
  printedOn: string; // ISO date-time string
}

export interface GrnPrintReportLine {
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  value: number;
  currency: string;
}

export interface GrnPrintReportDetails {
  header: GrnPrintReportHeader;
  lines: GrnPrintReportLine[];
}
