import { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import SystemParametersPanel from "./system-parameters-panel.component";
import UsersAndGroupsPanel from "./users-and-groups.component";
import { isAdministrator } from "../../auth/jwt.util";

const SettingsPage = () => {
  const isAdmin = isAdministrator();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box className="max-w-5xl mx-auto py-8 px-6">
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_event, newValue: number) => setActiveTab(newValue)}
        >
          <Tab label="System Parameters" />
          {/* Entirely hidden (not just read-only) for non-Administrators, since
              every endpoint it talks to is [Authorize(Roles = "Administrator")]. */}
          {isAdmin && <Tab label="Users & Groups" />}
        </Tabs>
      </Box>

      {activeTab === 0 && <SystemParametersPanel />}
      {activeTab === 1 && isAdmin && <UsersAndGroupsPanel />}
    </Box>
  );
};

export default SettingsPage;
