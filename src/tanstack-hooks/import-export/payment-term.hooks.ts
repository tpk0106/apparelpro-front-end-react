import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { PaymentTerm } from "../../interfaces/import-export/ImportExport";
import {
  loadPaymentTerms,
  createPaymentTerm,
  updatePaymentTerm,
  deletePaymentTerm,
} from "../../services/import-export/payment-term.service";

const PAYMENT_TERM_QUERY_KEY = ["importExport", "paymentTerms"];

export const useGetPaymentTerms = () => {
  return useQuery<PaymentTerm[], Error>({
    queryKey: PAYMENT_TERM_QUERY_KEY,
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<PaymentTerm>> = await loadPaymentTerms();
      return response.data.items;
    },
  });
};

export const useSavePaymentTerm = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, { payload: PaymentTerm; isNew: boolean }>({
    mutationFn: async ({ payload, isNew }) => {
      if (isNew) {
        await createPaymentTerm(payload);
      } else {
        await updatePaymentTerm(payload.code, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_TERM_QUERY_KEY });
    },
  });
};

export const useDeletePaymentTerm = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, string>({
    mutationFn: async (code) => {
      await deletePaymentTerm(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_TERM_QUERY_KEY });
    },
  });
};
