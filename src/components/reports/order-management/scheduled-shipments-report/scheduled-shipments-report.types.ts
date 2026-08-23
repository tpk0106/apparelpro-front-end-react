// Mirrors ApparelPro.WebApi.Reports.Models.ScheduledShipmentsReportAPIModel exactly.
// Backed by ScheduledShipmentsReportController (api/scheduled-shipments-report/details,
// /pdf), which replicates OD_RSHP1.PRG's "SCHEDULE SHIPMENT DETAIL REPORT". Buyer and
// Order are both optional filters - omitting both lists every scheduled shipment.

export interface ScheduledShipmentsReportScopeContext {
  buyerCode: number | null;
  order: string | null;
}

export interface ScheduledShipmentRow {
  buyerCode: number;
  buyerName: string;
  order: string;
  typeCode: number;
  styleCode: string;
  shipmentOrderNo: string;
  unit: string;
  quantity: number;
  // Raw code only - no display name available (a known schema gap, see the Order
  // Management specification's data-integrity notes on Destination).
  destinationCode: string;
  shipDate: string;
}

export interface ScheduledShipmentsReport {
  buyerCode: number | null;
  order: string | null;
  rows: ScheduledShipmentRow[];
}
