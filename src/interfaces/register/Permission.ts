export interface Permission {
  id: number;
  key: string;
  displayName: string;
  category: string;
  description: string | null;
}

export interface RolePermissionMatrixRole {
  roleId: string;
  roleName: string;
  grantedPermissionKeys: string[];
}

export interface UpdateRolePermissionsRequest {
  roleId: string;
  permissionKeys: string[];
}
