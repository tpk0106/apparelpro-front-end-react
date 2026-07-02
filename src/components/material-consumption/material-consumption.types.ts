export interface OrderItem {
  stockCode: string;
  itemCode: string;
  description: string;
}

export interface OrderItemFeatureMetadata {
  stockCode: string;
  itemCode: string;
  feat1Label?: string; // e.g., "TY" -> "TYPE"
  feat2Label?: string; // e.g., "NH" -> "NO OF HOLES"
  feat3Label?: string;
  feat4Label?: string;
}

export interface ConsumptionFormState {
  feat1Value: string;
  feat2Value: string;
  feat3Value: string;
  feat4Value: string;
  garmentColor: string;
  garmentSize: string;
  consumptionUnit: string;
  quantityPerGarment: number;
  allowancePercentage: number;
  finalItemUnit: string;
  supplierCode: string;
  unitPrice: number;
  isCalculateMode: boolean;
}

export interface SelectedScopeContext {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  bulkQuantity: number;
  parentOrderUnit: string;
  currencyCode: string; // <-- ADD THIS FIELD TO YOUR SHAPING CONTRACT
}

// export interface SelectedScopeContext {
//   buyerCode: number;
//   order: string;
//   typeCode: number;
//   styleCode: string;
//   bulkQuantity: number;
//   parentOrderUnit: string;
// }

export interface BuyerOption {
  buyerCode: number;
  name: string;
}

export interface TypeOption {
  typeCode: number;
  typeName: string; // e.g., "MJKTS", "LJKTS"
}

export interface ScopeHeaderProps {
  onScopeChange: (context: SelectedScopeContext | null) => void;
}

// import type { Style } from "../../interfaces/OrderManagement/Style";

export interface GarmentTypeServiceModel {
  id: number;
  typeName: string;
}

export interface OrderItemServiceModel {
  stockCode: string;
  itemCode: string;
  description: string;
}

export interface ColorSizeDetailsServiceModel {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  color: string;
  size: string;
  ratio: number;
  qty: number;
}

export interface OrderItemFeatureServiceModel {
  stockCode: string;
  itemCode: string;
  feature1Type?: string;
  feature2Type?: string;
  feature3Type?: string;
  feature4Type?: string;
  costPerUnit?: number;
}

export interface ConsumptionCalculationParams {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  garmentColor?: string;
  garmentSize?: string;
  parentOrderUnit: string;
  consumptionUnit: string;
  finalItemUnit: string;
  quantityPerGarment: number;
  allowancePercentage: number;
}

export interface StyleContext {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  bulkQuantity: number;
  parentOrderUnit: string;
  currencyCode: string;
}

export interface MaterialSelection {
  stockCode: string;
  itemCode: string;
  description: string;
}

// Strictly types the local form baseline capture parameters
export interface FormInputs {
  feature1: string;
  feature2: string;
  feature3: string;
  feature4: string;
  garmentColor: string;
  garmentSize: string;
  consumptionUnit: string;
  quantityPerGarment: string; // Kept as string for smooth text field input typing
  allowancePercentage: string;
  finalItemUnit: string;
  supplierCode: string;
  unitPrice: string;
}
