import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type {
  RawMaterialControlSheetHeader,
  RawMaterialControlSheetLine,
} from "../../../interfaces/orderwise-inventory/raw-material-control-sheet.types";

interface ReportParams {
  buyerCode: number;
  order: string;
}

const getRawMaterialControlSheetHeader = async (params: ReportParams) => {
  return await client.get<RawMaterialControlSheetHeader>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.RAW_MATERIAL_CONTROL_SHEET_REPORT.HEADER,
    { params },
  );
};

const getRawMaterialControlSheetLines = async (params: ReportParams) => {
  return await client.get<RawMaterialControlSheetLine[]>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.RAW_MATERIAL_CONTROL_SHEET_REPORT.LINES,
    { params },
  );
};

const downloadRawMaterialControlSheetPdf = async (params: ReportParams) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.RAW_MATERIAL_CONTROL_SHEET_REPORT.PDF,
    { params, responseType: "blob" },
  );
};

export {
  getRawMaterialControlSheetHeader,
  getRawMaterialControlSheetLines,
  downloadRawMaterialControlSheetPdf,
};
export type { ReportParams as RawMaterialControlSheetParams };
