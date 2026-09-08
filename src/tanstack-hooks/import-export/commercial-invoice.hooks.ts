import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type {
  CommercialInvoiceDetail, CommercialInvoiceHeader,
} from "../../interfaces/import-export/ImportExport";
import {
  loadCommercialInvoices, loadCommercialInvoiceByNumber, saveCommercialInvoice, deleteCommercialInvoice,
  downloadCommercialInvoicePrintPdf,
  type CommercialInvoiceListParams, type CommercialInvoicePrintFormat,
} from "../../services/import-export/commercial-invoice.service";
import { loadOpenPartShipmentsByBuyer } from "../../services/import-export/part-shipment-lookup.service";
import type { PartShipmentRow } from "../../components/part-shipment/part-shipments.types";

export const useGetCommercialInvoices = (params: CommercialInvoiceListParams) => {
  return useQuery<PaginationAPIModel<CommercialInvoiceHeader>, Error>({
    queryKey: ["importExport", "commercialInvoices", params],
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<CommercialInvoiceHeader>> =
        await loadCommercialInvoices(params);
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useGetCommercialInvoice = (invoiceNumber: string | null) => {
  return useQuery<CommercialInvoiceDetail, Error>({
    queryKey: ["importExport", "commercialInvoice", invoiceNumber],
    queryFn: async () => {
      const response: AxiosResponse<CommercialInvoiceDetail> = await loadCommercialInvoiceByNumber(invoiceNumber!);
      return response.data;
    },
    enabled: !!invoiceNumber,
  });
};

export const useSaveCommercialInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation<CommercialInvoiceDetail, AppError, CommercialInvoiceDetail>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<CommercialInvoiceDetail> = await saveCommercialInvoice(payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["importExport", "commercialInvoices"] });
      queryClient.invalidateQueries({ queryKey: ["importExport", "commercialInvoice", data.header.invoiceNumber] });
    },
  });
};

export const useGetOpenPartShipmentsByBuyer = (buyerCode: number) => {
  return useQuery<PartShipmentRow[], Error>({
    queryKey: ["importExport", "openPartShipments", buyerCode],
    queryFn: async () => {
      const response: AxiosResponse<PartShipmentRow[]> = await loadOpenPartShipmentsByBuyer(buyerCode);
      return response.data;
    },
    enabled: !!buyerCode,
  });
};

// PDF export is a one-shot side effect, not cached data - triggers a browser
// download from the returned blob, same shape as useDownloadSrnPrintPdfMutation.
export const useDownloadCommercialInvoicePrintPdf = () => {
  return useMutation<void, AppError, { invoiceNumber: string; format: CommercialInvoicePrintFormat; printAssessmentNo: boolean }>({
    mutationFn: async ({ invoiceNumber, format, printAssessmentNo }) => {
      const response = await downloadCommercialInvoicePrintPdf(invoiceNumber, format, printAssessmentNo);
      const safeInvoiceNumber = invoiceNumber.replace(/\//g, "-");
      const fileNamePrefix = format === "fedex" ? "International_CommercialInvoice"
        : format === "srilanka" ? "SriLanka_CommercialInvoice"
        : "CommercialInvoice";
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

export const useDeleteCommercialInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, string>({
    mutationFn: async (invoiceNumber) => {
      await deleteCommercialInvoice(invoiceNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["importExport", "commercialInvoices"] });
    },
  });
};
