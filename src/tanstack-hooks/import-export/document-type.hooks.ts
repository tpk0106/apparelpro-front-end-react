import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { DocumentType } from "../../interfaces/import-export/ImportExport";
import {
  loadDocumentTypes,
  createDocumentType,
  updateDocumentType,
  deleteDocumentType,
} from "../../services/import-export/document-type.service";

const DOCUMENT_TYPE_QUERY_KEY = ["importExport", "documentTypes"];

export const useGetDocumentTypes = () => {
  return useQuery<DocumentType[], Error>({
    queryKey: DOCUMENT_TYPE_QUERY_KEY,
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<DocumentType>> = await loadDocumentTypes();
      return response.data.items;
    },
  });
};

// Handles both add and update: pass isNew=true (no existing row - i.e. no id
// yet) to POST, false to PUT with the existing id.
export const useSaveDocumentType = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, { payload: Omit<DocumentType, "id">; id?: number; isNew: boolean }>({
    mutationFn: async ({ payload, id, isNew }) => {
      if (isNew || !id) {
        await createDocumentType(payload);
      } else {
        await updateDocumentType(id, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENT_TYPE_QUERY_KEY });
    },
  });
};

export const useDeleteDocumentType = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, number>({
    mutationFn: async (id) => {
      await deleteDocumentType(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENT_TYPE_QUERY_KEY });
    },
  });
};
