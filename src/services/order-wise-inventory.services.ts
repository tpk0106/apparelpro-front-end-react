// FIXED: Changed the import path prefix to select the correct React runtime hook bindings!
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type {
  StockItemAvailabilityDetails,
  RequisitionSubmissionPayload,
  VerifyStockQueryParams,
  InventoryMutationResponse,
} from "../components/orderwise-inventory/orderwise-inventory.types";

export const orderwiseInventoryApi = createApi({
  reducerPath: "orderwiseInventoryApi",
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
  tagTypes: ["orderwiseInventoryLedger"],

  endpoints: (builder) => ({
    // 1. GET: Queries the C# backend to read live, net available stock metrics inside grid cells
    verifyStockItemAvailability: builder.query<
      StockItemAvailabilityDetails,
      VerifyStockQueryParams
    >({
      query: (params) => ({
        url: APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.SRN.VERIFY_STOCK,
        method: "GET",
        params,
      }),
      providesTags: ["orderwiseInventoryLedger"],
    }),

    // 2. POST: Commits a complete Stores Requisition Note atomically to SQL Server tables
    // FIXED: Handled full generic formatting parameters and fixed HTTP verb method casing!
    createSRN: builder.mutation<
      InventoryMutationResponse,
      RequisitionSubmissionPayload
    >({
      query: (payload) => ({
        url: APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.SRN.POST,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["orderwiseInventoryLedger"],
    }),

    // 3. GET: Fetches the lookup options array for the auto-complete dropdown search box
    // 3. GET: Fetches pre-filtered lookup choices based on Buyer, Order, AND selected Store/Basis
    getAvailableStockChoices: builder.query<
      any[],
      { buyerCode: number; order: string; storeCode: string }
    >({
      query: ({ buyerCode, order, storeCode }) => ({
        url: "api/orderwise-inventory-srn/available-choices",
        method: "GET",
        params: { buyerCode, order, storeCode },
      }),
      providesTags: ["orderwiseInventoryLedger"],
    }),
  }),
});

// RTK Query automatically generates hooks matching your endpoints declarations!
export const {
  useVerifyStockItemAvailabilityQuery,
  useLazyVerifyStockItemAvailabilityQuery, // Excellent for lazy cellular checks on blur!
  useGetAvailableStockChoicesQuery,
  useCreateSRNMutation,
} = orderwiseInventoryApi;
