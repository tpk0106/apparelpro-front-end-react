import { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import SystemParametersPanel from "./system-parameters-panel.component";
import UsersAndGroupsPanel from "./users-and-groups.component";
import ToolbarSettingsPanel from "./toolbar-settings-panel.component";
import { isAdministrator } from "../../auth/jwt.util";
import { copperTabsSx } from "../../themes/workspace-theme";

const SettingsPage = () => {
  const isAdmin = isAdministrator();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box className="w-[95%] mx-auto py-8">
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_event, newValue: number) => setActiveTab(newValue)}
          sx={copperTabsSx}
        >
          <Tab label="System Parameters" />
          {/* Entirely hidden (not just read-only) for non-Administrators, since
              every endpoint it talks to is [Authorize(Roles = "Administrator")]. */}
          {isAdmin && <Tab label="Users & Groups" />}
          <Tab label="Toolbar" />
        </Tabs>
      </Box>

      {activeTab === 0 && <SystemParametersPanel />}
      {activeTab === 1 && isAdmin && <UsersAndGroupsPanel />}
      {((isAdmin && activeTab === 2) || (!isAdmin && activeTab === 1)) && <ToolbarSettingsPanel />}
    </Box>
  );
};

export default SettingsPage;
