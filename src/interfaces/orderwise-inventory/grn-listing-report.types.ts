// Mirrors ApparelPro.WebApi.APIModels.OrderwiseInventory.GrnListingReport* exactly.

export interface GrnListingReportHeader {
  fromDate: string | null;
  toDate: string | null;
  buyerCode: number | null;
  order: string | null;
  storeCode: string | null;
  supplierName: string | null;
  totalTransactions: number;
  totalValue: number;
  totalValueCurrency: string | null;
}

export interface GrnListingReportLine {
  transactionDate: string;
  grnNumber: string;
  invoiceNumber: string | null;
  poNumber: string | null;
  lcNumber: string | null;
  storeCode: string;
  itemCode: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  value: number;
  currency: string;
  supplierName: string;
  buyerCode: number;
  order: string;
}
