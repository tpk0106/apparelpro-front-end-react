// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory.GeneralStockStatusReport* exactly.
// ASP.NET Core's default JSON policy lowercases the first letter of each C#
// PascalCase property.

export interface GeneralStockStatusReportHeader {
  storeCode: string;
  storeDescription: string;
  month: number;
  year: number;
  totalLineItems: number;
}

export interface GeneralStockStatusReportLine {
  itemCode: string;
  description: string;
  unit: string;

  broughtForwardBalance: number;
  totalGrns: number;
  totalGins: number;
  totalGtnsIn: number;
  totalGtnsOut: number;
  totalRtns: number;
  totalSrns: number;
  totalDgns: number;
  lastSan: number | null;
  carriedForwardBalance: number;
}
