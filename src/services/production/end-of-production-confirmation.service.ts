import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";

const loadEndOfProductionStatus = async (buyerCode: number, order: string, typeCode: number, styleCode: string) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.END_OF_PRODUCTION_CONFIRMATION.GET, {
    params: { buyerCode, order, typeCode, styleCode },
  });
};

const confirmEndOfProduction = async (
  buyerCode: number, order: string, typeCode: number, styleCode: string, endDate: string,
) => {
  return await client.post(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.END_OF_PRODUCTION_CONFIRMATION.CONFIRM, {
    buyerCode, order, typeCode, styleCode, endDate,
  });
};

export { loadEndOfProductionStatus, confirmEndOfProduction };
