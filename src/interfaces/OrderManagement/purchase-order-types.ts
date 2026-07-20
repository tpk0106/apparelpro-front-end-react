export interface POHeaderState {
  isNewPurchaseOrder: boolean;
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
  // True for a brand-new P/O (backend assigns the real PurchaseNumber on
  // save); false when editing an existing one (PurchaseNumber below must
  // already exist).
  isNewPurchaseOrder: boolean;
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

// Response shape from POST api/supplier-po/save-supplier-po - the backend
// now allocates the real PurchaseNumber server-side for new P/Os, so the
// caller must read it back from here rather than trusting request state.
export interface CommitSupplierPurchaseOrderResult {
  success: boolean;
  purchaseNumber: string;
}

export interface SupplierPOFormInputs {
  refNo: string;
  orderUnit: string;
  orderQuantity: string; // Kept as string for smooth numeric text typing handles
  unitPrice: string;
  exportDate: string;
  lcNo: string;
}
