import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { SaveToolbarPreference } from "../../interfaces/toolbar/Toolbar";

const loadToolbarPreferences = async () => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.TOOLBAR.PREFERENCES);
};

const saveToolbarPreferences = async (payload: SaveToolbarPreference) => {
  return await client.put(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.TOOLBAR.PREFERENCES, payload);
};

export { loadToolbarPreferences, saveToolbarPreferences };
