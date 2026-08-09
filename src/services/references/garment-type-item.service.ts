import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type {
  GarmentTypeItem,
  SaveGarmentTypeItemPayload,
} from "../../interfaces/references/GarmentTypeItem";

const loadGarmentTypeItems = async (garmentTypeId: number) => {
  return await client.get<GarmentTypeItem[]>(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.GARMENT_TYPE_ITEMS.GET_BY_TYPE,
    {
      params: { garmentTypeId },
    },
  );
};

const saveGarmentTypeItem = async (payload: SaveGarmentTypeItemPayload) => {
  return await client.post<GarmentTypeItem>(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.GARMENT_TYPE_ITEMS.POST,
    payload,
  );
};

const removeGarmentTypeItem = async (
  garmentTypeId: number,
  stockCode: string,
  itemCode: string,
) => {
  return await client.delete(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.GARMENT_TYPE_ITEMS.DELETE,
    {
      params: { garmentTypeId, stockCode, itemCode },
    },
  );
};

export { loadGarmentTypeItems, saveGarmentTypeItem, removeGarmentTypeItem };
