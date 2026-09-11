import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { LetterOfCreditDetail } from "../../interfaces/import-export/ImportExport";

// Keyed by BankCode+LcNo (not an invoice number) - both sent as query params.
const loadLetterOfCreditByKey = async (bankCode: string, lcNo: string) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.LETTER_OF_CREDIT.GET, {
    params: { bankCode, lcNo },
  });
};

const saveLetterOfCredit = async (payload: LetterOfCreditDetail) => {
  return await client.put(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.LETTER_OF_CREDIT.SAVE, payload);
};

const deleteLetterOfCredit = async (bankCode: string, lcNo: string) => {
  return await client.delete(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.LETTER_OF_CREDIT.DELETE, {
    params: { bankCode, lcNo },
  });
};

export { loadLetterOfCreditByKey, saveLetterOfCredit, deleteLetterOfCredit };
