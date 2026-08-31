import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type {
  GrnListingReportHeader,
  GrnListingReportLine,
} from "../../../interfaces/orderwise-inventory/grn-listing-report.types";

interface ReportParams {
  fromDate?: string;
  toDate?: string;
  buyerCode?: number;
  order?: string;
  storeCode?: string;
  supplierCode?: string;
}

const getGrnListingReportHeader = async (params: ReportParams) => {
  return await client.get<GrnListingReportHeader>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.GRN_LISTING_REPORT.HEADER,
    { params },
  );
};

const getGrnListingReportLines = async (params: ReportParams) => {
  return await client.get<GrnListingReportLine[]>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.GRN_LISTING_REPORT.LINES,
    { params },
  );
};

const downloadGrnListingReportPdf = async (params: ReportParams) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.GRN_LISTING_REPORT.PDF,
    { params, responseType: "blob" },
  );
};

export { getGrnListingReportHeader, getGrnListingReportLines, downloadGrnListingReportPdf };
export type { ReportParams as GrnListingReportParams };
