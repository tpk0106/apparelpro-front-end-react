// TanStack Query hooks for the home dashboard (Floor pulse).

import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type {
  CurrentStyle,
  DailyTrendPoint,
  DailyTrendSeries,
  OrderManagementSummary,
  OrderwiseInventorySummary,
  ProductionProgress,
} from "../interfaces/dashboard/Dashboard";
import {
  loadCurrentStyle,
  loadProductionProgress,
  loadDailyTrend,
  loadDailyTrendAllSections,
  loadOrderManagementSummary,
  loadOrderwiseInventorySummary,
} from "../services/dashboard/dashboard.service";

export const useGetCurrentStyle = () => {
  return useQuery<CurrentStyle | null, Error>({
    queryKey: ["dashboard", "currentStyle"],
    queryFn: async () => {
      const response: AxiosResponse<CurrentStyle> = await loadCurrentStyle();
      // Backend returns 204 No Content when nothing has been entered yet and
      // no pin is set - axios gives an empty string body in that case, not
      // null, so it has to be checked for explicitly.
      return response.status === 204 || !response.data ? null : response.data;
    },
  });
};

interface StyleScope {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
}

export const useGetProductionProgress = (scope: StyleScope | null) => {
  return useQuery<ProductionProgress, Error>({
    queryKey: [
      "dashboard", "productionProgress",
      scope?.buyerCode, scope?.order, scope?.typeCode, scope?.styleCode,
    ],
    queryFn: async () => {
      const response: AxiosResponse<ProductionProgress> = await loadProductionProgress(
        scope!.buyerCode, scope!.order, scope!.typeCode, scope!.styleCode,
      );
      return response.data;
    },
    enabled: !!scope,
  });
};

export const useGetDailyTrend = (scope: StyleScope | null) => {
  return useQuery<DailyTrendPoint[], Error>({
    queryKey: [
      "dashboard", "dailyTrend",
      scope?.buyerCode, scope?.order, scope?.typeCode, scope?.styleCode,
    ],
    queryFn: async () => {
      const response: AxiosResponse<DailyTrendPoint[]> = await loadDailyTrend(
        scope!.buyerCode, scope!.order, scope!.typeCode, scope!.styleCode,
      );
      return response.data;
    },
    enabled: !!scope,
  });
};

export const useGetDailyTrendAllSections = (scope: StyleScope | null) => {
  return useQuery<DailyTrendSeries[], Error>({
    queryKey: [
      "dashboard", "dailyTrendAllSections",
      scope?.buyerCode, scope?.order, scope?.typeCode, scope?.styleCode,
    ],
    queryFn: async () => {
      const response: AxiosResponse<DailyTrendSeries[]> = await loadDailyTrendAllSections(
        scope!.buyerCode, scope!.order, scope!.typeCode, scope!.styleCode,
      );
      return response.data;
    },
    enabled: !!scope,
  });
};

export const useGetOrderManagementSummary = (scope: StyleScope | null) => {
  return useQuery<OrderManagementSummary | null, Error>({
    queryKey: [
      "dashboard", "orderManagementSummary",
      scope?.buyerCode, scope?.order, scope?.typeCode, scope?.styleCode,
    ],
    queryFn: async () => {
      try {
        const response: AxiosResponse<OrderManagementSummary> = await loadOrderManagementSummary(
          scope!.buyerCode, scope!.order, scope!.typeCode, scope!.styleCode,
        );
        return response.data;
      } catch (error) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 404) return null;
        throw error;
      }
    },
    enabled: !!scope,
  });
};

export const useGetOrderwiseInventorySummary = (scope: StyleScope | null) => {
  return useQuery<OrderwiseInventorySummary | null, Error>({
    queryKey: ["dashboard", "orderwiseInventorySummary", scope?.buyerCode, scope?.order],
    queryFn: async () => {
      try {
        const response: AxiosResponse<OrderwiseInventorySummary> = await loadOrderwiseInventorySummary(
          scope!.buyerCode, scope!.order,
        );
        return response.data;
      } catch (error) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 404) return null;
        throw error;
      }
    },
    enabled: !!scope,
  });
};
