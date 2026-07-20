import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type {
  AvailableBudgetLine,
  CommitSupplierPurchaseOrderResult,
  PODetailItemRow,
  POHeaderState,
} from "../interfaces/OrderManagement/purchase-order-types";

export const supplierPurchaseOrderApi = createApi({
  reducerPath: "supplierPurchaseOrderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: APPARELPRO_ENDPOINTS.URLS.BASEURL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["SupplierPOLedger"],
  endpoints: (builder) => ({
    // 1. Fetches planned material consumption lines where bal_qty > 0
    getUnfulfilledBudgetLines: builder.query<
      AvailableBudgetLine[],
      { buyerCode: number; order: string }
    >({
      query: ({ buyerCode, order }) => ({
        url: "api/supplier-po/unfulfilled-budget",
        method: "GET",
        params: { buyerCode, order },
      }),
      providesTags: ["SupplierPOLedger"],
    }),

    // 2. Fetches saved item rows assigned to a specific Purchase Order number
    getPurchaseOrderLines: builder.query<PODetailItemRow[], string>({
      query: (poNo) => ({
        url: `api/purchaseOrder/lines?poNo=${encodeURIComponent(poNo)}`,
        method: "GET",
      }),
      providesTags: ["SupplierPOLedger"],
    }),

    // 3. Submits the full header and array of detailed rows atomically to the server.
    // Response carries back the confirmed PurchaseNumber - for a new P/O this is
    // the number the backend allocated server-side via the shared document
    // sequence service, not whatever (if anything) was in the request.
    commitSupplierPurchaseOrder: builder.mutation<
      CommitSupplierPurchaseOrderResult,
      { header: POHeaderState; lineItems: PODetailItemRow[] }
    >({
      query: (payload) => ({
        url: "api/supplier-po/save-supplier-po",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["SupplierPOLedger"],
    }),
  }),
});

export const {
  useGetUnfulfilledBudgetLinesQuery,
  useGetPurchaseOrderLinesQuery,
  useCommitSupplierPurchaseOrderMutation,
} = supplierPurchaseOrderApi;
