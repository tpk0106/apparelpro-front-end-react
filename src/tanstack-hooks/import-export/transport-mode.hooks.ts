import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { TransportMode } from "../../interfaces/import-export/ImportExport";
import {
  loadTransportModes,
  createTransportMode,
  updateTransportMode,
  deleteTransportMode,
} from "../../services/import-export/transport-mode.service";

const TRANSPORT_MODE_QUERY_KEY = ["importExport", "transportModes"];

export const useGetTransportModes = () => {
  return useQuery<TransportMode[], Error>({
    queryKey: TRANSPORT_MODE_QUERY_KEY,
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<TransportMode>> = await loadTransportModes();
      return response.data.items;
    },
  });
};

export const useSaveTransportMode = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, { payload: TransportMode; isNew: boolean }>({
    mutationFn: async ({ payload, isNew }) => {
      if (isNew) {
        await createTransportMode(payload);
      } else {
        await updateTransportMode(payload.code, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSPORT_MODE_QUERY_KEY });
    },
  });
};

export const useDeleteTransportMode = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, string>({
    mutationFn: async (code) => {
      await deleteTransportMode(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSPORT_MODE_QUERY_KEY });
    },
  });
};
