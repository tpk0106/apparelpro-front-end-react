import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { ValueDeclarationDetail, ValueDeclarationHeader } from "../../interfaces/import-export/ImportExport";
import {
  loadValueDeclarations, loadValueDeclarationById, saveValueDeclaration, deleteValueDeclaration,
  downloadValueDeclarationPrintPdf, type ValueDeclarationListParams,
} from "../../services/import-export/value-declaration.service";

export const useGetValueDeclarations = (params: ValueDeclarationListParams) => {
  return useQuery<PaginationAPIModel<ValueDeclarationHeader>, Error>({
    queryKey: ["importExport", "valueDeclarations", params],
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<ValueDeclarationHeader>> = await loadValueDeclarations(params);
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useGetValueDeclaration = (id: number | null) => {
  return useQuery<ValueDeclarationDetail, Error>({
    queryKey: ["importExport", "valueDeclaration", id],
    queryFn: async () => {
      const response: AxiosResponse<ValueDeclarationDetail> = await loadValueDeclarationById(id!);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useSaveValueDeclaration = () => {
  const queryClient = useQueryClient();
  return useMutation<ValueDeclarationDetail, AppError, ValueDeclarationDetail>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<ValueDeclarationDetail> = await saveValueDeclaration(payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["importExport", "valueDeclarations"] });
      queryClient.invalidateQueries({ queryKey: ["importExport", "valueDeclaration", data.header.id] });
    },
  });
};

export const useDeleteValueDeclaration = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, number>({
    mutationFn: async (id) => {
      await deleteValueDeclaration(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["importExport", "valueDeclarations"] });
    },
  });
};

// PDF export is a one-shot side effect, not cached data - triggers a browser
// download from the returned blob, same shape as the other IE print hooks.
export const useDownloadValueDeclarationPrintPdf = () => {
  return useMutation<void, AppError, { id: number; invoiceNo: string }>({
    mutationFn: async ({ id, invoiceNo }) => {
      const response = await downloadValueDeclarationPrintPdf(id);
      const safeInvoiceNo = invoiceNo.replace(/\//g, "-");
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `ValueDeclaration_${safeInvoiceNo}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
