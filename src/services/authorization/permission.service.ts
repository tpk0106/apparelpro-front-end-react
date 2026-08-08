import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type {
  Permission,
  RolePermissionMatrixRole,
  UpdateRolePermissionsRequest,
} from "../../interfaces/register/Permission";

const loadPermissionCatalog = async () => {
  return await client.get<Permission[]>(
    APPARELPRO_ENDPOINTS.PERMISSIONS.CATALOG,
  );
};

const loadRolePermissionMatrix = async () => {
  return await client.get<RolePermissionMatrixRole[]>(
    APPARELPRO_ENDPOINTS.PERMISSIONS.MATRIX,
  );
};

const updateRolePermissions = async (request: UpdateRolePermissionsRequest) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.PERMISSIONS.UPDATE_ROLE,
    request,
  );
};

export {
  loadPermissionCatalog,
  loadRolePermissionMatrix,
  updateRolePermissions,
};
