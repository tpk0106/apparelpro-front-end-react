import { Box, Checkbox, Typography, CircularProgress } from "@mui/material";
import { navbarData } from "../../data/nav-data";
import { useGetToolbarPreferences, useSaveToolbarPreferences } from "../../tanstack-hooks/toolbar.hooks";
import { SCOPED_GROUPS, GROUP_LABELS, getDefaultToolbarPins } from "../../navigation/toolbar-config";
import { copperTextColor } from "../../themes/button-color-themes";

const TEXT_WHITE = "#F4F6F8";

const checkboxSx = {
  color: "rgba(201,128,61,0.6)",
  "&.Mui-checked": { color: copperTextColor },
};

// A single full-page view of every group's pins at once - the toolbar's own
// "+" picker (quick-access-toolbar.component.tsx) only manages one group at
// a time in a small popover, so this is a genuinely different, more
// convenient way to manage the same underlying ToolbarPreference. The
// show/hide-toolbar switch itself lives in the Header now (next to the
// collapse/expand icon), not here - that's a per-user visibility choice any
// logged-in user needs, and this Settings page isn't reachable by everyone.
const ToolbarSettingsPanel = () => {
  const { data: preferences, isLoading } = useGetToolbarPreferences();
  const saveMutation = useSaveToolbarPreferences();

  const groups = SCOPED_GROUPS.map((key) => navbarData.find((g) => g.routerLink === key)!);

  if (isLoading || !preferences) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={28} sx={{ color: copperTextColor }} />
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

  return (
    <Box sx={{ maxWidth: 720 }}>
      <Typography sx={{ fontSize: 12.5, color: TEXT_WHITE, opacity: 0.7, mb: 2 }}>
        Choose which screens show up as quick-access icons on the toolbar above the page.
        To hide the toolbar entirely, use the eye icon in the header.
      </Typography>

      {groups.map((group) => (
        <Box key={group.routerLink} sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 13, mb: 1, color: TEXT_WHITE }}>
            {GROUP_LABELS[group.routerLink]}
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 0.25 }}>
            {group.subMenus.map((sm) => (
              <Box key={sm.routerLink} sx={{ display: "flex", alignItems: "center" }}>
                <Checkbox
                  size="small"
                  sx={checkboxSx}
                  checked={pinnedLinksByGroup(group.routerLink).includes(sm.routerLink)}
                  onChange={() => togglePin(group.routerLink, sm.routerLink)}
                />
                <Typography sx={{ fontSize: 13, color: TEXT_WHITE }}>{sm.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default ToolbarSettingsPanel;
