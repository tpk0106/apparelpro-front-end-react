export interface SubContractRow {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  subContractorCode: string;
  subContractorName: string;
  subQuantity: number;
  costPerGarment: number;
  currency: string;
  unit: string;
  receivedQuantity: number;
  balanceQuantity: number;
}

export interface SaveSubContractPayload {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  subContractorCode: string;
  subQuantity: number;
  costPerGarment: number;
  currency: string;
  unit: string;
  receivedQuantity: number;
}

export interface SaveSubContractResult {
  subContract: SubContractRow;
  quantityWarning: string | null;
}
