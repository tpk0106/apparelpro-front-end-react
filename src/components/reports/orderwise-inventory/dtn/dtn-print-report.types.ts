// Mirrors ApparelPro.WebApi.APIModels.OrderwiseInventory.DtnPrintHeaderAPIModel /
// DtnPrintLineAPIModel / DtnPrintDetailsAPIModel exactly - same convention as
// gtn-print-report.types.ts. ASP.NET Core's default JSON policy lowercases the
// first letter of each C# PascalCase property, so DtnNumber -> dtnNumber, etc.

export interface DtnPrintReportHeader {
  dtnNumber: string;
  fromBuyerCode: number;
  fromBuyerName: string;
  fromOrder: string;
  toBuyerCode: number;
  toBuyerName: string;
  toOrder: string;
  transactionDate: string; // ISO date string
  // Legacy always prints the current system date/time on every print run, not
  // the original transaction date - same convention as STRN/GIN's own print.
  printedOn: string; // ISO date-time string
}

export interface DtnPrintReportLine {
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
  // Legacy column label is "Basis" (store_cd) - kept as storeCode to avoid
  // colliding with the unrelated Basis/GarmentType costing concept elsewhere
  // in the system, same convention as STRN/GIN's own print.
  storeCode: string;
}

export interface DtnPrintReportDetails {
  header: DtnPrintReportHeader;
  lines: DtnPrintReportLine[];
}
