// TanStack Query hooks for the two style-scoped Production Control screens
// (PR_OPD1.PRG / PR_OPD2.PRG): Style Component Breakdown and Style Operation
// Breakdown. Kept separate from production-reference.hooks.ts since these
// operate on style-scoped transactional data (bulk-save/recalculate), not
// flat paginated reference masters.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { toast } from "react-toastify";

import type { StyleScope } from "../components/production/style-scope/style-scope-picker.component";
import type { StyleComponentBreakdown } from "../interfaces/production/StyleComponentBreakdown";
import {
  loadComponentBreakdownByStyle,
  bulkSaveComponentBreakdown,
} from "../services/production/style-component-breakdown.service";

import type {
  StyleOperationBreakdown,
  StyleOperationBreakdownSaveResult,
} from "../interfaces/production/StyleOperationBreakdown";
import {
  loadOperationBreakdownByStyle,
  seedOperationBreakdownFromTemplate,
  bulkSaveOperationBreakdown,
} from "../services/production/style-operation-breakdown.service";

const scopeKey = (scope: StyleScope | null) =>
  scope ? [scope.buyerCode, scope.order, scope.typeCode, scope.styleCode] : [];

// ---------------------------------------------------------------------------
// Style Component Breakdown
// ---------------------------------------------------------------------------

export const useGetComponentBreakdownByStyle = (scope: StyleScope | null) => {
  return useQuery<StyleComponentBreakdown[], Error>({
    queryKey: ["componentBreakdown", ...scopeKey(scope)],
    queryFn: async () => {
      const response: AxiosResponse<StyleComponentBreakdown[]> =
        await loadComponentBreakdownByStyle(scope!);
      return response.data;
    },
    enabled: !!scope,
  });
};

export const useBulkSaveComponentBreakdownMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { scope: StyleScope; records: StyleComponentBreakdown[] }
  >({
    mutationFn: async ({ scope, records }) => {
      await bulkSaveComponentBreakdown(scope, records);
    },
    onSuccess: (_, { scope }) => {
      queryClient.invalidateQueries({ queryKey: ["componentBreakdown", ...scopeKey(scope)] });
      toast.success("Component breakdown saved successfully");
    },
    onError: (error) => toast.error(`Save failed: ${error.message}`),
  });
};

// ---------------------------------------------------------------------------
// Style Operation Breakdown
// ---------------------------------------------------------------------------

export const useGetOperationBreakdownByStyle = (scope: StyleScope | null) => {
  return useQuery<StyleOperationBreakdown[], Error>({
    queryKey: ["operationBreakdown", ...scopeKey(scope)],
    queryFn: async () => {
      const response: AxiosResponse<StyleOperationBreakdown[]> =
        await loadOperationBreakdownByStyle(scope!);
      return response.data;
    },
    enabled: !!scope,
  });
};

export const useSeedOperationBreakdownFromTemplateMutation = () => {
  return useMutation<
    StyleOperationBreakdown[],
    Error,
    { scope: StyleScope; componentSequence: number; componentCode: string }
  >({
    mutationFn: async ({ scope, componentSequence, componentCode }) => {
      const response: AxiosResponse<StyleOperationBreakdown[]> =
        await seedOperationBreakdownFromTemplate(scope, componentSequence, componentCode);
      return response.data;
    },
    onError: (error) => toast.error(`Could not load operation template: ${error.message}`),
  });
};

export const useBulkSaveOperationBreakdownMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    StyleOperationBreakdownSaveResult,
    Error,
    { scope: StyleScope; records: StyleOperationBreakdown[] }
  >({
    mutationFn: async ({ scope, records }) => {
      const response: AxiosResponse<StyleOperationBreakdownSaveResult> =
        await bulkSaveOperationBreakdown(scope, records);
      return response.data;
    },
    onSuccess: (_, { scope }) => {
      queryClient.invalidateQueries({ queryKey: ["operationBreakdown", ...scopeKey(scope)] });
      toast.success("Operation breakdown saved and recalculated");
    },
    onError: (error) => toast.error(`Save failed: ${error.message}`),
  });
};
