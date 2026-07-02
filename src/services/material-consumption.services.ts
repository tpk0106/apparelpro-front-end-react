import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { Style } from "../interfaces/OrderManagement/Style";
import type { PaginationData } from "../interfaces/definitions";
import type { PaginationAPIModel } from "../interfaces/references/ApiResult";
import type { Buyer } from "../interfaces/references/Buyer";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type {
  ColorSizeDetailsServiceModel,
  OrderItemServiceModel,
} from "../components/material-consumption/material-consumption.types";
import type { SupplierServiceModel } from "../tanstack-hooks/interfaces";

export interface GarmentTypeServiceModel {
  id: number;
  typeName: string;
}

export interface UnitConversionServiceModel {
  fromUnit: string;
  toUnit: string;
  measure: number;
}

export interface UnitServiceModel {
  id: number;
  code: string;
  description: string;
}

export interface CurrencyServiceModel {
  id: number;
  code: string;
  name: string;
}

export interface SelectedScopeContext {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  bulkQuantity: number;
  parentOrderUnit: string;
}

export const materialConsumptionApi = createApi({
  reducerPath: "materialConsumptionApi",
  // ✅ FIX 1: Declaring the tag types array allows string names to be accepted below
  tagTypes: ["ConsumptionLedger"],
  baseQuery: fetchBaseQuery({
    baseUrl: APPARELPRO_ENDPOINTS.URLS.BASEURL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getBuyersPaged: builder.query<PaginationAPIModel<Buyer>, PaginationData>({
      query: (params) => ({
        url: APPARELPRO_ENDPOINTS.REFERENCE_SECTION.BUYER.GET_BY_PAGINATION,
        method: "GET",
        params: {
          pageNumber: params.pageIndex,
          pageSize: params.pageSize,
          sortColumn: params.sortColumn || undefined,
          sortOrder: params.sortOrder || undefined,
          filterColumn: params.filterColumn || undefined,
          filterQuery: params.filterQuery || undefined,
        },
      }),
    }),

    getOrdersByBuyer: builder.query<string[], number>({
      query: (buyerCode) => ({
        url: APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.PO.GET_ALL_POS_BY_BUYER_CODE,
        method: "GET",
        params: { buyerCode },
      }),
    }),

    getAllGarmentTypes: builder.query<GarmentTypeServiceModel[], void>({
      query: () =>
        APPARELPRO_ENDPOINTS.REFERENCE_SECTION.GARMENT_TYPE
          .GET_ALL_GARMENT_TYPES,
    }),

    getAllUnitConversions: builder.query<UnitConversionServiceModel[], void>({
      query: () =>
        APPARELPRO_ENDPOINTS.REFERENCE_SECTION.UNITCONVERSION.GET_BY_PAGINATION,
    }),

    getAllUnits: builder.query<
      PaginationAPIModel<UnitServiceModel>,
      PaginationData
    >({
      query: (params) => ({
        url: APPARELPRO_ENDPOINTS.REFERENCE_SECTION.UNIT.GET_BY_PAGINATION,
        method: "GET",
        params: {
          pageNumber: params.pageIndex,
          pageSize: params.pageSize,
          sortColumn: params.sortColumn || undefined,
          sortOrder: params.sortOrder || undefined,
          filterColumn: params.filterColumn || undefined,
          filterQuery: params.filterQuery || undefined,
        },
      }),
    }),

    getAllCurrencies: builder.query<
      PaginationAPIModel<CurrencyServiceModel>,
      PaginationData
    >({
      query: (params) => ({
        url: APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CURRENCY.GET_BY_PAGINATION,
        method: "GET",
        params: {
          pageNumber: params.pageIndex,
          pageSize: params.pageSize,
          sortColumn: params.sortColumn || undefined,
          sortOrder: params.sortOrder || undefined,
          filterColumn: params.filterColumn || undefined,
          filterQuery: params.filterQuery || undefined,
        },
      }),
    }),

    getStylesByScope: builder.query<
      Style[],
      { buyerCode: number; order: string; typeCode: number }
    >({
      query: ({ buyerCode, order, typeCode }) =>
        `${APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.STYLE_DETAILS.GET_STYLE_DETAILS_BY_BUYER_AND_ORDER_AND_TYPE}/${buyerCode}/${order}/${typeCode}`,
    }),

    getDynamicFeatureHeaders: builder.query<
      any,
      { stockCode: string; itemCode: string }
    >({
      query: ({ stockCode, itemCode }) =>
        `api/material-consumption/feature-headers?stockCode=${encodeURIComponent(stockCode)}&itemCode=${encodeURIComponent(itemCode)}`,
    }),

    calculateConsumption: builder.query<number, any>({
      query: (params) => ({
        url: "api/material-consumption/calculate-consumption",
        method: "GET",
        params,
      }),
    }),

    getBreakdownByStyle: builder.query<
      any[],
      { buyerCode: number; order: string; typeCode: number; styleCode: string }
    >({
      query: ({ buyerCode, order, typeCode, styleCode }) => ({
        // url: "api/materialConsumption/by-style",
        url: APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.MATERIAL_CONSUMPTION
          .GET_ALL_MATERIAL_CONSUMPTIONS_BY_STYLE,
        method: "GET",
        params: { buyerCode, order, typeCode, styleCode },
      }),
    }),

    // Inside your material-consumption.services.ts endpoints schema definition mapping block:
    getSuppliersLookup: builder.query<SupplierServiceModel[], void>({
      query: () => ({
        // Resolves strictly to "api/supplier/suppliers-lookup" from your configuration dictionary
        url: APPARELPRO_ENDPOINTS.REFERENCE_SECTION.SUPPLIER.SUPPLIERS_LOOKUP,
        method: "GET", // FIXED: Explicitly state the HTTP GET verb method block to clear the 405 error!
      }),
    }),

    // // Add this entry inside your endpoints schema block mapping within material-consumption.services.ts:
    // getSuppliersLookup: builder.query<SupplierServiceModel[], void>({
    //   query: () =>
    //     APPARELPRO_ENDPOINTS.REFERENCE_SECTION.SUPPLIER.SUPPLIERS_LOOKUP,
    // }),

    deleteConsumptionEntry: builder.mutation<
      boolean,
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
      query: (params) => ({
        url: "api/material-consumption/delete-entry",
        method: "DELETE",
        params: {
          buyerCode: params.buyerCode,
          order: params.order.trim(),
          typeCode: params.typeCode,
          styleCode: params.styleCode.trim(),
          stockCode: params.stockCode.trim(),
          itemCode: params.itemCode.trim(),
          // 🚀 THE CRITICAL FIX: If color/size are blank strings, transmit the explicit
          // token string "EMPTY" to satisfy the backend model binder required filters [INDEX]!
          color: params.color.trim() === "" ? "EMPTY" : params.color.trim(),
          size: params.size.trim() === "" ? "EMPTY" : params.size.trim(),
        },
      }),
      // Tells Redux to clear the old cache, instantly refreshing the table rows on-screen!
      invalidatesTags: ["ConsumptionLedger"],
    }),

    saveConsumptionEntry: builder.mutation<void, any>({
      query: (payload) => ({
        url: "api/material-consumption/save-entry",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["ConsumptionLedger"],
    }),

    // ✅ FIX 2: Only keeping this scoped hook version (the old duplicate array one was removed)
    getAvailableMaterials: builder.query<
      OrderItemServiceModel[],
      { buyerCode: number; order: string; typeCode: number; styleCode: string }
    >({
      query: ({ buyerCode, order, typeCode, styleCode }) => ({
        // url: `api/materialConsumption/items-lookup`,
        url: APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.MATERIAL_CONSUMPTION
          .GET_AVAILABLE_MATERIALS,
        method: "GET",
        params: { buyerCode, order, typeCode, styleCode },
      }),
      providesTags: ["ConsumptionLedger"],
    }),

    // Inside your material-consumption.services.ts endpoints schema mapper:
    getStyleDimensions: builder.query<
      { colors: string[]; sizes: string[] },
      { buyerCode: number; order: string; typeCode: number; styleCode: string }
    >({
      query: ({ buyerCode, order, typeCode, styleCode }) => ({
        url: APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.COLOR_SIZE_DETAILS
          .GET_COLOR_AND_SIZE_ONLY_DETAILS_BY_STYLE,
        method: "GET",
        params: { buyerCode, order, typeCode, styleCode },
      }),
    }),

    // Add this entry inside your endpoints schema block definition mapping:
    getColorSizeSavedMatrix: builder.query<
      ColorSizeDetailsServiceModel[],
      { buyerCode: number; order: string; typeCode: number; styleCode: string }
    >({
      query: ({ buyerCode, order, typeCode, styleCode }) => ({
        url: APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.COLOR_SIZE_DETAILS
          .GET_COLOR_SIZE_MATRIX,
        method: "GET",
        params: { buyerCode, order, typeCode, styleCode },
      }),
      providesTags: ["ConsumptionLedger"], // Connects to your cache manager for automated updates
    }),
  }),
});

export const {
  useGetBuyersPagedQuery,
  useGetOrdersByBuyerQuery,
  useGetAllGarmentTypesQuery,
  useGetAllUnitConversionsQuery,
  useGetStylesByScopeQuery,
  useGetAllUnitsQuery,
  useGetDynamicFeatureHeadersQuery,
  useLazyCalculateConsumptionQuery,
  useGetSuppliersLookupQuery,
  useGetAllCurrenciesQuery,
  useGetStyleDimensionsQuery,
  useGetBreakdownByStyleQuery, // <-- EXPORTED SAFELY FOR YOUR LEDGER SHEET
  useGetAvailableMaterialsQuery, // <-- EXPORTED SAFELY FOR YOUR INVENTORY GRID
  useSaveConsumptionEntryMutation, // <-- ADD THIS EXACT MUTATION HOOK HERE
  useGetColorSizeSavedMatrixQuery,
  useDeleteConsumptionEntryMutation, // <-- EXPORT THIS HOOK RIGHT HERE
} = materialConsumptionApi;
