import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import type { SaveToolbarPreference, ToolbarPreference } from "../interfaces/toolbar/Toolbar";
import { loadToolbarPreferences, saveToolbarPreferences } from "../services/toolbar/toolbar.service";

const TOOLBAR_QUERY_KEY = ["toolbar", "preferences"];

export const useGetToolbarPreferences = () => {
  return useQuery<ToolbarPreference, Error>({
    queryKey: TOOLBAR_QUERY_KEY,
    queryFn: async () => {
      const response: AxiosResponse<ToolbarPreference> = await loadToolbarPreferences();
      return response.data;
    },
  });
};

export const useSaveToolbarPreferences = () => {
  const queryClient = useQueryClient();
  return useMutation<ToolbarPreference, AppError, SaveToolbarPreference>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<ToolbarPreference> = await saveToolbarPreferences(payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(TOOLBAR_QUERY_KEY, data);
    },
  });
};
