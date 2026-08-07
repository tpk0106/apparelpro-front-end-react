// Mirrors ApparelPro.WebApi.Reports.Models.TrimSheetReportAPIModel (and its nested
// classes) exactly. ASP.NET Core's default JSON policy lowercases the first letter of
// each C# PascalCase property, so BuyerCode -> buyerCode, etc.
//
// Backed by TrimSheetReportController (api/trim-sheet-report/details, /pdf), which
// replicates OD_TRIM.PRG - see TrimSheetReportServiceModel's SCOPE NOTE on the backend
// for what's intentionally not covered yet (Sub Contract / Production Line costs).

export interface TrimSheetReportScopeContext {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
}

export interface TrimSheetReportLine {
  stockCode: string;
  stockDescription: string;
  itemCode: string;
  description: string;
  feature1: string;
  feature2: string;
  feature3: string;
  feature4: string;

  // When false, legacy printed "** Ignored **" instead of a per-garment consumption
  // figure - this line's totalConsumption was entered directly rather than derived
  // from quantityPerGarment.
  isConsumptionCalculated: boolean;
  quantityPerGarment: number;
  consumptionUnit: string;

  totalConsumption: number;
  itemUnit: string;

  // Unit price converted into the report's currencyCode.
  convertedUnitPrice: number;
  // totalConsumption * convertedUnitPrice.
  value: number;

  supplierCode: string;
  supplierName: string;
}

// One per distinct stockCode, in the same order the lines first appear.
export interface TrimSheetReportStockGroup {
  stockCode: string;
  stockDescription: string;
  subtotalValue: number;
  costPerGarment: number;
  percentageOfUnitPrice: number;
}

export interface TrimSheetReportSupplierTotal {
  supplierCode: string;
  supplierName: string;
  totalValue: number;
}

// Present only when the caller is in one of the profit-visibility roles (Merchandiser
// Manager, Merchandising Manager, Executive Director) - mirrors legacy's
// access('trimprof') gate. The backend decides whether to compute/send this at all,
// so a missing value here means "not visible to you", not "not yet loaded".
export interface TrimSheetReportProfit {
  unitPricePerGarment: number;
  costPerGarment: number;
  costPercentageOfUnitPrice: number;
  estimatedProfitPerGarment: number;
  estimatedProfitPercentage: number;
}

// Present only when the style has already been Trim Sheet approved.
export interface TrimSheetReportApprovalStamp {
  approvedByUserId: string;
  approvedDate: string; // ISO date string (DateOnly on the wire)
}

export interface TrimSheetReportDetails {
  buyerCode: number;
  // Resolved server-side (2026-08-07) - same "code + name" pattern already used by
  // basisCode/basisDescription below.
  buyerName: string;
  order: string;
  typeCode: number;
  typeName: string;
  styleCode: string;

  unit: string;
  styleQuantity: number;
  unitPrice: number;
  basisCode: string;
  basisDescription: string;
  currencyCode: string;

  lines: TrimSheetReportLine[];
  stockGroupSubtotals: TrimSheetReportStockGroup[];
  supplierTotals: TrimSheetReportSupplierTotal[];

  // Material-only total today - Sub Contract / Production Line costs are not yet
  // migrated (see subContractSectionAvailable / productionLineSectionAvailable below).
  grandTotalValue: number;

  subContractSectionAvailable: boolean;
  productionLineSectionAvailable: boolean;

  profit: TrimSheetReportProfit | null;
  approvalStamp: TrimSheetReportApprovalStamp | null;
}
