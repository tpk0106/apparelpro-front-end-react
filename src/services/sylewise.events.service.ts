import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type {
  AddCustomEventLinePayload,
  DeleteEventLineParams,
  StyleApprovalPayload,
  StylewiseEventRow,
  UpdateEventLinePayload,
} from "../components/stylewise-events/stylewise-events.types";

export const stylewiseEventApi = createApi({
  reducerPath: "stylewiseEventApi",
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
  // Caching tags to manage automated background component updates safely
  tagTypes: ["StylewiseEventsLedger"],

  endpoints: (builder) => ({
    // 1. GET: Fetches or auto-initializes the milestone checklist matrix grid
    getStylewiseEventsChecklist: builder.query<
      StylewiseEventRow[],
      { buyerCode: number; order: string; typeCode: number; styleCode: string }
    >({
      query: ({ buyerCode, order, typeCode, styleCode }) => ({
        url: "api/stylewise-event/checklist",
        method: "GET",
        params: { buyerCode, order, typeCode, styleCode },
      }),
      providesTags: ["StylewiseEventsLedger"],
    }),

    // 2. PUT: Submits cell-level inline grid updates (Scheduled, Actual, Remarks)
    updateStylewiseEventLine: builder.mutation<
      { success: boolean; message: string },
      UpdateEventLinePayload
    >({
      query: (payload) => ({
        url: "api/stylewise-event/update-line",
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["StylewiseEventsLedger"],
    }),

    // 3. POST: Appends a manually generated brand-new tracking milestone row definition
    addCustomStylewiseEventLine: builder.mutation<
      { success: boolean; message: string },
      AddCustomEventLinePayload
    >({
      query: (payload) => ({
        url: "api/stylewise-event/add-custom",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["StylewiseEventsLedger"],
    }),

    // 4. DELETE: Purges an un-approved milestone row from the style tracking context
    deleteStylewiseEventLine: builder.mutation<
      { success: boolean; message: string },
      DeleteEventLineParams
    >({
      query: ({ buyerCode, order, typeCode, styleCode, eventCode }) => ({
        url: "api/stylewise-event/delete-line",
        method: "DELETE",
        params: { buyerCode, order, typeCode, styleCode, eventCode },
      }),
      invalidatesTags: ["StylewiseEventsLedger"],
    }),

    approveStyleEvents: builder.mutation<
      { success: boolean; message: string },
      StyleApprovalPayload
    >({
      query: (payload) => ({
        url: "api/style-approval/approve-events",
        method: "POST",
        body: payload,
      }),
      // Automatically clears out the old data and re-fetches the updated row fields from SQL Server
      invalidatesTags: ["StylewiseEventsLedger"],
    }),
  }),
});

export const {
  useGetStylewiseEventsChecklistQuery,
  useUpdateStylewiseEventLineMutation,
  useAddCustomStylewiseEventLineMutation,
  useDeleteStylewiseEventLineMutation,
  useApproveStyleEventsMutation,
} = stylewiseEventApi;
