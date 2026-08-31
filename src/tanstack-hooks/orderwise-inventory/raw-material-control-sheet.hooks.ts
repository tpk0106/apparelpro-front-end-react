import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getRawMaterialControlSheetHeader,
  getRawMaterialControlSheetLines,
  downloadRawMaterialControlSheetPdf,
  type RawMaterialControlSheetParams,
} from "../../services/reports/orderwise-inventory/raw-material-control-sheet.service";
import type {
  RawMaterialControlSheetHeader,
  RawMaterialControlSheetLine,
} from "../../interfaces/orderwise-inventory/raw-material-control-sheet.types";

export const useGetRawMaterialControlSheetHeaderQuery = (
  params: RawMaterialControlSheetParams,
  enabled: boolean,
) => {
  return useQuery<RawMaterialControlSheetHeader, AppError>({
    queryKey: ["rawMaterialControlSheetHeader", params],
    queryFn: async () => {
      const response: AxiosResponse<RawMaterialControlSheetHeader> =
        await getRawMaterialControlSheetHeader(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useGetRawMaterialControlSheetLinesQuery = (
  params: RawMaterialControlSheetParams,
  enabled: boolean,
) => {
  return useQuery<RawMaterialControlSheetLine[], AppError>({
    queryKey: ["rawMaterialControlSheetLines", params],
    queryFn: async () => {
      const response: AxiosResponse<RawMaterialControlSheetLine[]> =
        await getRawMaterialControlSheetLines(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadRawMaterialControlSheetPdfMutation = () => {
  return useMutation<void, AppError, RawMaterialControlSheetParams>({
    mutationFn: async (params) => {
      const response = await downloadRawMaterialControlSheetPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Raw_Material_Control_Sheet_${params.buyerCode}_${params.order}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
