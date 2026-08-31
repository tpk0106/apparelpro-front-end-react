import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type {
  GeneralTransactionListReportHeader,
  GeneralTransactionListReportLine,
} from "../../../interfaces/general-inventory/general-transaction-list-report.types";

interface ReportParams {
  fromDate: string;
  toDate: string;
  transactionTypeCode?: string;
  itemCodePrefix?: string;
}

const getGeneralTransactionListReportHeader = async (params: ReportParams) => {
  return await client.get<GeneralTransactionListReportHeader>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY_REPORTS.TRANSACTION_LIST.HEADER,
    { params },
  );
};

const getGeneralTransactionListReportLines = async (params: ReportParams) => {
  return await client.get<GeneralTransactionListReportLine[]>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY_REPORTS.TRANSACTION_LIST.LINES,
    { params },
  );
};

const downloadGeneralTransactionListReportPdf = async (params: ReportParams) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY_REPORTS.TRANSACTION_LIST.PDF,
    { params, responseType: "blob" },
  );
};

export {
  getGeneralTransactionListReportHeader,
  getGeneralTransactionListReportLines,
  downloadGeneralTransactionListReportPdf,
};
export type { ReportParams as GeneralTransactionListReportParams };
