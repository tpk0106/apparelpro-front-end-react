import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type {
  StyleShippingSummary,
  PartShipmentRow,
} from "../components/part-shipment/part-shipments.types";

export const partShipmentApi = createApi({
  reducerPath: "partShipmentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: APPARELPRO_ENDPOINTS.URLS.BASEURL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  // Automatic caching tags clear out stale metrics and update tables on save
  tagTypes: ["ShipmentsLedger"],
  endpoints: (builder) => ({
    // 1. GET: Fetches the upper summary contract cap metrics
    getStyleShippingSummary: builder.query<
      StyleShippingSummary,
      { buyerCode: number; order: string; typeCode: number; styleCode: string }
    >({
      query: (params) => ({
        url: "api/part-shipment/style-summary",
        method: "GET",
        params,
      }),
      providesTags: ["ShipmentsLedger"],
    }),

    // 2. GET: Fetches the lower sub-grid manifest ledger list
    getPartShipmentsLedger: builder.query<
      PartShipmentRow[],
      { buyerCode: number; order: string; typeCode: number; styleCode: string }
    >({
      query: (params) => ({
        url: "api/part-shipment/lines-ledger",
        method: "GET",
        params,
      }),
      providesTags: ["ShipmentsLedger"],
    }),

    // 3. POST: Submits new partial entries or inline grid modifications to the C# backend
    savePartShipmentLine: builder.mutation<
      { success: boolean; message: string },
      Partial<PartShipmentRow>
    >({
      query: (body) => ({
        url: "api/part-shipment/save-line",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ShipmentsLedger"],
    }),

    // 4. DELETE: Purges an un-exported delivery manifest row by ID
    deletePartShipmentLine: builder.mutation<
      { success: boolean; message: string },
      number
    >({
      query: (id) => ({
        url: `api/part-shipment/delete-line/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ShipmentsLedger"],
    }),
  }),
});

export const {
  useGetStyleShippingSummaryQuery,
  useGetPartShipmentsLedgerQuery,
  useSavePartShipmentLineMutation,
  useDeletePartShipmentLineMutation,
} = partShipmentApi;
