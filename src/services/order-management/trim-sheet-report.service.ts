import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { TrimSheetReportDetails } from "../../components/reports/orderwise-inventory/trim-sheet-report/trim-sheet-report.types";

interface TrimSheetReportQueryParams {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
}

const getTrimSheetReportDetails = async (
  params: TrimSheetReportQueryParams,
) => {
  return await client.get<TrimSheetReportDetails>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.TRIM_SHEET_REPORT.GET_DETAILS,
    { params },
  );
};

// Streams the PDF as a blob - the caller turns it into a browser download.
const downloadTrimSheetReportPdf = async (
  params: TrimSheetReportQueryParams,
) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.TRIM_SHEET_REPORT.GET_PDF,
    { params, responseType: "blob" },
  );
};

export { getTrimSheetReportDetails, downloadTrimSheetReportPdf };
export type { TrimSheetReportQueryParams };
