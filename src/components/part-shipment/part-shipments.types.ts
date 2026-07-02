export interface StyleShippingSummary {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  unit: string;
  totalContractQuantity: number;
  totalScheduledQuantity: number;
  remainingUnscheduledBalance: number;
}

export interface PartShipmentRow {
  id: number;
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  newOrder: string; // Split PO Shipping Reference
  destinationCode: string;
  shipDate: string; // ISO date format string
  subContractFlag: "Y" | "N";
  unit: string;
  quantity: number;
  shippingMode: "SEA" | "AIR";
  quotaCountry: string;
  quotaStatus: string;
  quotaCategory: string;
  quotaType: string;
  fromYearMonth: string;
  toYearMonth: string;
  balance: number;
}
