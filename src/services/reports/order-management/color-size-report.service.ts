import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { ColorSizeReport } from "../../../components/reports/order-management/color-size-report/color-size-report.types";

interface ColorSizeReportQueryParams {
  buyerCode: number;
  order: string;
}

const getColorSizeReportDetails = async (
  params: ColorSizeReportQueryParams,
) => {
  return await client.get<ColorSizeReport>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.COLOR_SIZE_REPORT.GET_DETAILS,
    { params },
  );
};

// Streams the PDF as a blob - the caller turns it into a browser download.
const downloadColorSizeReportPdf = async (
  params: ColorSizeReportQueryParams,
) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.COLOR_SIZE_REPORT.GET_PDF,
    { params, responseType: "blob" },
  );
};

export { getColorSizeReportDetails, downloadColorSizeReportPdf };
export type { ColorSizeReportQueryParams };
