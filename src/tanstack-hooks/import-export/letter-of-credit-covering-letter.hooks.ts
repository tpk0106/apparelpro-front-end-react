import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import type { LetterOfCreditCoveringLetter } from "../../interfaces/import-export/ImportExport";
import {
  loadLetterOfCreditCoveringLetterByKey, saveLetterOfCreditCoveringLetter, deleteLetterOfCreditCoveringLetter,
} from "../../services/import-export/letter-of-credit-covering-letter.service";

// A brand-new Bank+LC No combination legitimately has no covering letter
// yet - the backend 404s in that case, which is expected, not an error
// state. Resolves to null instead of throwing, same pattern as
// useGetLetterOfCredit/useGetCertificateOfOrigin.
export const useGetLetterOfCreditCoveringLetter = (bankCode: string | null, lcNo: string | null) => {
  return useQuery<LetterOfCreditCoveringLetter | null, Error>({
    queryKey: ["importExport", "letterOfCreditCoveringLetter", bankCode, lcNo],
    queryFn: async () => {
      try {
        const response: AxiosResponse<LetterOfCreditCoveringLetter> =
          await loadLetterOfCreditCoveringLetterByKey(bankCode!, lcNo!);
        return response.data;
      } catch (err) {
        if ((err as AppError)?.status === 404) return null;
        throw err;
      }
    },
    enabled: !!bankCode && !!lcNo,
  });
};

export const useSaveLetterOfCreditCoveringLetter = () => {
  const queryClient = useQueryClient();
  return useMutation<LetterOfCreditCoveringLetter, AppError, LetterOfCreditCoveringLetter>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<LetterOfCreditCoveringLetter> = await saveLetterOfCreditCoveringLetter(payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["importExport", "letterOfCreditCoveringLetter", data.bankCode, data.lcNo],
      });
    },
  });
};

export const useDeleteLetterOfCreditCoveringLetter = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, { bankCode: string; lcNo: string }>({
    mutationFn: async ({ bankCode, lcNo }) => {
      await deleteLetterOfCreditCoveringLetter(bankCode, lcNo);
    },
    onSuccess: (_data, { bankCode, lcNo }) => {
      queryClient.invalidateQueries({ queryKey: ["importExport", "letterOfCreditCoveringLetter", bankCode, lcNo] });
    },
  });
};
