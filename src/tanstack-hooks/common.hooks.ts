import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import type { PaginationData } from "../interfaces/definitions";
import type { PaginationAPIModel } from "../interfaces/references/ApiResult";
import type { Department } from "../interfaces/references/Department";
import {
  loadDepartmentsPaged,
  loadAllDepartments,
} from "../services/common.service";

export const useGetDepartmentsPagedQuery = (paginate: PaginationData) => {
  return useQuery<PaginationAPIModel<Department>, AppError>({
    queryKey: ["departmentsPaged", paginate.pageIndex, paginate.pageSize],
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<Department>> =
        await loadDepartmentsPaged(paginate);
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useGetAllDepartmentsQuery = () => {
  return useQuery<Department[], AppError>({
    queryKey: ["allDepartments"],
    queryFn: async () => {
      const response: AxiosResponse<Department[]> = await loadAllDepartments();
      return response.data;
    },
  });
};
