import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type {
  GeneralGrnListingReportHeader,
  GeneralGrnListingReportLine,
} from "../../../interfaces/general-inventory/general-grn-listing-report.types";

interface ReportParams {
  fromDate: string;
  toDate: string;
  storeCode?: string;
  supplierCode?: string;
}

const getGeneralGrnListingReportHeader = async (params: ReportParams) => {
  return await client.get<GeneralGrnListingReportHeader>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY_REPORTS.GRN_LISTING.HEADER,
    { params },
  );
};

const getGeneralGrnListingReportLines = async (params: ReportParams) => {
  return await client.get<GeneralGrnListingReportLine[]>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY_REPORTS.GRN_LISTING.LINES,
    { params },
  );
};

const downloadGeneralGrnListingReportPdf = async (params: ReportParams) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY_REPORTS.GRN_LISTING.PDF,
    { params, responseType: "blob" },
  );
};

export {
  getGeneralGrnListingReportHeader,
  getGeneralGrnListingReportLines,
  downloadGeneralGrnListingReportPdf,
};
export type { ReportParams as GeneralGrnListingReportParams };
