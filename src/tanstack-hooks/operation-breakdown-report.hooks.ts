// TanStack Query hooks for Reports -> F. Operation Breakdown, PR_REP1.PRG.

import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { OperationBreakdownReport } from "../interfaces/production/OperationBreakdownReport";
import {
  loadOperationBreakdownReport,
  downloadOperationBreakdownReportPdf,
} from "../services/production/operation-breakdown-report.service";

const downloadPdfBlob = (blob: Blob, fileName: string) => {
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

type StyleScope = { buyerCode: number; order: string; typeCode: number; styleCode: string };

export const useGetOperationBreakdownReport = (scope: StyleScope | null) => {
  return useQuery<OperationBreakdownReport, Error>({
    queryKey: ["operationBreakdownReport", scope?.buyerCode, scope?.order, scope?.typeCode, scope?.styleCode],
    queryFn: async () => {
      const response: AxiosResponse<OperationBreakdownReport> =
        await loadOperationBreakdownReport(scope!.buyerCode, scope!.order, scope!.typeCode, scope!.styleCode);
      return response.data;
    },
    enabled: !!scope,
    retry: false,
  });
};

export const useDownloadOperationBreakdownReportPdfMutation = () => {
  return useMutation<void, Error, StyleScope>({
    mutationFn: async (scope) => {
      const response = await downloadOperationBreakdownReportPdf(scope.buyerCode, scope.order, scope.typeCode, scope.styleCode);
      downloadPdfBlob(response.data, `OperationBreakdown_${scope.buyerCode}_${scope.order}_${scope.styleCode}.pdf`);
    },
  });
};
