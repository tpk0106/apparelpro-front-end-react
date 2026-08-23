import type { AxiosResponse } from "axios";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import { client } from "../../auth/axiosClient";
import type {
  BulkSaveResponse,
  ColorSizeBreakdownDetailsParams,
} from "../../interfaces/definitions";
import type ColorQuantityRatio from "../../interfaces/OrderManagement/ColorQuantityRatio";

const loadColorQuantityRatiosByStyle = async (
  data: ColorSizeBreakdownDetailsParams,
) => {
  return await client.get<ColorQuantityRatio[]>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.COLOR_QUANTITY_RATIO.GET_BY_STYLE,
    { params: data },
  );
};

const bulkSaveColorQuantityRatios = async (
  params: ColorSizeBreakdownDetailsParams,
  payload: ColorQuantityRatio[],
): Promise<AxiosResponse<BulkSaveResponse>> => {
  return await client.post<BulkSaveResponse>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.COLOR_QUANTITY_RATIO.POST,
    payload,
    { params },
  );
};

type SetRatioModePayload = ColorSizeBreakdownDetailsParams & { mode: "R" | "Q" };

const setColorRatioMode = async (payload: SetRatioModePayload) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.COLOR_QUANTITY_RATIO
      .SET_COLOR_RATIO_MODE,
    payload,
  );
};

const setSizeRatioMode = async (payload: SetRatioModePayload) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.COLOR_QUANTITY_RATIO
      .SET_SIZE_RATIO_MODE,
    payload,
  );
};

export {
  loadColorQuantityRatiosByStyle,
  bulkSaveColorQuantityRatios,
  setColorRatioMode,
  setSizeRatioMode,
};
export type { SetRatioModePayload };
