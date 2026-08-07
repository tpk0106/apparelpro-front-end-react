import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Checkbox,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  useGetPermissionCatalogQuery,
  useGetRolePermissionMatrixQuery,
  useUpdateRolePermissionsMutation,
} from "../../tanstack-hooks/custom-hooks";
import type { Permission } from "../../interfaces/register/Permission";

// Permission Matrix panel (Settings > Users & Groups). Talks to the already-
// deployed PermissionsController (api/permissions/catalog, /matrix, /role) -
// no new backend work was needed for this panel, only the AutoMapper mapping
// fix that was bundled into the Groups backend change.
const PermissionMatrixPanel = () => {
  const {
    data: permissions,
    isLoading: permissionsLoading,
    isError: permissionsError,
  } = useGetPermissionCatalogQuery();
  const {
    data: roles,
    isLoading: rolesLoading,
    isError: rolesError,
  } = useGetRolePermissionMatrixQuery();
  const updateMutation = useUpdateRolePermissionsMutation();

  // Local editable copy of each role's granted permission keys, keyed by roleId -
  // lets the admin toggle many checkboxes before committing, rather than firing
  // one PUT per checkbox click.
  const [grantsByRoleId, setGrantsByRoleId] = useState<
    Record<string, Set<string>>
  >({});

  useEffect(() => {
    if (!roles) return;
    const initialGrants: Record<string, Set<string>> = {};
    roles.forEach((role) => {
      initialGrants[role.roleId] = new Set(role.grantedPermissionKeys);
    });
    setGrantsByRoleId(initialGrants);
  }, [roles]);

  const permissionsByCategory = useMemo(() => {
    const grouped = new Map<string, Permission[]>();
    (permissions ?? []).forEach((permission) => {
      const bucket = grouped.get(permission.category) ?? [];
      bucket.push(permission);
      grouped.set(permission.category, bucket);
    });
    return grouped;
  }, [permissions]);

  // A role is "dirty" when its local checkbox state has diverged from what the
  // server last reported - only dirty roles get PUT on Save.
  const dirtyRoleIds = useMemo(() => {
    if (!roles) return [];
    return roles
      .filter((role) => {
        const localSet = grantsByRoleId[role.roleId];
        if (!localSet) return false;
        const serverSet = new Set(role.grantedPermissionKeys);
        if (localSet.size !== serverSet.size) return true;
        return Array.from(localSet).some((key) => !serverSet.has(key));
      })
      .map((role) => role.roleId);
  }, [roles, grantsByRoleId]);

  const handleToggle = (roleId: string, permissionKey: string) => {
    setGrantsByRoleId((previous) => {
      const updated = { ...previous };
      const currentSet = new Set(updated[roleId] ?? []);
      if (currentSet.has(permissionKey)) {
        currentSet.delete(permissionKey);
      } else {
        currentSet.add(permissionKey);
      }
      updated[roleId] = currentSet;
      return updated;
    });
  };

  const handleSave = async () => {
    for (const roleId of dirtyRoleIds) {
      const permissionKeys = Array.from(grantsByRoleId[roleId] ?? []);
      await updateMutation.mutateAsync({ roleId, permissionKeys });
    }
  };

  // Discards unsaved checkbox toggles by re-seeding the local edit buffer from
  // the last known server state - same shape as the initial-load effect above.
  const handleCancel = () => {
    if (!roles) return;
    const resetGrants: Record<string, Set<string>> = {};
    roles.forEach((role) => {
      resetGrants[role.roleId] = new Set(role.grantedPermissionKeys);
    });
    setGrantsByRoleId(resetGrants);
  };

  const isLoading = permissionsLoading || rolesLoading;

  return (
    <Box>
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {(permissionsError || rolesError) && (
        <Typography sx={{ color: "#f87171", fontSize: "13px" }}>
          Could not load the permission matrix. Please try again.
        </Typography>
      )}

      {!isLoading && !permissionsError && !rolesError && (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.5,
              mb: 2,
              width: "95%",
              mx: "auto",
            }}
          >
            <Button
              variant="outlined"
              disabled={dirtyRoleIds.length === 0 || updateMutation.isPending}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={dirtyRoleIds.length === 0 || updateMutation.isPending}
              onClick={handleSave}
            >
              {updateMutation.isPending ? (
                <CircularProgress size={18} sx={{ color: "#fff" }} />
              ) : dirtyRoleIds.length > 0 ? (
                `Save Changes (${dirtyRoleIds.length})`
              ) : (
                "Save Changes"
              )}
            </Button>
          </Box>

          <Box
            sx={{
              width: "95%",
              mx: "auto",
              overflowX: "auto",
              overflowY: "auto",
              maxHeight: "65vh",
              borderRadius: "14px",
              border: "1px solid rgba(139, 147, 161, 0.15)",
            }}
          >
            <Box
              component="table"
              sx={{ width: "100%", borderCollapse: "collapse" }}
            >
              <Box component="thead">
                <Box component="tr">
                  <Box
                    component="th"
                    sx={{
                      textAlign: "left",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      py: 1.5,
                      px: 2,
                      minWidth: 280,
                      position: "sticky",
                      top: 0,
                      left: 0,
                      zIndex: 3,
                      // Explicit blue/white pairing (same #60a5fa as the primary
                      // buttons) - "background.paper" was rendering the label
                      // invisible against this table's actual surface.
                      backgroundColor: "#60a5fa",
                      color: "#ffffff",
                    }}
                  >
                    Permission
                  </Box>
                  {(roles ?? []).map((role) => (
                    <Box
                      component="th"
                      key={role.roleId}
                      sx={{
                        fontSize: "12.5px",
                        fontWeight: 600,
                        py: 1.5,
                        px: 1.5,
                        minWidth: 110,
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        backgroundColor: "#141922",
                        color: "#ffffff",
                      }}
                    >
                      {role.roleName}
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {Array.from(permissionsByCategory.entries()).map(
                  ([category, categoryPermissions]) => (
                    <Fragment key={category}>
                      <Box component="tr">
                        <Box
                          component="td"
                          colSpan={(roles?.length ?? 0) + 1}
                          sx={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "text.secondary",
                            backgroundColor: "rgba(96, 165, 250, 0.06)",
                            py: 1,
                            px: 2,
                          }}
                        >
                          {category}
                        </Box>
                      </Box>
                      {categoryPermissions.map((permission) => (
                        <Box component="tr" key={permission.key}>
                          <Box
                            component="td"
                            sx={{
                              fontSize: "13px",
                              py: 1,
                              px: 2,
                              minWidth: 280,
                              borderBottom:
                                "1px solid rgba(139, 147, 161, 0.1)",
                              position: "sticky",
                              left: 0,
                              zIndex: 1,
                              // Same fix as the header cell above.
                              backgroundColor: "#60a5fa",
                              color: "#ffffff",
                            }}
                          >
                            {permission.displayName}
                          </Box>
                          {(roles ?? []).map((role) => (
                            <Box
                              component="td"
                              key={`${permission.key}-${role.roleId}`}
                              sx={{
                                textAlign: "center",
                                borderBottom:
                                  "1px solid rgba(139, 147, 161, 0.1)",
                              }}
                            >
                              <Checkbox
                                size="small"
                                checked={
                                  grantsByRoleId[role.roleId]?.has(
                                    permission.key,
                                  ) ?? false
                                }
                                onChange={() =>
                                  handleToggle(role.roleId, permission.key)
                                }
                              />
                            </Box>
                          ))}
                        </Box>
                      ))}
                    </Fragment>
                  ),
                )}
              </Box>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default PermissionMatrixPanel;
