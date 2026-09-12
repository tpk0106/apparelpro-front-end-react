import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { client } from "../../auth/axiosClient";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";

// Self-contained read-only lookups for the CUSDEC I/II form's 9 reference
// code masters. Hit the list endpoints directly (rather than importing
// hooks from the sibling reference-master screens, whose exact export
// names are being built in parallel) with a large pageSize, same shortcut
// used elsewhere in this codebase for small lookup lists (e.g. buyers,
// currencies).
interface CodeDescription {
  code: string;
  description: string;
}

interface DocumentTypeLookup {
  id: number;
  docNo: string;
  docTypeCode: string;
  description: string;
}

const fetchCodeList = async (path: string): Promise<CodeDescription[]> => {
  const response: AxiosResponse<PaginationAPIModel<CodeDescription>> = await client.get(path, {
    params: { pageSize: 999, pageNumber: 0 },
  });
  return response.data.items;
};

const useCodeLookup = (queryKey: string, path: string) =>
  useQuery<CodeDescription[], Error>({
    queryKey: ["importExport", "lookup", queryKey],
    queryFn: () => fetchCodeList(path),
  });

export const useGetClearanceOfficeLookup = () => useCodeLookup("clearanceOffice", "api/clearance-office/list");
export const useGetPaymentTermLookup = () => useCodeLookup("paymentTerm", "api/payment-term/list");
export const useGetTransportModeLookup = () => useCodeLookup("transportMode", "api/transport-mode/list");
export const useGetDutyTaxCodeLookup = () => useCodeLookup("dutyTaxCode", "api/duty-tax-code/list");
export const useGetTaxBaseCodeLookup = () => useCodeLookup("taxBaseCode", "api/tax-base-code/list");
export const useGetAgreementCodeLookup = () => useCodeLookup("agreementCode", "api/agreement-code/list");
export const useGetCommodityCodeLookup = () => useCodeLookup("commodityCode", "api/commodity-code/list");
export const useGetCustomsProcedureCodeLookup = () => useCodeLookup("customsProcedureCode", "api/customs-procedure-code/list");

export const useGetDocumentTypeLookup = () =>
  useQuery<DocumentTypeLookup[], Error>({
    queryKey: ["importExport", "lookup", "documentType"],
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<DocumentTypeLookup>> = await client.get("api/document-type/list", {
        params: { pageSize: 999, pageNumber: 0 },
      });
      return response.data.items;
    },
  });
