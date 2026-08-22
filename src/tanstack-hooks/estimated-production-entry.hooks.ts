// TanStack Query hooks for Estimated Production Entry (PR_ESTD1.PRG).

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { toast } from "react-toastify";

import type { EstimatedProductionEntry } from "../interfaces/production/EstimatedProductionEntry";
import {
  loadEstimatedProductionEntries,
  bulkSaveEstimatedProductionEntries,
  type EstimatedProductionEntryScope,
} from "../services/production/estimated-production-entry.service";

const scopeKey = (scope: EstimatedProductionEntryScope | null) =>
  scope
    ? [scope.buyerCode, scope.order, scope.typeCode, scope.styleCode, scope.lineCode]
    : [];

export const useGetEstimatedProductionEntries = (scope: EstimatedProductionEntryScope | null) => {
  return useQuery<EstimatedProductionEntry[], Error>({
    queryKey: ["estimatedProductionEntries", ...scopeKey(scope)],
    queryFn: async () => {
      const response: AxiosResponse<EstimatedProductionEntry[]> =
        await loadEstimatedProductionEntries(scope!);
      return response.data;
    },
    enabled: !!scope,
  });
};

export const useBulkSaveEstimatedProductionEntriesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    EstimatedProductionEntry[],
    Error,
    { scope: EstimatedProductionEntryScope; unit: string; records: EstimatedProductionEntry[] }
  >({
    mutationFn: async ({ scope, unit, records }) => {
      const payload = records.map((r) => ({ date: r.date, unit, quantity: r.quantity }));
      const response: AxiosResponse<EstimatedProductionEntry[]> =
        await bulkSaveEstimatedProductionEntries(scope, payload);
      return response.data;
    },
    onSuccess: (_, { scope }) => {
      queryClient.invalidateQueries({ queryKey: ["estimatedProductionEntries", ...scopeKey(scope)] });
      toast.success("Estimated production entries saved successfully");
    },
    onError: (error) => toast.error(`Save failed: ${error.message}`),
  });
};
