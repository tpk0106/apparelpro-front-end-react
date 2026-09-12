import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { client } from "../../auth/axiosClient";
import type { AppError } from "../../auth/axiosClient";
import type { PackingListDetail, SavePackingList } from "../../interfaces/import-export/ImportExport";
import {
  loadPackingListByLineKey, savePackingList, downloadPackingListPrintPdf,
} from "../../services/import-export/packing-list.service";
import type { PackingListPrintFormat } from "../../services/import-export/packing-list.service";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";

interface LineKey {
  invoiceNumber: string;
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  newOrder: string;
}

export const useGetPackingList = (key: LineKey | null) => {
  return useQuery<PackingListDetail, Error>({
    queryKey: ["importExport", "packingList", key],
    queryFn: async () => {
      const response: AxiosResponse<PackingListDetail> = await loadPackingListByLineKey(
        key!.invoiceNumber, key!.buyerCode, key!.order, key!.typeCode, key!.styleCode, key!.newOrder,
      );
      return response.data;
    },
    enabled: !!key,
  });
};

export const useSavePackingList = () => {
  const queryClient = useQueryClient();
  return useMutation<PackingListDetail, AppError, SavePackingList>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<PackingListDetail> = await savePackingList(payload);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["importExport", "packingList", {
          invoiceNumber: variables.invoiceNumber, buyerCode: variables.buyerCode, order: variables.order,
          typeCode: variables.typeCode, styleCode: variables.styleCode, newOrder: variables.newOrder,
        }],
      });
    },
  });
};

export const useDownloadPackingListPrintPdf = () => {
  return useMutation<void, AppError, LineKey & { format: PackingListPrintFormat }>({
    mutationFn: async ({ invoiceNumber, buyerCode, order, typeCode, styleCode, newOrder, format }) => {
      const response = await downloadPackingListPrintPdf(invoiceNumber, buyerCode, order, typeCode, styleCode, newOrder, format);
      const safeInvoiceNumber = invoiceNumber.replace(/\//g, "-");
      const prefix = format === "cartons" ? "PackingList_Cartons" : "PackingList_HangingGarments";
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${prefix}_${safeInvoiceNumber}_${styleCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};

// Real sizes (and their colors) for a given style, driving the dynamic
// per-size columns in the Carton/Container breakdown grid - reuses the
// existing color/size matrix endpoint (already built for Order
// Confirmation's own color/size breakdown screen) rather than adding a
// new one.
interface ColorSizeMatrixRow {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  color: string;
  size: string;
  ratio: number;
  qty: number;
  description?: string | null;
}

export const useGetStyleColorSizeMatrix = (
  buyerCode: number | null, order: string | null, typeCode: number | null, styleCode: string | null,
) => {
  return useQuery<ColorSizeMatrixRow[], Error>({
    queryKey: ["importExport", "packingList", "colorSizeMatrix", buyerCode, order, typeCode, styleCode],
    queryFn: async () => {
      const response: AxiosResponse<ColorSizeMatrixRow[]> = await client.get(
        APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.COLOR_SIZE_DETAILS.GET_COLOR_SIZE_MATRIX,
        { params: { buyerCode, order, typeCode, styleCode } },
      );
      return response.data;
    },
    enabled: !!buyerCode && !!order && !!styleCode,
  });
};
