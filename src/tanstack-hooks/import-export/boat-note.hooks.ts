import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import type { BoatNoteDetail } from "../../interfaces/import-export/ImportExport";
import {
  loadBoatNoteByInvoiceNumber, saveBoatNote, deleteBoatNote, downloadBoatNotePrintPdf,
} from "../../services/import-export/boat-note.service";

// A brand-new invoice legitimately has no Boat Note yet - the backend 404s
// in that case, which is expected, not an error state. Resolves to null
// instead of throwing so the dialog can just start blank.
export const useGetBoatNote = (invoiceNumber: string | null) => {
  return useQuery<BoatNoteDetail | null, Error>({
    queryKey: ["importExport", "boatNote", invoiceNumber],
    queryFn: async () => {
      try {
        const response: AxiosResponse<BoatNoteDetail> = await loadBoatNoteByInvoiceNumber(invoiceNumber!);
        return response.data;
      } catch (err) {
        if ((err as AppError)?.status === 404) return null;
        throw err;
      }
    },
    enabled: !!invoiceNumber,
  });
};

export const useSaveBoatNote = () => {
  const queryClient = useQueryClient();
  return useMutation<BoatNoteDetail, AppError, BoatNoteDetail>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<BoatNoteDetail> = await saveBoatNote(payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["importExport", "boatNote", data.header.invoiceNumber] });
    },
  });
};

// PDF export is a one-shot side effect, not cached data - triggers a browser
// download from the returned blob, same shape as the other IE print hooks.
export const useDownloadBoatNotePrintPdf = () => {
  return useMutation<void, AppError, { invoiceNumber: string }>({
    mutationFn: async ({ invoiceNumber }) => {
      const response = await downloadBoatNotePrintPdf(invoiceNumber);
      const safeInvoiceNumber = invoiceNumber.replace(/\//g, "-");
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `BoatNote_${safeInvoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};

export const useDeleteBoatNote = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, string>({
    mutationFn: async (invoiceNumber) => {
      await deleteBoatNote(invoiceNumber);
    },
    onSuccess: (_data, invoiceNumber) => {
      queryClient.invalidateQueries({ queryKey: ["importExport", "boatNote", invoiceNumber] });
    },
  });
};
