// Mirrors ApparelPro.WebApi.Reports.Models.ColorSizeReportAPIModel (and its nested
// classes) exactly. ASP.NET Core's default JSON policy lowercases the first letter of
// each C# PascalCase property, so BuyerCode -> buyerCode, etc. Dictionary<string,
// decimal> properties serialize as plain JSON objects keyed by Size code.
//
// Backed by ColorSizeReportController (api/color-size-report/details, /pdf), which
// replicates OD_CLSZ3.PRG's "COLOUR / SIZE DETAILS" report. See
// ColorSizeReportServiceModel's SCOPE NOTE on the backend for how legacy's od_clqr
// query is derived from ColorSizeDetails rather than a separate table.

export interface ColorSizeReportScopeContext {
  buyerCode: number;
  order: string;
}

export interface ColorSizeReportColour {
  colorCode: string;
  description: string;
  // Keyed by Size code (matches ColorSizeReport.sizeColumns) - a Size with no
  // Colour/Size Details row for this Colour is simply absent from the object.
  sizeQuantities: Record<string, number>;
  totalQuantity: number;
}

export interface ColorSizeReportStyle {
  styleCode: string;
  colours: ColorSizeReportColour[];
  sizeTotals: Record<string, number>;
  grandTotal: number;
}

export interface ColorSizeReport {
  buyerCode: number;
  buyerName: string;
  order: string;
  // Fixed column set for every Style block, in the same order the backend produced
  // them (ordinal string sort, matching legacy's raw-character index sort).
  sizeColumns: string[];
  styles: ColorSizeReportStyle[];
}
