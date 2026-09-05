// Mirrors ApparelPro.WebApi.APIModels.OrderwiseInventory.SrnPrintHeaderAPIModel /
// SrnPrintLineAPIModel / SrnPrintDetailsAPIModel exactly - same convention as
// gin-print-report.types.ts. This is the SUPPLIER Return Note (SRN, transaction
// type "7S") - not to be confused with the Stores Requisition Note (STRN,
// transaction type "0S") which lives in the sibling strn/ folder. ASP.NET Core's
// default JSON policy lowercases the first letter of each C# PascalCase
// property, so SrnNumber -> srnNumber, etc.

export interface SrnPrintReportHeader {
  srnNumber: string;
  buyerCode: number;
  buyerName: string;
  order: string;
  supplierCode: number;
  supplierName: string;
  transactionDate: string; // ISO date string
  // Legacy always prints the current system date/time on every print run, not
  // the original transaction date - same convention as STRN/GIN's own print.
  printedOn: string; // ISO date-time string
}

export interface SrnPrintReportLine {
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
  // Legacy column label is "Basis" (store_cd) - kept as storeCode to avoid
  // colliding with the unrelated Basis/GarmentType costing concept elsewhere
  // in the system, same convention as STRN/GIN's own print.
  storeCode: string;
}

export interface SrnPrintReportDetails {
  header: SrnPrintReportHeader;
  lines: SrnPrintReportLine[];
}
