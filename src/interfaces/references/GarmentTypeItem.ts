export interface GarmentTypeItem {
  id: number;
  garmentTypeId: number;
  garmentTypeName: string;
  stockCode: string;
  itemCode: string;
  itemDescription: string;
  unit: string;
  quantity: number;
}

export interface SaveGarmentTypeItemPayload {
  garmentTypeId: number;
  stockCode: string;
  itemCode: string;
  unit: string;
  quantity: number;
}
