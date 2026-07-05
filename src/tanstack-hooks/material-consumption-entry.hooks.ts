import {
  useMutation,
  useQuery,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  loadDynamicFeatureHeaders,
  calculateConsumption,
  saveConsumptionEntry,
  deleteConsumptionEntry,
  loadAvailableMaterials,
  loadLedgerBreakdownByStyle,
  type FeatureHeadersLookup,
} from "../services/material-consumption-entry.service";
import type {
  ConsumptionCalculationParams,
  ConsumptionEntryPayload,
  OrderItemServiceModel,
  StyleMaterialConsumptionLedgerRow,
} from "../components/material-consumption/material-consumption.types";

export const useGetDynamicFeatureHeaders = (params: {
  stockCode: string;
  itemCode: string;
}): UseQueryResult<FeatureHeadersLookup, AppError> => {
  return useQuery<FeatureHeadersLookup, AppError>({
    queryKey: ["dynamicFeatureHeaders", params.stockCode, params.itemCode],
    queryFn: async () => {
      const response: AxiosResponse<FeatureHeadersLookup> =
        await loadDynamicFeatureHeaders(params);
      return response.data;
    },
  });
};

// Imperative trigger (replaces useLazyCalculateConsumptionQuery)
export const useCalculateConsumptionMutation = (): UseMutationResult<
  number,
  AppError,
  ConsumptionCalculationParams
> => {
  return useMutation<number, AppError, ConsumptionCalculationParams>({
    mutationFn: async (params) => {
      const response: AxiosResponse<number> =
        await calculateConsumption(params);
      return response.data;
    },
  });
};

export const useSaveConsumptionEntryMutation = (): UseMutationResult<
  boolean,
  AppError,
  ConsumptionEntryPayload
> => {
  return useMutation<boolean, AppError, ConsumptionEntryPayload>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<boolean> =
        await saveConsumptionEntry(payload);
      return response.data;
    },
  });
};

export const useDeleteConsumptionEntryMutation = (): UseMutationResult<
  boolean,
  AppError,
  {
    buyerCode: number;
    order: string;
    typeCode: number;
    styleCode: string;
    stockCode: string;
    itemCode: string;
    color: string;
    size: string;
  }
> => {
  return useMutation<
    boolean,
    AppError,
    {
      buyerCode: number;
      order: string;
      typeCode: number;
      styleCode: string;
      stockCode: string;
      itemCode: string;
      color: string;
      size: string;
    }
  >({
    mutationFn: async (params) => {
      const response: AxiosResponse<boolean> =
        await deleteConsumptionEntry(params);
      return response.data;
    },
  });
};

export const useGetAvailableMaterials = (
  params: {
    buyerCode: number;
    order: string;
    typeCode: number;
    styleCode: string;
  },
  enabled: boolean,
): UseQueryResult<OrderItemServiceModel[], AppError> => {
  return useQuery<OrderItemServiceModel[], AppError>({
    queryKey: [
      "availableMaterials",
      params.buyerCode,
      params.order,
      params.typeCode,
      params.styleCode,
    ],
    queryFn: async () => {
      const response: AxiosResponse<OrderItemServiceModel[]> =
        await loadAvailableMaterials(params);
      return response.data;
    },
    enabled,
  });
};

export const useGetLedgerBreakdownByStyle = (
  params: {
    buyerCode: number;
    order: string;
    typeCode: number;
    styleCode: string;
  },
  enabled: boolean,
): UseQueryResult<StyleMaterialConsumptionLedgerRow[], AppError> => {
  return useQuery<StyleMaterialConsumptionLedgerRow[], AppError>({
    queryKey: [
      "ledgerBreakdownByStyle",
      params.buyerCode,
      params.order,
      params.typeCode,
      params.styleCode,
    ],
    queryFn: async () => {
      const response: AxiosResponse<StyleMaterialConsumptionLedgerRow[]> =
        await loadLedgerBreakdownByStyle(params);
      return response.data;
    },
    enabled,
  });
};
