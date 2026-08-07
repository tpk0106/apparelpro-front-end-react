import { useState } from "react";
import { Box, Typography, Chip, TextField, MenuItem, CircularProgress } from "@mui/material";
import {
  useGetUsersWithGroupsQuery,
  useGetGroupsQuery,
  useAssignUserToGroupMutation,
  useRemoveUserFromGroupMutation,
} from "../../tanstack-hooks/custom-hooks";
import type { UserWithGroups } from "../../interfaces/register/UserWithGroups";
import type { Group } from "../../interfaces/register/Group";

interface UserRowProps {
  user: UserWithGroups;
  availableGroups: Group[];
  onAssign: (userId: string, groupId: string) => void;
  onRemove: (userId: string, groupId: string) => void;
  isMutating: boolean;
}

const UserRow = ({ user, availableGroups, onAssign, onRemove, isMutating }: UserRowProps) => {
  const [selectedGroupId, setSelectedGroupId] = useState("");

  // Only offer groups the user isn't already a member of - the dropdown
  // should always represent an action that would actually change something.
  const assignableGroups = availableGroups.filter(
    (group) => !user.groups.includes(group.name),
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 3,
        py: 2,
        px: 2.5,
        borderBottom: "1px solid rgba(139, 147, 161, 0.15)",
        "&:last-of-type": { borderBottom: "none" },
      }}
    >
      <Box sx={{ minWidth: 220, flexShrink: 0 }}>
        <Typography sx={{ fontSize: "13.5px", fontWeight: 500 }}>
          {user.knownAs || user.userName}
        </Typography>
        <Typography sx={{ fontSize: "12px", color: "text.secondary" }}>
          {user.email}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 0.75, alignItems: "center" }}>
        {user.groups.length === 0 && (
          <Typography sx={{ fontSize: "12px", color: "text.secondary", fontStyle: "italic" }}>
            No groups assigned
          </Typography>
        )}
        {user.groups.map((groupName) => {
          const group = availableGroups.find((candidate) => candidate.name === groupName);
          return (
            <Chip
              key={groupName}
              label={groupName}
              size="small"
              disabled={isMutating}
              onDelete={group ? () => onRemove(user.id, group.id) : undefined}
            />
          );
        })}
      </Box>

      <TextField
        select
        size="small"
        value={selectedGroupId}
        disabled={isMutating || assignableGroups.length === 0}
        onChange={(event) => {
          const groupId = event.target.value;
          setSelectedGroupId("");
          if (groupId) onAssign(user.id, groupId);
        }}
        sx={{ minWidth: 170, flexShrink: 0 }}
        slotProps={{ select: { displayEmpty: true } }}
      >
        <MenuItem value="" disabled>
          {assignableGroups.length === 0 ? "All groups assigned" : "+ Add group"}
        </MenuItem>
        {assignableGroups.map((group) => (
          <MenuItem key={group.id} value={group.id}>
            {group.name}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

// Users panel (Settings > Users & Groups). Backed by GET api/user/list-with-groups,
// which reads AspNetUsers directly (see design doc section 8 on why the older
// GET api/user/list endpoint is not used here).
const UsersPanel = () => {
  const { data: users, isLoading: usersLoading, isError: usersError } = useGetUsersWithGroupsQuery();
  const { data: groups } = useGetGroupsQuery();
  const assignMutation = useAssignUserToGroupMutation();
  const removeMutation = useRemoveUserFromGroupMutation();

  const isMutating = assignMutation.isPending || removeMutation.isPending;

  const handleAssign = (userId: string, groupId: string) => {
    assignMutation.mutate({ userId, groupId });
  };

  const handleRemove = (userId: string, groupId: string) => {
    removeMutation.mutate({ userId, groupId });
  };

  return (
    <Box>
      {usersLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {usersError && (
        <Typography sx={{ color: "#f87171", fontSize: "13px" }}>
          Could not load users. Please try again.
        </Typography>
      )}

      <Box
        sx={{
          borderRadius: "14px",
          border: "1px solid rgba(139, 147, 161, 0.15)",
          overflow: "hidden",
        }}
      >
        {(users ?? []).map((user) => (
          <UserRow
            key={user.id}
            user={user}
            availableGroups={groups ?? []}
            onAssign={handleAssign}
            onRemove={handleRemove}
            isMutating={isMutating}
          />
        ))}

        {users && users.length === 0 && (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
              No users found.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default UsersPanel;
