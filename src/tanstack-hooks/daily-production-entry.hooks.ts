// TanStack Query hooks for Actual Production Entry (PR_DPRO2.PRG).

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { toast } from "react-toastify";

import type { DailyProductionEntry } from "../interfaces/production/DailyProductionEntry";
import type { ProductionLineAllocation } from "../interfaces/production/ProductionLineAllocation";
import {
  loadDailyProductionEntries,
  bulkSaveDailyProductionEntries,
  type DailyProductionEntryScope,
} from "../services/production/daily-production-entry.service";
import { loadAllocationsByLine } from "../services/production/production-line-allocation.service";

const scopeKey = (date: string | null, scope: DailyProductionEntryScope | null) =>
  scope && date
    ? [date, scope.buyerCode, scope.order, scope.typeCode, scope.styleCode, scope.lineCode]
    : [];

export const useGetDailyProductionEntries = (
  date: string | null,
  scope: DailyProductionEntryScope | null,
) => {
  return useQuery<DailyProductionEntry[], Error>({
    queryKey: ["dailyProductionEntries", ...scopeKey(date, scope)],
    queryFn: async () => {
      const response: AxiosResponse<DailyProductionEntry[]> =
        await loadDailyProductionEntries(date!, scope!);
      return response.data;
    },
    enabled: !!date && !!scope,
  });
};

// Lets the workspace warn the user, before saving, whether the chosen date
// is going to slip this style's schedule on this line - mirrors exactly
// which allocation the backend itself treats as "the current slot"
// (last by start date).
export const useGetCurrentLineAllocation = (scope: DailyProductionEntryScope | null) => {
  return useQuery<ProductionLineAllocation | null, Error>({
    queryKey: ["productionLineAllocationsByLine", scope?.buyerCode, scope?.order, scope?.typeCode, scope?.styleCode, scope?.lineCode],
    queryFn: async () => {
      const response: AxiosResponse<ProductionLineAllocation[]> = await loadAllocationsByLine(
        scope!.buyerCode, scope!.order, scope!.typeCode, scope!.styleCode, scope!.lineCode,
      );
      return response.data.length > 0 ? response.data[response.data.length - 1] : null;
    },
    enabled: !!scope,
  });
};

export const useBulkSaveDailyProductionEntriesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    DailyProductionEntry[],
    Error,
    {
      date: string;
      scope: DailyProductionEntryScope;
      records: { sectionCode: string; hours: number; unit: string; quantity: number }[];
    }
  >({
    mutationFn: async ({ date, scope, records }) => {
      const response: AxiosResponse<DailyProductionEntry[]> =
        await bulkSaveDailyProductionEntries(date, scope, records);
      return response.data;
    },
    onSuccess: (_, { date, scope }) => {
      queryClient.invalidateQueries({ queryKey: ["dailyProductionEntries", ...scopeKey(date, scope)] });
      queryClient.invalidateQueries({ queryKey: ["productionLineAllocationsByLine"] });
      toast.success("Actual production entries saved successfully");
    },
    onError: (error) => toast.error(`Save failed: ${error.message}`),
  });
};
