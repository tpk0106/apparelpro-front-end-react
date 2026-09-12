import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { LetterOfCreditCoveringLetter } from "../../interfaces/import-export/ImportExport";

const loadLetterOfCreditCoveringLetterByKey = async (bankCode: string, lcNo: string) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.LETTER_OF_CREDIT_COVERING_LETTER.GET, {
    params: { bankCode, lcNo },
  });
};

const saveLetterOfCreditCoveringLetter = async (payload: LetterOfCreditCoveringLetter) => {
  return await client.put(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.LETTER_OF_CREDIT_COVERING_LETTER.SAVE, payload);
};

const deleteLetterOfCreditCoveringLetter = async (bankCode: string, lcNo: string) => {
  return await client.delete(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.LETTER_OF_CREDIT_COVERING_LETTER.DELETE, {
    params: { bankCode, lcNo },
  });
};

export {
  loadLetterOfCreditCoveringLetterByKey, saveLetterOfCreditCoveringLetter, deleteLetterOfCreditCoveringLetter,
};
