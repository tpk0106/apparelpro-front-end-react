// Mirrors ApparelPro.WebApi.Reports.Models.OrderDetailReportAPIModel (and its nested
// classes) exactly. ASP.NET Core's default JSON policy lowercases the first letter of
// each C# PascalCase property, so BuyerCode -> buyerCode, etc.
//
// Backed by OrderDetailReportController (api/order-detail-report/details, /pdf), which
// replicates OD_RPO1.PRG's "ORDER CONFIRMATION REPORT" scoped to the "Buyer+Order given,
// Type blank" case (legacy's prn_for1 branch) - one printout per Buyer+Order listing
// every Style under it expanded into its Part-Shipment lines. See
// OrderDetailReportServiceModel's SCOPE NOTE on the backend for the two legacy fields
// with no modern equivalent (order Description; resolved Destination description).

export interface OrderDetailReportScopeContext {
  buyerCode: number;
  order: string;
}

export interface OrderDetailPartShipment {
  newOrder: string;
  destinationCode: string;
  shipDate: string; // ISO date string (DateOnly on the wire)
  unit: string;
  quantity: number;
  value: number;
}

export interface OrderDetailStyle {
  typeCode: number;
  typeName: string;
  styleCode: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  partShipments: OrderDetailPartShipment[];
  totalQuantity: number;
  totalValue: number;
}

export interface OrderDetailReport {
  buyerCode: number;
  buyerName: string;
  order: string;
  orderDate: string; // ISO date string (DateOnly on the wire)
  unit: string;
  currencyCode: string;
  styles: OrderDetailStyle[];
  grandTotalValue: number;
}
