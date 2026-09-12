import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { PaymentTerm } from "../../interfaces/import-export/ImportExport";

const loadPaymentTerms = async () => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PAYMENT_TERM.LIST, {
    params: { pageSize: 999, pageNumber: 1 },
  });
};

const createPaymentTerm = async (payload: PaymentTerm) => {
  return await client.post(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PAYMENT_TERM.POST, payload);
};

const updatePaymentTerm = async (code: string, payload: PaymentTerm) => {
  return await client.put(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PAYMENT_TERM.PUT, payload, {
    params: { code },
  });
};

const deletePaymentTerm = async (code: string) => {
  return await client.delete(`${APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PAYMENT_TERM.DELETE}${code}`);
};

export { loadPaymentTerms, createPaymentTerm, updatePaymentTerm, deletePaymentTerm };
