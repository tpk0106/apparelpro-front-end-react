import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import type { CertificateOfOriginDetail } from "../../interfaces/import-export/ImportExport";
import {
  loadCertificateOfOriginByInvoiceNumber, saveCertificateOfOrigin, deleteCertificateOfOrigin,
  downloadCertificateOfOriginPrintPdf, type CertificateOfOriginPrintFormat,
} from "../../services/import-export/certificate-of-origin.service";

// A brand-new invoice legitimately has no Certificate of Origin yet - the
// backend 404s in that case, which is expected, not an error state. Resolves
// to null instead of throwing so the dialog can just start blank.
export const useGetCertificateOfOrigin = (invoiceNumber: string | null) => {
  return useQuery<CertificateOfOriginDetail | null, Error>({
    queryKey: ["importExport", "certificateOfOrigin", invoiceNumber],
    queryFn: async () => {
      try {
        const response: AxiosResponse<CertificateOfOriginDetail> =
          await loadCertificateOfOriginByInvoiceNumber(invoiceNumber!);
        return response.data;
      } catch (err) {
        if ((err as AppError)?.status === 404) return null;
        throw err;
      }
    },
    enabled: !!invoiceNumber,
  });
};

export const useSaveCertificateOfOrigin = () => {
  const queryClient = useQueryClient();
  return useMutation<CertificateOfOriginDetail, AppError, CertificateOfOriginDetail>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<CertificateOfOriginDetail> = await saveCertificateOfOrigin(payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["importExport", "certificateOfOrigin", data.header.invoiceNumber] });
    },
  });
};

// PDF export is a one-shot side effect, not cached data - triggers a browser
// download from the returned blob, same shape as
// useDownloadCommercialInvoicePrintPdf.
export const useDownloadCertificateOfOriginPrintPdf = () => {
  return useMutation<void, AppError, { invoiceNumber: string; format: CertificateOfOriginPrintFormat }>({
    mutationFn: async ({ invoiceNumber, format }) => {
      const response = await downloadCertificateOfOriginPrintPdf(invoiceNumber, format);
      const safeInvoiceNumber = invoiceNumber.replace(/\//g, "-");
      const fileNamePrefix = format === "chamber" ? "Chamber_CertificateOfOrigin" : "CertificateOfOrigin";
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${fileNamePrefix}_${safeInvoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};

export const useDeleteCertificateOfOrigin = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, string>({
    mutationFn: async (invoiceNumber) => {
      await deleteCertificateOfOrigin(invoiceNumber);
    },
    onSuccess: (_data, invoiceNumber) => {
      queryClient.invalidateQueries({ queryKey: ["importExport", "certificateOfOrigin", invoiceNumber] });
    },
  });
};
