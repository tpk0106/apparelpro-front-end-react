import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";

const loadProductionProgressReport = async (buyerCode: number, order: string, typeCode: number, styleCode: string) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PRODUCTION_PROGRESS_GRAPH.GET, {
    params: { buyerCode, order, typeCode, styleCode },
  });
};

export { loadProductionProgressReport };
