export interface CompanyAddress {
  id: number;
  addressNo: number;
  companyName: string;
  address1: string;
  address2: string;
  city: string;
  postCode: string;
  country: string;
  telNos: string;
  faxNos: string;
  tinNo: string;
  exportRegNo: string;
}

export interface CommercialInvoiceLine {
  id: number;
  invoiceNumber: string;
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  newOrder: string;
  unit: string;
  quantity: number;
  balance: number;
  quotaCategory: string;
  fromYearMonth: string;
  toYearMonth: string;
  quotaCountry: string;
  packingMedia: string;
}

export interface CommercialInvoiceHeader {
  invoiceNumber: string;
  invoiceDate: string;
  buyerCode: number;
  documentaryBuyerCode?: string | null;
  notifyPartyCode?: string | null;
  consigneeCode?: string | null;
  loadPortCode?: string | null;
  destinationCode?: string | null;
  continuingDestinationCode?: string | null;
  carrierCode?: string | null;
  shipDate?: string | null;
  lcNumber?: string | null;
  lcDate?: string | null;
  assessmentNumber?: string | null;
  issuingBankCode?: string | null;
  remark1?: string | null;
  remark2?: string | null;
  remark3?: string | null;
  detail?: string | null;
  currencyCode?: string | null;
  tradeTermCode?: string | null;
  tradeTermLine1?: string | null;
  tradeTermLine2?: string | null;
  tradeTermLine3?: string | null;
}

export interface CommercialInvoiceDetail {
  header: CommercialInvoiceHeader;
  lines: CommercialInvoiceLine[];
}
