import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { ExportLicenseDetail, ExportLicenseHeader } from "../../interfaces/import-export/ImportExport";
import {
  loadExportLicenses, loadExportLicenseById, saveExportLicense, deleteExportLicense, downloadExportLicensePrintPdf,
  type ExportLicenseListParams,
} from "../../services/import-export/export-license.service";

export const useGetExportLicenses = (params: ExportLicenseListParams) => {
  return useQuery<PaginationAPIModel<ExportLicenseHeader>, Error>({
    queryKey: ["importExport", "exportLicenses", params],
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<ExportLicenseHeader>> = await loadExportLicenses(params);
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useGetExportLicense = (id: number | null) => {
  return useQuery<ExportLicenseDetail, Error>({
    queryKey: ["importExport", "exportLicense", id],
    queryFn: async () => {
      const response: AxiosResponse<ExportLicenseDetail> = await loadExportLicenseById(id!);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useSaveExportLicense = () => {
  const queryClient = useQueryClient();
  return useMutation<ExportLicenseDetail, AppError, ExportLicenseDetail>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<ExportLicenseDetail> = await saveExportLicense(payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["importExport", "exportLicenses"] });
      queryClient.invalidateQueries({ queryKey: ["importExport", "exportLicense", data.header.id] });
    },
  });
};

export const useDeleteExportLicense = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, number>({
    mutationFn: async (id) => {
      await deleteExportLicense(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["importExport", "exportLicenses"] });
    },
  });
};

// PDF export is a one-shot side effect, not cached data - triggers a browser
// download from the returned blob, same shape as the other IE print hooks.
export const useDownloadExportLicensePrintPdf = () => {
  return useMutation<void, AppError, { id: number }>({
    mutationFn: async ({ id }) => {
      const response = await downloadExportLicensePrintPdf(id);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `ExportLicense_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
