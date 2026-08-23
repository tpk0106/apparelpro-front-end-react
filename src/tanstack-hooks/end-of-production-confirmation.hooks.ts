// TanStack Query hooks for Production Control -> End of Production Confirmation, PR_ENDPR.PRG.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { EndOfProductionStatus } from "../interfaces/production/EndOfProductionStatus";
import { loadEndOfProductionStatus, confirmEndOfProduction } from "../services/production/end-of-production-confirmation.service";

type StyleScope = { buyerCode: number; order: string; typeCode: number; styleCode: string };

export const useGetEndOfProductionStatus = (scope: StyleScope | null) => {
  return useQuery<EndOfProductionStatus, Error>({
    queryKey: ["endOfProductionStatus", scope?.buyerCode, scope?.order, scope?.typeCode, scope?.styleCode],
    queryFn: async () => {
      const response: AxiosResponse<EndOfProductionStatus> =
        await loadEndOfProductionStatus(scope!.buyerCode, scope!.order, scope!.typeCode, scope!.styleCode);
      return response.data;
    },
    enabled: !!scope,
    retry: false,
  });
};

export const useConfirmEndOfProductionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<EndOfProductionStatus, Error, StyleScope & { endDate: string }>({
    mutationFn: async ({ buyerCode, order, typeCode, styleCode, endDate }) => {
      const response: AxiosResponse<EndOfProductionStatus> =
        await confirmEndOfProduction(buyerCode, order, typeCode, styleCode, endDate);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endOfProductionStatus"] });
    },
  });
};
