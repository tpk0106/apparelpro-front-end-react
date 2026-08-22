// TanStack Query hooks for Reports -> L. Production Analysis Summary (for Style), PR_MPRO2.PRG.

import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { ProductionAnalysisSummaryReport } from "../interfaces/production/ProductionAnalysisSummaryReport";
import {
  loadProductionAnalysisSummaryReport,
  downloadProductionAnalysisSummaryReportPdf,
} from "../services/production/production-analysis-summary-report.service";

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

export const useGetProductionAnalysisSummaryReport = (scope: StyleScope | null) => {
  return useQuery<ProductionAnalysisSummaryReport, Error>({
    queryKey: ["productionAnalysisSummaryReport", scope?.buyerCode, scope?.order, scope?.typeCode, scope?.styleCode],
    queryFn: async () => {
      const response: AxiosResponse<ProductionAnalysisSummaryReport> =
        await loadProductionAnalysisSummaryReport(scope!.buyerCode, scope!.order, scope!.typeCode, scope!.styleCode);
      return response.data;
    },
    enabled: !!scope,
    retry: false,
  });
};

export const useDownloadProductionAnalysisSummaryReportPdfMutation = () => {
  return useMutation<void, Error, StyleScope>({
    mutationFn: async (scope) => {
      const response = await downloadProductionAnalysisSummaryReportPdf(scope.buyerCode, scope.order, scope.typeCode, scope.styleCode);
      downloadPdfBlob(response.data, `ProductionAnalysisSummary_${scope.buyerCode}_${scope.order}_${scope.styleCode}.pdf`);
    },
  });
};
