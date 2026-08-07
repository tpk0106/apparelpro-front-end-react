import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import GroupsIcon from "@mui/icons-material/Groups";
import {
  useGetGroupsQuery,
  useCreateGroupMutation,
  useDeleteGroupMutation,
} from "../../tanstack-hooks/custom-hooks";

// Groups panel (Settings > Users & Groups). A "Group" here is a plain
// AspNetRoles row - see the backend design doc for why we reused Roles
// rather than introducing a new Group table.
const GroupsPanel = () => {
  const [newGroupName, setNewGroupName] = useState("");
  const { data: groups, isLoading, isError } = useGetGroupsQuery();
  const createGroupMutation = useCreateGroupMutation();
  const deleteGroupMutation = useDeleteGroupMutation();

  const handleCreateGroup = () => {
    const trimmedName = newGroupName.trim();
    if (!trimmedName) return;
    createGroupMutation.mutate(trimmedName, {
      onSuccess: () => setNewGroupName(""),
    });
  };

  const handleDeleteGroup = (groupId: string) => {
    deleteGroupMutation.mutate(groupId);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 1.5, mb: 3, alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="New group name"
          value={newGroupName}
          onChange={(event) => setNewGroupName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleCreateGroup();
          }}
          sx={{ minWidth: 260 }}
        />
        <Button
          variant="contained"
          onClick={handleCreateGroup}
          disabled={!newGroupName.trim() || createGroupMutation.isPending}
        >
          {createGroupMutation.isPending ? (
            <CircularProgress size={18} sx={{ color: "#fff" }} />
          ) : (
            "Create Group"
          )}
        </Button>
      </Box>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {isError && (
        <Typography sx={{ color: "#f87171", fontSize: "13px" }}>
          Could not load groups. Please try again.
        </Typography>
      )}

      <Box
        sx={{
          borderRadius: "14px",
          border: "1px solid rgba(139, 147, 161, 0.15)",
          overflow: "hidden",
        }}
      >
        {(groups ?? []).map((group) => (
          <Box
            key={group.id}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              py: 1.75,
              px: 2.5,
              borderBottom: "1px solid rgba(139, 147, 161, 0.15)",
              "&:last-of-type": { borderBottom: "none" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <GroupsIcon sx={{ fontSize: 18, color: "#8B93A1" }} />
              <Box>
                <Typography sx={{ fontSize: "13.5px", fontWeight: 500 }}>
                  {group.name}
                </Typography>
                <Typography sx={{ fontSize: "12px", color: "text.secondary" }}>
                  {group.memberCount} member{group.memberCount === 1 ? "" : "s"}
                </Typography>
              </Box>
            </Box>

            <Tooltip
              title={
                group.memberCount > 0
                  ? "Remove all members before deleting this group"
                  : "Delete group"
              }
            >
              <span>
                <IconButton
                  size="small"
                  disabled={group.memberCount > 0 || deleteGroupMutation.isPending}
                  onClick={() => handleDeleteGroup(group.id)}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        ))}

        {groups && groups.length === 0 && (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
              No groups yet. Create one above.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default GroupsPanel;
