import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type {
  ConsumptionCalculationParams,
  ConsumptionEntryPayload,
  CopyMaterialsFromStylePayload,
  CopyMaterialsFromStyleResult,
  MaterialCatalogGroup,
  OrderItemServiceModel,
  StyleMaterialConsumptionLedgerRow,
} from "../../components/material-consumption/material-consumption.types";

export interface FeatureHeadersLookup {
  stockCode: string;
  itemCode: string;
  feature1?: string;
  feature2?: string;
  feature3?: string;
  feature4?: string;
  costPerUnit?: number;
}

const loadDynamicFeatureHeaders = async (params: {
  stockCode: string;
  itemCode: string;
}) => {
  return await client.get<FeatureHeadersLookup>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.MATERIAL_CONSUMPTION
      .GET_DYNAMIC_FEATURE_HEADERS,
    { params },
  );
};

const calculateConsumption = async (params: ConsumptionCalculationParams) => {
  return await client.get<number>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.MATERIAL_CONSUMPTION
      .CALCULATE_CONSUMPTION,
    { params },
  );
};

const saveConsumptionEntry = async (payload: ConsumptionEntryPayload) => {
  return await client.post<boolean>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.MATERIAL_CONSUMPTION.SAVE_ENTRY,
    payload,
  );
};

const deleteConsumptionEntry = async (params: {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  stockCode: string;
  itemCode: string;
  color: string;
  size: string;
}) => {
  return await client.delete<boolean>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.MATERIAL_CONSUMPTION.DELETE_ENTRY,
    {
      params: {
        buyerCode: params.buyerCode,
        order: params.order.trim(),
        typeCode: params.typeCode,
        styleCode: params.styleCode.trim(),
        stockCode: params.stockCode.trim(),
        itemCode: params.itemCode.trim(),
        // Send the trimmed value as-is, including an empty string for a
        // blank/universal Color or Size -- a saved row's blank Color/Size is
        // stored as "" (see consumption-entry-form.component.tsx's save
        // payload), never the literal text "EMPTY", so substituting that
        // sentinel here made the backend's Color/Size match never find the
        // row: DeleteConsumptionEntryAsync returned true on its "already
        // deleted" branch, showing a false success toast while deleting
        // nothing.
        color: params.color.trim(),
        size: params.size.trim(),
      },
    },
  );
};

const loadAvailableMaterials = async (params: {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
}) => {
  return await client.get<OrderItemServiceModel[]>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.MATERIAL_CONSUMPTION
      .GET_AVAILABLE_MATERIALS,
    { params },
  );
};

const loadMaterialCatalog = async () => {
  return await client.get<MaterialCatalogGroup[]>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.MATERIAL_CONSUMPTION
      .GET_MATERIAL_CATALOG,
  );
};

const loadLedgerBreakdownByStyle = async (params: {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
}) => {
  return await client.get<StyleMaterialConsumptionLedgerRow[]>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.MATERIAL_CONSUMPTION
      .GET_ALL_MATERIAL_CONSUMPTIONS_BY_STYLE,
    { params },
  );
};

const copyMaterialsFromStyle = async (
  payload: CopyMaterialsFromStylePayload,
) => {
  return await client.post<CopyMaterialsFromStyleResult>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.MATERIAL_CONSUMPTION.COPY_FROM_STYLE,
    payload,
  );
};

export {
  loadDynamicFeatureHeaders,
  calculateConsumption,
  saveConsumptionEntry,
  deleteConsumptionEntry,
  loadAvailableMaterials,
  loadMaterialCatalog,
  loadLedgerBreakdownByStyle,
  copyMaterialsFromStyle,
};
