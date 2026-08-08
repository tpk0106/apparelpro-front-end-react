import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type {
  GarmentAdditionalCostRow,
  GarmentAdditionalCostReport,
  SaveGarmentAdditionalCostPayload,
} from "../../components/garment-additional-cost/garment-additional-cost.types";

interface GarmentAdditionalCostScopeParams {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
}

const loadGarmentAdditionalCosts = async (
  params: GarmentAdditionalCostScopeParams,
) => {
  return await client.get<GarmentAdditionalCostRow[]>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.GARMENT_ADDITIONAL_COST
      .GET_BY_STYLE,
    { params },
  );
};

const saveGarmentAdditionalCost = async (
  payload: SaveGarmentAdditionalCostPayload,
) => {
  return await client.post<GarmentAdditionalCostRow>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.GARMENT_ADDITIONAL_COST.SAVE_ENTRY,
    payload,
  );
};

const deleteGarmentAdditionalCost = async (
  params: GarmentAdditionalCostScopeParams & {
    additionalCostCode: string;
    itemCode: string;
  },
) => {
  return await client.delete<boolean>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.GARMENT_ADDITIONAL_COST
      .DELETE_ENTRY,
    { params },
  );
};

const loadGarmentAdditionalCostReport = async (
  params: GarmentAdditionalCostScopeParams,
) => {
  return await client.get<GarmentAdditionalCostReport>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.GARMENT_ADDITIONAL_COST.GET_REPORT,
    { params },
  );
};

// Streams the PDF as a blob - the caller turns it into a browser download.
const downloadGarmentAdditionalCostReportPdf = async (
  params: GarmentAdditionalCostScopeParams,
) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.GARMENT_ADDITIONAL_COST
      .GET_REPORT_PDF,
    { params, responseType: "blob" },
  );
};

export {
  loadGarmentAdditionalCosts,
  saveGarmentAdditionalCost,
  deleteGarmentAdditionalCost,
  loadGarmentAdditionalCostReport,
  downloadGarmentAdditionalCostReportPdf,
};
export type { GarmentAdditionalCostScopeParams };
