import { client } from "../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type { SystemParameter } from "../interfaces/system-configuration/SystemParameter";

const loadSystemParameters = async () => {
  return await client.get<SystemParameter[]>(
    APPARELPRO_ENDPOINTS.SYSTEM_CONFIGURATION.SYSTEM_PARAMETER.GET,
  );
};

const updateSystemParameter = async (parameterKey: string, value: string) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.SYSTEM_CONFIGURATION.SYSTEM_PARAMETER.PUT + parameterKey,
    { value },
  );
};

export { loadSystemParameters, updateSystemParameter };
