// TanStack Query hooks for Reports -> G. Manpower Requirement, PR_REP3.PRG.

import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { ManpowerRequirementReport } from "../interfaces/production/ManpowerRequirementReport";
import {
  loadManpowerRequirementReport,
  downloadManpowerRequirementReportPdf,
} from "../services/production/manpower-requirement-report.service";

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

type StyleScope = { buyerCode: number; order: string; typeCode: number; styleCode: string; lineCode: string | null };

export const useGetManpowerRequirementReport = (scope: StyleScope | null) => {
  return useQuery<ManpowerRequirementReport, Error>({
    queryKey: ["manpowerRequirementReport", scope?.buyerCode, scope?.order, scope?.typeCode, scope?.styleCode, scope?.lineCode],
    queryFn: async () => {
      const response: AxiosResponse<ManpowerRequirementReport> = await loadManpowerRequirementReport(
        scope!.buyerCode, scope!.order, scope!.typeCode, scope!.styleCode, scope!.lineCode,
      );
      return response.data;
    },
    enabled: !!scope,
    retry: false,
  });
};

export const useDownloadManpowerRequirementReportPdfMutation = () => {
  return useMutation<void, Error, StyleScope>({
    mutationFn: async (scope) => {
      const response = await downloadManpowerRequirementReportPdf(
        scope.buyerCode, scope.order, scope.typeCode, scope.styleCode, scope.lineCode,
      );
      downloadPdfBlob(response.data, `ManpowerRequirement_${scope.buyerCode}_${scope.order}_${scope.styleCode}.pdf`);
    },
  });
};
