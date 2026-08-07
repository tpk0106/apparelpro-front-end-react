import { client } from "../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type { Group } from "../interfaces/register/Group";

const loadGroups = async () => {
  return await client.get<Group[]>(
    APPARELPRO_ENDPOINTS.REGISTRATION.GROUP.GET,
  );
};

const createGroup = async (name: string) => {
  return await client.post<Group>(APPARELPRO_ENDPOINTS.REGISTRATION.GROUP.POST, {
    name,
  });
};

const deleteGroup = async (groupId: string) => {
  return await client.delete(
    APPARELPRO_ENDPOINTS.REGISTRATION.GROUP.DELETE + groupId,
  );
};

export { loadGroups, createGroup, deleteGroup };
