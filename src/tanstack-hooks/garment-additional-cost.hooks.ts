import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { toast } from "react-toastify";
import type { AppError } from "../auth/axiosClient";
import {
  loadGarmentAdditionalCosts,
  saveGarmentAdditionalCost,
  deleteGarmentAdditionalCost,
  loadGarmentAdditionalCostReport,
  downloadGarmentAdditionalCostReportPdf,
  type GarmentAdditionalCostScopeParams,
} from "../services/order-management/garment-additional-cost.service";
import type {
  GarmentAdditionalCostRow,
  GarmentAdditionalCostReport,
  SaveGarmentAdditionalCostPayload,
} from "../components/garment-additional-cost/garment-additional-cost.types";

export const useGetGarmentAdditionalCosts = (
  params: GarmentAdditionalCostScopeParams,
  enabled: boolean,
): UseQueryResult<GarmentAdditionalCostRow[], AppError> => {
  return useQuery<GarmentAdditionalCostRow[], AppError>({
    queryKey: [
      "garmentAdditionalCosts",
      params.buyerCode,
      params.order,
      params.typeCode,
      params.styleCode,
    ],
    queryFn: async () => {
      const response: AxiosResponse<GarmentAdditionalCostRow[]> =
        await loadGarmentAdditionalCosts(params);
      return response.data;
    },
    enabled,
  });
};

export const useSaveGarmentAdditionalCostMutation = (): UseMutationResult<
  GarmentAdditionalCostRow,
  AppError,
  SaveGarmentAdditionalCostPayload
> => {
  const queryClient = useQueryClient();

  return useMutation<
    GarmentAdditionalCostRow,
    AppError,
    SaveGarmentAdditionalCostPayload
  >({
    mutationFn: async (payload) => {
      const response: AxiosResponse<GarmentAdditionalCostRow> =
        await saveGarmentAdditionalCost(payload);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "garmentAdditionalCosts",
          variables.buyerCode,
          variables.order,
          variables.typeCode,
          variables.styleCode,
        ],
      });
      toast.success("Additional Cost entry saved successfully");
    },
    onError: (error) => {
      toast.error(`Save failed: ${error.message}`);
    },
  });
};

export const useDeleteGarmentAdditionalCostMutation = (): UseMutationResult<
  boolean,
  AppError,
  GarmentAdditionalCostScopeParams & {
    additionalCostCode: string;
    itemCode: string;
  }
> => {
  const queryClient = useQueryClient();

  return useMutation<
    boolean,
    AppError,
    GarmentAdditionalCostScopeParams & {
      additionalCostCode: string;
      itemCode: string;
    }
  >({
    mutationFn: async (params) => {
      const response: AxiosResponse<boolean> =
        await deleteGarmentAdditionalCost(params);
      return response.data;
    },
    onSuccess: (success, variables) => {
      if (!success) {
        toast.error(
          "Purchase Order already raised against this item. Deletion is blocked.",
        );
        return;
      }
      queryClient.invalidateQueries({
        queryKey: [
          "garmentAdditionalCosts",
          variables.buyerCode,
          variables.order,
          variables.typeCode,
          variables.styleCode,
        ],
      });
      toast.success("Additional Cost entry deleted successfully");
    },
    onError: (error) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });
};

export const useGetGarmentAdditionalCostReport = (
  params: GarmentAdditionalCostScopeParams,
  enabled: boolean,
): UseQueryResult<GarmentAdditionalCostReport, AppError> => {
  return useQuery<GarmentAdditionalCostReport, AppError>({
    queryKey: [
      "garmentAdditionalCostReport",
      params.buyerCode,
      params.order,
      params.typeCode,
      params.styleCode,
    ],
    queryFn: async () => {
      const response: AxiosResponse<GarmentAdditionalCostReport> =
        await loadGarmentAdditionalCostReport(params);
      return response.data;
    },
    enabled,
  });
};

// PDF export is a one-shot side effect, not cached data - modelled as a mutation that
// triggers a browser download from the returned blob (same pattern as Trim Sheet Report).
export const useDownloadGarmentAdditionalCostReportPdfMutation = () => {
  return useMutation<void, AppError, GarmentAdditionalCostScopeParams>({
    mutationFn: async (params) => {
      const response = await downloadGarmentAdditionalCostReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `AdditionalCostsPerGarment_${params.styleCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
    onError: (error) => {
      toast.error(`Failed to generate report PDF: ${error.message}`);
    },
  });
};
