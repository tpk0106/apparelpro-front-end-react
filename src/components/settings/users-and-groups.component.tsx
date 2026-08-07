import { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import GroupsPanel from "./groups-panel.component";
import UsersPanel from "./users-panel.component";
import PermissionMatrixPanel from "./permission-matrix-panel.component";

// Only mounted for Administrators - see settings.component.tsx, which hides
// the "Users & Groups" tab entirely for everyone else.
const UsersAndGroupsPanel = () => {
  const [activeSubTab, setActiveSubTab] = useState(0);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={activeSubTab}
          onChange={(_event, newValue: number) => setActiveSubTab(newValue)}
          sx={{ borderBottom: "1px solid rgba(139, 147, 161, 0.15)" }}
        >
          <Tab label="Groups" />
          <Tab label="Users" />
          <Tab label="Permission Matrix" />
        </Tabs>
      </Box>

      {activeSubTab === 0 && <GroupsPanel />}
      {activeSubTab === 1 && <UsersPanel />}
      {activeSubTab === 2 && <PermissionMatrixPanel />}
    </Box>
  );
};

export default UsersAndGroupsPanel;
