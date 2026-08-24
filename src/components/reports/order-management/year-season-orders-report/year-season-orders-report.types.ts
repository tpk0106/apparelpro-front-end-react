// Mirrors ApparelPro.WebApi.Reports.Models.YearSeasonOrdersReportAPIModel (and its nested
// classes) exactly. ASP.NET Core's default JSON policy lowercases the first letter of
// each C# PascalCase property, so BuyerCode -> buyerCode, etc.
//
// Backed by YearSeasonOrdersReportController (api/year-season-orders-report/details,
// /pdf), which replicates OD_RPO2.PRG's "ORDER CONFIRMATION REPORT" family. Year and
// Season are both optional filters - omitting both lists every order.

export interface YearSeasonOrdersReportScopeContext {
  year: number | null;
  season: string | null;
}

export interface YearSeasonOrderStyle {
  typeCode: number;
  typeName: string;
  styleCode: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
}

export interface YearSeasonOrderRow {
  buyerCode: number;
  buyerName: string;
  order: string;
  description: string | null;
  countryCode: string;
  unit: string;
  totalQuantity: number;
  currencyCode: string;
  seasonCode: string;
  seasonDescription: string;
  orderDate: string; // ISO date string (DateOnly on the wire)
  styles: YearSeasonOrderStyle[];
  grandTotalValue: number;
}

export interface YearSeasonOrdersReport {
  year: number | null;
  season: string | null;
  rows: YearSeasonOrderRow[];
}
