import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import type { ValueDeclarationDetail } from "../../interfaces/import-export/ImportExport";
import {
  loadValueDeclarationByInvoiceNumber, saveValueDeclarationForInvoice, deleteValueDeclarationForInvoice,
  downloadValueDeclarationPrintPdfForInvoice,
} from "../../services/import-export/value-declaration-invoice.service";

// A brand-new invoice legitimately has no Value Declaration yet - the
// backend 404s in that case, which is expected, not an error state.
// Resolves to null instead of throwing so the dialog can just start blank.
export const useGetValueDeclarationByInvoice = (invoiceNumber: string | null) => {
  return useQuery<ValueDeclarationDetail | null, Error>({
    queryKey: ["importExport", "valueDeclarationByInvoice", invoiceNumber],
    queryFn: async () => {
      try {
        const response: AxiosResponse<ValueDeclarationDetail> = await loadValueDeclarationByInvoiceNumber(invoiceNumber!);
        return response.data;
      } catch (err) {
        if ((err as AppError)?.status === 404) return null;
        throw err;
      }
    },
    enabled: !!invoiceNumber,
  });
};

export const useSaveValueDeclarationForInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation<ValueDeclarationDetail, AppError, ValueDeclarationDetail>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<ValueDeclarationDetail> = await saveValueDeclarationForInvoice(payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["importExport", "valueDeclarationByInvoice", data.header.invoiceNumber] });
    },
  });
};

export const useDeleteValueDeclarationForInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, string>({
    mutationFn: async (invoiceNumber) => {
      await deleteValueDeclarationForInvoice(invoiceNumber);
    },
    onSuccess: (_data, invoiceNumber) => {
      queryClient.invalidateQueries({ queryKey: ["importExport", "valueDeclarationByInvoice", invoiceNumber] });
    },
  });
};

// PDF export is a one-shot side effect, not cached data - triggers a browser
// download from the returned blob, same shape as the other IE print hooks.
export const useDownloadValueDeclarationPrintPdfForInvoice = () => {
  return useMutation<void, AppError, { invoiceNumber: string }>({
    mutationFn: async ({ invoiceNumber }) => {
      const response = await downloadValueDeclarationPrintPdfForInvoice(invoiceNumber);
      const safeInvoiceNumber = invoiceNumber.replace(/\//g, "-");
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `ValueDeclaration_${safeInvoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
