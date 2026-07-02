export interface POHeaderState {
  purchaseNumber: string;
  supplierCode: string;
  storeCode: string;
  proformaInvoiceNo: string;
  proformaInvoiceDate: string;
  currencyCode: string;
}

export interface AvailableBudgetLine {
  itemCode: string;
  itemUnit: string;
  balanceQuantity: number;
  typeCode: number;
  styleCode: string;
  description: string;
  feature1: string;
  feature2: string;
  feature3: string;
  feature4: string;
}

export interface PODetailItemRow {
  id?: number;
  poNo: string;
  buyer: number;
  order: string;
  type: number;
  style: string;
  itemCode: string;
  refNo: string;
  orderUnit: string;
  orderQuantity: number;
  unitPrice: number;
  exportDate: string;
  lcNo: string;
  balance: number;
}

export interface SupplierLookupOption {
  supplierCode: number;
  name: string;
}

export interface StoreCodeOption {
  code: string;
  description: string;
}

export interface CurrencyOption {
  code: string;
  description: string;
}

export interface SelectedPOContext {
  purchaseNumber: string;
  supplierCode: string;
  // FIXED: Explicitly added both missing property identifiers to pass the compiler!
  typeCode: number; // Tracks the independent garment type integer code
  styleCode: string; // Tracks the string tracking reference name of the garment

  storeCode: string;
  proformaInvoiceNo: string;
  proformaInvoiceDate: string;
  currencyCode: string;
  buyerCode: number;
  orderNumber: string;
}

export interface HeaderSelectorProps {
  // Callback function to broadcast the completed, verified PO context up to the workspace
  onHeaderContextLock: (context: SelectedPOContext | null) => void;
}

export interface SupplierPOFormInputs {
  refNo: string;
  orderUnit: string;
  orderQuantity: string; // Kept as string for smooth numeric text typing handles
  unitPrice: string;
  exportDate: string;
  lcNo: string;
}
