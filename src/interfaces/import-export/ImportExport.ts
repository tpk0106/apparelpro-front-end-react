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

export interface CertificateOfOriginHeader {
  invoiceNumber: string;
  refNo: string;
  companyAddressId: number;
  countryOfOrigin: string;
  portOfLoading?: string | null;
  otherRemarks?: string | null;
  competentAuthorityName?: string | null;
  issuePlace?: string | null;
  issueDate?: string | null;
  requestSubmittedBy?: string | null;
}

export interface CertificateOfOriginLine {
  id: number;
  invoiceNumber: string;
  itemNo: number;
  shippingMarks: string;
  packageTypeQuantity: string;
  itemName: string;
  hsCode: string;
  nettWeight: number;
  grossWeight: number;
}

export interface CertificateOfOriginDetail {
  header: CertificateOfOriginHeader;
  lines: CertificateOfOriginLine[];
}

export interface LetterOfCreditHeader {
  bankCode: string;
  lcNo: string;
  creditNo?: string | null;
  expiryDate?: string | null;
  expiryPlaceCode?: string | null;
  openingDate?: string | null;
  beneficiaryCode?: number | null;
  issuedBy?: string | null;
  notifyPartyCode?: string | null;
  licenceType?: string | null;
  licenceNo?: string | null;
  transferableCredit?: string | null;
  confirmedCredit?: string | null;
  partShipment?: string | null;
  transhipment?: string | null;
  insuranceCoverage?: string | null;
  shipmentTerm?: string | null;
  shipmentTermOther?: string | null;
  billOfLadingIssued?: string | null;
  freightPayment?: string | null;
  airwayDocumentType?: string | null;
  additionalConditions?: string | null;
  extraConditions?: string | null;
  creditBy?: string | null;
  beneficiaryDraft?: string | null;
  insuranceClause?: string | null;
  countryOfOriginCode?: string | null;
  shipmentFromCode?: string | null;
  transportTo?: string | null;
  insurancePercent?: number | null;
  insuranceValueCurrency?: string | null;
  certifiedMailCopies?: string | null;
  documentPresentationDays?: string | null;
  shipmentTermCustomLabel?: string | null;
  accountNo?: string | null;
  branch?: string | null;
  creditAvailableWith?: string | null;
  creditDocuments?: string | null;
  conformityWith?: string | null;
  insuranceRemarks?: string | null;
  tenorDays?: string | null;
  drawnOn?: string | null;
  ciCopies?: string | null;
  tenorDate?: string | null;
  notLaterThanDate?: string | null;
  beneficiaryCountryCode?: string | null;
  advisingBankCode?: string | null;
  invoiceSelection?: string | null;
  packingSpecification?: string | null;
  marineBillOfLading?: string | null;
  marineBillOfLadingConsignee?: string | null;
  airWaybill?: string | null;
  airWaybillConsignee?: string | null;
  otherDocuments?: string | null;
  bankSentTo?: string | null;
  importPermitNo?: string | null;
  importContractNo?: string | null;
  incomeTaxNo?: string | null;
  bttReferenceNo?: string | null;
  importValidityDate?: string | null;
}

export interface LetterOfCreditLine {
  id: number;
  bankCode: string;
  lcNo: string;
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
  currency: string;
  unitPrice: number;
  btnNo?: string | null;
}

export interface LetterOfCreditDetail {
  header: LetterOfCreditHeader;
  lines: LetterOfCreditLine[];
}

export interface LetterOfCreditCoveringLetter {
  bankCode: string;
  lcNo: string;
  letterDate?: string | null;
  exportLcNo?: string | null;
  value?: string | null;
  item1?: string | null;
  item2?: string | null;
  box1Selected: boolean;
  box2Selected: boolean;
  attn1?: string | null;
  box3Selected: boolean;
  attn2?: string | null;
  box4Selected: boolean;
  sampleLcNo?: string | null;
  box5Selected: boolean;
  box6Selected: boolean;
  box7Selected: boolean;
  percentage?: number | null;
  box8Line1?: string | null;
  box8Line2?: string | null;
  box9Line1?: string | null;
  box9Line2?: string | null;
  box10Line1?: string | null;
  box10Line2?: string | null;
}
