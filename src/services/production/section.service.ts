import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";

const loadAllSections = async () => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.SECTION.LIST_ALL);
};

export { loadAllSections };
