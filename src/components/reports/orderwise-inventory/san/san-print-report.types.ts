// Mirrors ApparelPro.WebApi.APIModels.OrderwiseInventory.SanPrintHeaderAPIModel /
// SanPrintLineAPIModel / SanPrintDetailsAPIModel exactly - same convention as
// gin-print-report.types.ts. ASP.NET Core's default JSON policy lowercases the
// first letter of each C# PascalCase property, so SanNumber -> sanNumber, etc.

export interface SanPrintReportHeader {
  sanNumber: string;
  buyerCode: number;
  buyerName: string;
  order: string;
  transactionDate: string; // ISO date string
  // Legacy always prints the current system date/time on every print run, not
  // the original transaction date - same convention as STRN/GIN's own print.
  printedOn: string; // ISO date-time string
}

export interface SanPrintReportLine {
  itemCode: string;
  description: string;
  unit: string;
  // The physical count entered during the stock take - SAN SETS QtyInHand to this
  // value rather than adding/subtracting a movement, unlike every other note type.
  adjustedQuantity: number;
  // Legacy column label is "Basis" (store_cd) - kept as storeCode to avoid
  // colliding with the unrelated Basis/GarmentType costing concept elsewhere
  // in the system, same convention as STRN/GIN's own print.
  storeCode: string;
}

export interface SanPrintReportDetails {
  header: SanPrintReportHeader;
  lines: SanPrintReportLine[];
}
