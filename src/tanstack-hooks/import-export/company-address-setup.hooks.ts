import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import type { CompanyAddress } from "../../interfaces/import-export/ImportExport";
import {
  loadCompanyAddresses, saveCompanyAddress, deleteCompanyAddress,
} from "../../services/import-export/company-address-setup.service";

const COMPANY_ADDRESSES_QUERY_KEY = ["importExport", "companyAddresses"];

export const useGetCompanyAddresses = () => {
  return useQuery<CompanyAddress[], Error>({
    queryKey: COMPANY_ADDRESSES_QUERY_KEY,
    queryFn: async () => {
      const response: AxiosResponse<CompanyAddress[]> = await loadCompanyAddresses();
      return response.data;
    },
  });
};

export const useSaveCompanyAddress = () => {
  const queryClient = useQueryClient();
  return useMutation<CompanyAddress, AppError, Omit<CompanyAddress, "id" | "addressNo"> & { id?: number }>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<CompanyAddress> = await saveCompanyAddress(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANY_ADDRESSES_QUERY_KEY });
    },
  });
};

export const useDeleteCompanyAddress = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, number>({
    mutationFn: async (id) => {
      await deleteCompanyAddress(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANY_ADDRESSES_QUERY_KEY });
    },
  });
};
