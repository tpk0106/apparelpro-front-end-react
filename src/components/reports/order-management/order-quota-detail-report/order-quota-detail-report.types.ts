// Mirrors ApparelPro.WebApi.Reports.Models.OrderQuotaDetailReportAPIModel exactly.
// Backed by OrderQuotaDetailReportController (api/order-quota-detail-report/details,
// /pdf), which replicates OD_ROQ1.PRG's "ORDER QUOTA REPORT". Buyer and Order are both
// optional filters - omitting both lists every order quota entry.

export interface OrderQuotaDetailReportScopeContext {
  buyerCode: number | null;
  order: string | null;
}

export interface OrderQuotaDetailRow {
  buyerCode: number;
  buyerName: string;
  order: string;
  typeCode: number;
  typeName: string;
  styleCode: string;
  shipmentOrderNo: string;
  quotaStatus: string; // 'Q' = Quota, 'N' = Non-Quota
  fromYearMonth: string;
  toYearMonth: string;
  quotaCategory: string;
  quotaType: string;
  unit: string;
  quantity: number;
}

export interface OrderQuotaDetailReport {
  buyerCode: number | null;
  order: string | null;
  rows: OrderQuotaDetailRow[];
}
