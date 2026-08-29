import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";

interface NotePrintReportServicePair<TDetails> {
  getPrintDetails: (documentNumber: string) => Promise<AxiosResponse<TDetails>>;
  downloadPrintPdf: (documentNumber: string) => Promise<AxiosResponse<Blob>>;
}

// Pairs with services/reports/note-print-report.factory.ts - every note print report
// wraps its service pair in the exact same "load details by number" query + "download
// and save a PDF" mutation. Only the TanStack queryKey and the saved filename prefix
// differ per note.
export function createNotePrintReportHooks<TDetails>(
  service: NotePrintReportServicePair<TDetails>,
  queryKeyPrefix: string,
  downloadFilenamePrefix: string,
) {
  const usePrintDetailsQuery = (documentNumber: string, enabled: boolean) => {
    return useQuery<TDetails, AppError>({
      queryKey: [queryKeyPrefix, documentNumber],
      queryFn: async () => {
        const response = await service.getPrintDetails(documentNumber);
        return response.data;
      },
      enabled,
      retry: false,
    });
  };

  const useDownloadPdfMutation = () => {
    return useMutation<void, AppError, string>({
      mutationFn: async (documentNumber) => {
        const response = await service.downloadPrintPdf(documentNumber);
        const blobUrl = window.URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${downloadFilenamePrefix}_${documentNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(blobUrl);
      },
    });
  };

  return { usePrintDetailsQuery, useDownloadPdfMutation };
}
