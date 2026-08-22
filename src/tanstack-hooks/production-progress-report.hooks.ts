// TanStack Query hooks for Production Control -> Production Progress Graph, PR_PROG.PRG.

import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { ProductionProgressReport } from "../interfaces/production/ProductionProgressReport";
import { loadProductionProgressReport } from "../services/production/production-progress-report.service";

type StyleScope = { buyerCode: number; order: string; typeCode: number; styleCode: string };

export const useGetProductionProgressReport = (scope: StyleScope | null) => {
  return useQuery<ProductionProgressReport, Error>({
    queryKey: ["productionProgressReport", scope?.buyerCode, scope?.order, scope?.typeCode, scope?.styleCode],
    queryFn: async () => {
      const response: AxiosResponse<ProductionProgressReport> =
        await loadProductionProgressReport(scope!.buyerCode, scope!.order, scope!.typeCode, scope!.styleCode);
      return response.data;
    },
    enabled: !!scope,
    retry: false,
  });
};
