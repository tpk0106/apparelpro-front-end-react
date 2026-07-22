// Mirrors ApparelPro.WebApi.APIModels.OrderwiseInventory.StrnPrintHeaderAPIModel /
// StrnPrintLineAPIModel / StrnPrintDetailsAPIModel exactly. ASP.NET Core's default JSON
// policy lowercases the first letter of each C# PascalCase property, so StrnNumber ->
// strnNumber, etc. No DTO layer needed on the frontend beyond these interfaces.

export interface StrnPrintReportHeader {
  strnNumber: string;
  buyerCode: number;
  order: string;
  departmentCode: string;
  transactionDate: string; // ISO date string
  // Legacy in_strn2.prg always prints the current system date/time on every print
  // run (via inv_head), not the original transaction date — reprinting later shows
  // "now", not "when committed".
  printedOn: string; // ISO date-time string
}

export interface StrnPrintReportLine {
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
  // Legacy column label was "Basis" (store_cd) — kept as storeCode to avoid
  // colliding with the unrelated Basis/GarmentType costing concept elsewhere
  // in the system.
  storeCode: string;
}

export interface StrnPrintReportDetails {
  header: StrnPrintReportHeader;
  lines: StrnPrintReportLine[];
}
