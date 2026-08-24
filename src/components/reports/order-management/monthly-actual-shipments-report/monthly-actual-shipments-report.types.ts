// Mirrors ApparelPro.WebApi.Reports.Models.MonthlyActualShipmentsReportAPIModel exactly.
// Backed by MonthlyActualShipmentsReportController (api/monthly-actual-shipments-report/details,
// /pdf), which replicates OD_ACTSP.PRG's "MONTHLY ACTUAL SHIPMENTS" report. Month and Year
// are both mandatory (legacy exits the screen if left blank) - same "scope lock" pattern as
// Cost of Production / Post Order Cost Sheet.

export interface MonthlyActualShipmentsReportScopeContext {
  month: number;
  year: number;
}

export interface MonthlyActualShipmentRow {
  invoiceNumber: string;
  buyerCode: number;
  buyerName: string;
  order: string;
  typeCode: number;
  typeName: string;
  orderNo: string;
  styleCode: string;
  shipDate: string;
  quantity: number;
  balance: number;
  value: number;
}

export interface MonthlyActualShipmentsReport {
  month: number;
  year: number;
  rows: MonthlyActualShipmentRow[];
}
