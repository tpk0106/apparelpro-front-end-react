import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { ClearanceOffice } from "../../interfaces/import-export/ImportExport";
import {
  loadClearanceOffices,
  createClearanceOffice,
  updateClearanceOffice,
  deleteClearanceOffice,
} from "../../services/import-export/clearance-office.service";

const CLEARANCE_OFFICE_QUERY_KEY = ["importExport", "clearanceOffices"];

export const useGetClearanceOffices = () => {
  return useQuery<ClearanceOffice[], Error>({
    queryKey: CLEARANCE_OFFICE_QUERY_KEY,
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<ClearanceOffice>> = await loadClearanceOffices();
      return response.data.items;
    },
  });
};

// Handles both add and update: pass isNew=true (no existing row for this
// code) to POST, false to PUT.
export const useSaveClearanceOffice = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, { payload: ClearanceOffice; isNew: boolean }>({
    mutationFn: async ({ payload, isNew }) => {
      if (isNew) {
        await createClearanceOffice(payload);
      } else {
        await updateClearanceOffice(payload.code, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLEARANCE_OFFICE_QUERY_KEY });
    },
  });
};

export const useDeleteClearanceOffice = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, string>({
    mutationFn: async (code) => {
      await deleteClearanceOffice(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLEARANCE_OFFICE_QUERY_KEY });
    },
  });
};
