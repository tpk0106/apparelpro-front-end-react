import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import type { LetterOfCreditDetail } from "../../interfaces/import-export/ImportExport";
import {
  loadLetterOfCreditByKey, saveLetterOfCredit, deleteLetterOfCredit,
} from "../../services/import-export/letter-of-credit.service";

// A brand-new Bank+LC No combination legitimately has no saved form yet - the
// backend 404s in that case, which is expected, not an error state. Resolves
// to null instead of throwing, same pattern as useGetCertificateOfOrigin.
export const useGetLetterOfCredit = (bankCode: string | null, lcNo: string | null) => {
  return useQuery<LetterOfCreditDetail | null, Error>({
    queryKey: ["importExport", "letterOfCredit", bankCode, lcNo],
    queryFn: async () => {
      try {
        const response: AxiosResponse<LetterOfCreditDetail> = await loadLetterOfCreditByKey(bankCode!, lcNo!);
        return response.data;
      } catch (err) {
        if ((err as AppError)?.status === 404) return null;
        throw err;
      }
    },
    enabled: !!bankCode && !!lcNo,
  });
};

export const useSaveLetterOfCredit = () => {
  const queryClient = useQueryClient();
  return useMutation<LetterOfCreditDetail, AppError, LetterOfCreditDetail>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<LetterOfCreditDetail> = await saveLetterOfCredit(payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["importExport", "letterOfCredit", data.header.bankCode, data.header.lcNo],
      });
    },
  });
};

export const useDeleteLetterOfCredit = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, { bankCode: string; lcNo: string }>({
    mutationFn: async ({ bankCode, lcNo }) => {
      await deleteLetterOfCredit(bankCode, lcNo);
    },
    onSuccess: (_data, { bankCode, lcNo }) => {
      queryClient.invalidateQueries({ queryKey: ["importExport", "letterOfCredit", bankCode, lcNo] });
    },
  });
};
