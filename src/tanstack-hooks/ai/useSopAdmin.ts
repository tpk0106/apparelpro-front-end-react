// ═══════════════════════════════════════════════════════════════════════════
//  useSopAdmin.ts — TanStack Query Hooks for SOP Admin CRUD
//  Location: src/tanstack-hooks/ai/useSopAdmin.ts
// ═══════════════════════════════════════════════════════════════════════════
//
// 🎓 WHAT IS THIS FILE?
// TanStack Query hooks for the SOP Admin page. These handle:
//   • Data fetching with caching and pagination (useQuery)
//   • Create/Update/Delete mutations with cache invalidation (useMutation)
//   • Toast notifications for success/error feedback
//
// 🎓 PATTERN:
// Follows the same structure as the Bank hooks in custom-hooks.ts:
//   • Query key pattern: ["sops", pageIndex, pageSize] for automatic refetch
//   • Cache invalidation: invalidateQueries({ queryKey: ["sops"] }) on mutation success
//   • Error handling: toast.error with the error message
//
// 🎓 WHY A SEPARATE FILE (not in custom-hooks.ts)?
// The custom-hooks.ts file is already 73KB and growing. Following the AI
// hooks pattern (useRagQuery.ts, useAiChat.ts), SOP hooks live in their
// own file under tanstack-hooks/ai/ for better maintainability.
// ═══════════════════════════════════════════════════════════════════════════

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { PaginationData } from "../../interfaces/definitions";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import {
  loadSops,
  loadSopById,
  createSop,
  updateSop,
  deleteSop,
  type SopApiModel,
  type CreateSopApiModel,
  type UpdateSopApiModel,
} from "../../services/ai/sop.service";
import { toast } from "react-toastify";

// ─── Query Keys ──────────────────────────────────────────────
// 🎓 Centralised query keys for cache management.
// TanStack Query uses these keys to:
//   1. Cache responses (same key = cache hit)
//   2. Know which queries to invalidate after a mutation
//   3. Auto-refetch when key dependencies change (pageIndex, pageSize)

export const sopKeys = {
  all: ["sops"] as const,
  list: (pageIndex: number, pageSize: number) =>
    ["sops", pageIndex, pageSize] as const,
  detail: (sopId: number) => ["sops", "detail", sopId] as const,
} as const;

// ─── Fetch paginated list ────────────────────────────────────
// 🎓 GET /api/sop/list — paginated, sortable, filterable.
// Same pattern as useGetBanksQuery in custom-hooks.ts.

export const useGetSopsQuery = (paginate: PaginationData) => {
  return useQuery<PaginationAPIModel<SopApiModel>, Error>({
    queryKey: sopKeys.list(paginate.pageIndex, paginate.pageSize),
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<SopApiModel>> =
        await loadSops(paginate);
      return response.data;
    },
    // 🎓 placeholderData keeps old page data visible while loading
    // the next page — prevents the table from "blanking" during navigation.
    placeholderData: (previousData) => previousData,
  });
};

// ─── Fetch single SOP by ID ─────────────────────────────────
// 🎓 GET /api/sop/{id} — returns full SOP with nested applicability rules.
// Used by the edit dialog to load the complete SOP before editing.

export const useGetSopByIdQuery = (sopId: number | null) => {
  return useQuery<SopApiModel, Error>({
    queryKey: sopKeys.detail(sopId ?? 0),
    queryFn: async () => {
      const response: AxiosResponse<SopApiModel> = await loadSopById(sopId!);
      return response.data;
    },
    // 🎓 Only fetch when sopId is provided (dialog is open for editing).
    enabled: sopId !== null && sopId > 0,
  });
};

// ─── Create SOP mutation ─────────────────────────────────────
// 🎓 POST /api/sop — creates a new SOP + applicability rules.

export const useCreateSopMutation = (): UseMutationResult<
  void,
  Error,
  CreateSopApiModel
> => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CreateSopApiModel>({
    mutationFn: async (newSop: CreateSopApiModel) => {
      await createSop(newSop);
    },
    onSuccess: () => {
      // 🎓 Invalidate ALL sop queries so the table refreshes with the new record.
      queryClient.invalidateQueries({ queryKey: sopKeys.all });
      toast.success("SOP created successfully");
    },
    onError: (error) => {
      toast.error(`SOP creation failed: ${error.message}`);
    },
  });
};

// ─── Update SOP mutation ─────────────────────────────────────
// 🎓 PUT /api/sop — updates existing SOP + replaces applicability rules.

export const useUpdateSopMutation = (): UseMutationResult<
  void,
  Error,
  UpdateSopApiModel
> => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateSopApiModel>({
    mutationFn: async (updatedSop: UpdateSopApiModel) => {
      await updateSop(updatedSop);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sopKeys.all });
      toast.success("SOP updated successfully");
    },
    onError: (error) => {
      toast.error(`SOP update failed: ${error.message}`);
    },
  });
};

// ─── Delete SOP mutation ─────────────────────────────────────
// 🎓 DELETE /api/sop/{id} — soft delete (sets IsActive = false).

export const useDeleteSopMutation = (): UseMutationResult<
  void,
  Error,
  number
> => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (sopId: number) => {
      await deleteSop(sopId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sopKeys.all });
      toast.success("SOP deactivated successfully");
    },
    onError: (error) => {
      toast.error(`SOP deletion failed: ${error.message}`);
    },
  });
};
