// Mirrors ApparelPro.WebApi.APIModels.OrderwiseInventory.GinPrintHeaderAPIModel /
// GinPrintLineAPIModel / GinPrintDetailsAPIModel exactly - same convention as
// strn-print-report.types.ts. ASP.NET Core's default JSON policy lowercases the
// first letter of each C# PascalCase property, so GinNumber -> ginNumber, etc.

export interface GinPrintReportHeader {
  ginNumber: string;
  buyerCode: number;
  buyerName: string;
  order: string;
  departmentCode: string;
  // The STRN this GIN was issued against.
  sourceStrnNumber: string;
  transactionDate: string; // ISO date string
  // Legacy always prints the current system date/time on every print run, not
  // the original transaction date - same convention as STRN's own print.
  printedOn: string; // ISO date-time string
}

export interface GinPrintReportLine {
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
  // Legacy column label is "Basis" (store_cd) - kept as storeCode to avoid
  // colliding with the unrelated Basis/GarmentType costing concept elsewhere
  // in the system, same convention as STRN's own print.
  storeCode: string;
}

export interface GinPrintReportDetails {
  header: GinPrintReportHeader;
  lines: GinPrintReportLine[];
}
