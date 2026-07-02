import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type { PaginationAPIModel } from "../interfaces/references/ApiResult";
import type { PaginationData } from "../interfaces/definitions";
import type { Department } from "../interfaces/references/Department";

export const commonServiceApi = createApi({
  reducerPath: "commonServiceApi",
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
  tagTypes: ["CommonServiceLedger"],

  endpoints: (builder) => ({
    getDepartmentsPaged: builder.query<
      PaginationAPIModel<Department>,
      PaginationData
    >({
      query: (params) => ({
        url: APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DEPARTMENT
          .GET_BY_PAGINATION,
        method: "GET",
        params: {
          pageNumber: params.pageIndex,
          pageSize: params.pageSize,
          sortColumn: params.sortColumn || undefined,
          sortOrder: params.sortOrder || undefined,
          filterColumn: params.filterColumn || undefined,
          filterQuery: params.filterQuery || undefined,
        },
        providesTags: ["CommonServiceLedger"],
      }),
    }),

    // Add this inside your endpoints builder block:
    getAllDepartments: builder.query<
      { departmentCode: string; name: string }[],
      void
    >({
      query: () => APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DEPARTMENT.GET_ALL, // Maps to a standard HTTP GET lookup controller on your backend, // Maps to a standard HTTP GET lookup controller on your backend
    }),

    // getAllDepartments: builder.query<void>({
    //   query: () =>
    //     APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DEPARTMENT.GET_BY_PAGINATION, // Maps to a standard HTTP GET lookup controller on your backend
    //   providesTags: ["CommonServiceLedger"],
    // }),
  }),
});

export const { useGetDepartmentsPagedQuery, useGetAllDepartmentsQuery } =
  commonServiceApi;
