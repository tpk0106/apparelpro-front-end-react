import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import type { CustomsDeclarationDetail } from "../../interfaces/import-export/ImportExport";
import {
  loadCustomsDeclarationByCusNo, saveCustomsDeclaration, deleteCustomsDeclaration,
  downloadCustomsDeclarationPrintPdf,
} from "../../services/import-export/customs-declaration.service";

// A brand-new CUSDEC No. legitimately has no saved form yet - the backend
// 404s in that case, which is expected, not an error state. Resolves to
// null instead of throwing, same pattern as useGetLetterOfCredit.
export const useGetCustomsDeclaration = (cusNo: string | null) => {
  return useQuery<CustomsDeclarationDetail | null, Error>({
    queryKey: ["importExport", "customsDeclaration", cusNo],
    queryFn: async () => {
      try {
        const response: AxiosResponse<CustomsDeclarationDetail> = await loadCustomsDeclarationByCusNo(cusNo!);
        return response.data;
      } catch (err) {
        if ((err as AppError)?.status === 404) return null;
        throw err;
      }
    },
    enabled: !!cusNo,
  });
};

export const useSaveCustomsDeclaration = () => {
  const queryClient = useQueryClient();
  return useMutation<CustomsDeclarationDetail, AppError, CustomsDeclarationDetail>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<CustomsDeclarationDetail> = await saveCustomsDeclaration(payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["importExport", "customsDeclaration", data.header.cusNo],
      });
    },
  });
};

export const useDownloadCustomsDeclarationPrintPdf = () => {
  return useMutation<void, AppError, string>({
    mutationFn: async (cusNo) => {
      const response = await downloadCustomsDeclarationPrintPdf(cusNo);
      const safeCusNo = cusNo.replace(/\//g, "-");
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `CUSDEC_${safeCusNo}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};

export const useDeleteCustomsDeclaration = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, string>({
    mutationFn: async (cusNo) => {
      await deleteCustomsDeclaration(cusNo);
    },
    onSuccess: (_data, cusNo) => {
      queryClient.invalidateQueries({ queryKey: ["importExport", "customsDeclaration", cusNo] });
    },
  });
};
