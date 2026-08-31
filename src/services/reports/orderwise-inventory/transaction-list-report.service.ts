import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type {
  TransactionListReportHeader,
  TransactionListReportLine,
} from "../../../interfaces/orderwise-inventory/transaction-list-report.types";

interface ReportParams {
  fromDate: string;
  toDate: string;
  transactionType?: string;
  itemCodePrefix?: string;
}

const getTransactionListReportHeader = async (params: ReportParams) => {
  return await client.get<TransactionListReportHeader>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.TRANSACTION_LIST_REPORT.HEADER,
    { params },
  );
};

const getTransactionListReportLines = async (params: ReportParams) => {
  return await client.get<TransactionListReportLine[]>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.TRANSACTION_LIST_REPORT.LINES,
    { params },
  );
};

const downloadTransactionListReportPdf = async (params: ReportParams) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.TRANSACTION_LIST_REPORT.PDF,
    { params, responseType: "blob" },
  );
};

export {
  getTransactionListReportHeader,
  getTransactionListReportLines,
  downloadTransactionListReportPdf,
};
export type { ReportParams as TransactionListReportParams };
