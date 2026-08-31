// Mirrors ApparelPro.WebApi.APIModels.OrderwiseInventory.TransactionListReport* exactly.

export interface TransactionListReportHeader {
  fromDate: string;
  toDate: string;
  transactionType: string | null;
  transactionTypeName: string | null;
  itemCodePrefix: string | null;
  totalLineItems: number;
  totalValue: number;
  totalValueCurrency: string | null;
}

export interface TransactionListReportLine {
  transactionType: string;
  transactionTypeName: string;
  transactionDate: string;
  documentNumber: string;
  storeCode: string;
  itemCode: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
  value: number;
  currency: string;
  supplierName: string;
  buyerCode: number;
  order: string;
}
