// Mirrors ApparelPro.WebApi.Reports.Models.ShipmentStatusReportAPIModel (and its nested
// classes) exactly. ASP.NET Core's default JSON policy lowercases the first letter of
// each C# PascalCase property, so BuyerCode -> buyerCode, etc.
//
// Backed by ShipmentStatusReportController (api/shipment-status-report/details, /pdf),
// which replicates OD_SHPST.PRG's "SHIPMENT STATUS REPORT" - cross-references the
// planned shipment schedule against what has actually been invoiced/shipped. Buyer and
// Order are both mandatory, matching the legacy screen's own "empty -> exit" checks.

export interface ShipmentStatusReportScopeContext {
  buyerCode: number;
  order: string;
}

export interface ShipmentStatusInvoiceLine {
  quantityShipped: number;
  invoiceDate: string | null; // ISO date string (nullable on the wire)
  invoiceNumber: string;
}

export interface ShipmentStatusRow {
  typeCode: number;
  typeName: string;
  styleCode: string;
  shipmentOrderNo: string;
  unit: string;
  destinationCode: string;
  invoiceLines: ShipmentStatusInvoiceLine[];
  totalQuantityShipped: number;
  balanceToShip: number;
}

export interface ShipmentStatusReport {
  buyerCode: number;
  buyerName: string;
  order: string;
  rows: ShipmentStatusRow[];
}
