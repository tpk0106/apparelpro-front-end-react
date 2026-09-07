import { useNavigate } from "react-router-dom";
import { Box, Checkbox, Switch, Typography, Divider, CircularProgress } from "@mui/material";
import { navbarData } from "../../data/nav-data";
import { useGetToolbarPreferences, useSaveToolbarPreferences } from "../../tanstack-hooks/toolbar.hooks";
import { SCOPED_GROUPS, GROUP_LABELS, getDefaultToolbarPins } from "../../navigation/toolbar-config";

// Same pin data as the toolbar's inline "+" picker (quick-access-toolbar.component.tsx)
// - this panel and the inline picker read/write the same ToolbarPreference, so
// editing one updates the other.
const ToolbarSettingsPanel = () => {
  const navigate = useNavigate();
  const { data: preferences, isLoading } = useGetToolbarPreferences();
  const saveMutation = useSaveToolbarPreferences();

  const groups = SCOPED_GROUPS.map((key) => navbarData.find((g) => g.routerLink === key)!);

  if (isLoading || !preferences) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  // Same default fallback as the toolbar's inline picker
  // (quick-access-toolbar.component.tsx) - a first-time user sees nav-data.ts's
  // own `pinned: true` defaults here too, and the first change saves them for real.
  const effectivePins = preferences.isDefault ? getDefaultToolbarPins() : preferences.pins;

  const pinnedLinksByGroup = (groupKey: string) =>
    effectivePins.filter((p) => p.groupKey === groupKey).map((p) => p.itemRouterLink);

  const togglePin = (groupKey: string, itemRouterLink: string) => {
    const exists = effectivePins.some((p) => p.groupKey === groupKey && p.itemRouterLink === itemRouterLink);
    const next = exists
      ? effectivePins.filter((p) => !(p.groupKey === groupKey && p.itemRouterLink === itemRouterLink))
      : [
          ...effectivePins,
          {
            groupKey,
            itemRouterLink,
            sortOrder: effectivePins.filter((p) => p.groupKey === groupKey).length,
          },
        ];
    saveMutation.mutate({ isEnabled: preferences.isEnabled, pins: next });
  };

  const toggleEnabled = () => {
    const nextEnabled = !preferences.isEnabled;
    saveMutation.mutate({ isEnabled: nextEnabled, pins: effectivePins });
    if (nextEnabled) navigate("/");
  };

  return (
    <Box sx={{ maxWidth: 720 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Show quick-access toolbar</Typography>
          <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
            The shortcut strip above the page, next to the vertical menu.
          </Typography>
        </Box>
        <Switch checked={preferences.isEnabled} onChange={toggleEnabled} />
      </Box>

      <Divider sx={{ mb: 2 }} />

      {groups.map((group) => (
        <Box key={group.routerLink} sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 13, mb: 1 }}>
            {GROUP_LABELS[group.routerLink]}
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 0.25 }}>
            {group.subMenus.map((sm) => (
              <Box key={sm.routerLink} sx={{ display: "flex", alignItems: "center" }}>
                <Checkbox
                  size="small"
                  checked={pinnedLinksByGroup(group.routerLink).includes(sm.routerLink)}
                  onChange={() => togglePin(group.routerLink, sm.routerLink)}
                />
                <Typography sx={{ fontSize: 13 }}>{sm.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default ToolbarSettingsPanel;
