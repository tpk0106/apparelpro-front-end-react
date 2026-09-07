import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box, IconButton, Popover, Checkbox, Typography, Tooltip, Divider,
} from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AddIcon from "@mui/icons-material/Add";
import { navbarData } from "../data/nav-data";
import { useGetToolbarPreferences, useSaveToolbarPreferences } from "../tanstack-hooks/toolbar.hooks";
import { copperTextColor } from "../themes/button-color-themes";
import {
  SCOPED_GROUPS, GROUP_LABELS, GROUP_FULL_NAMES, getItemAbbreviation, getDefaultToolbarPins,
} from "./toolbar-config";

const TEXT_WHITE = "#F4F6F8";
const HAIRLINE = "rgba(201,128,61,0.32)";
const TOOLBAR_BG = "linear-gradient(180deg, #171D28 0%, #10141C 100%)";

const activeButtonSx = {
  color: "#2A1608",
  background: "linear-gradient(135deg, #E8A868 0%, #C9803D 45%, #6B4420 85%)",
  "&:hover": { background: "linear-gradient(135deg, #E8A868 0%, #C9803D 45%, #6B4420 85%)" },
};

const checkboxSx = {
  color: "rgba(201,128,61,0.6)",
  "&.Mui-checked": { color: copperTextColor },
};

const QuickAccessToolbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: preferences } = useGetToolbarPreferences();
  const saveMutation = useSaveToolbarPreferences();
  const [pickerAnchor, setPickerAnchor] = useState<{ el: HTMLElement; groupKey: string } | null>(null);

  const groups = useMemo(
    () => SCOPED_GROUPS.map((key) => navbarData.find((g) => g.routerLink === key)!),
    [],
  );

  if (preferences && !preferences.isEnabled) return null;

  // A first-time user (no saved preference yet) sees nav-data.ts's own
  // `pinned: true` defaults instead of an empty toolbar; the moment they
  // pin/unpin anything, the toggle handler below saves this same set (plus
  // their change) as their own real preference.
  const effectivePins = preferences?.isDefault ? getDefaultToolbarPins() : (preferences?.pins ?? []);

  const pinnedLinksByGroup = (groupKey: string) =>
    effectivePins
      .filter((p) => p.groupKey === groupKey)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((p) => p.itemRouterLink);

  const togglePin = (groupKey: string, itemRouterLink: string) => {
    const current = effectivePins;
    const exists = current.some((p) => p.groupKey === groupKey && p.itemRouterLink === itemRouterLink);
    const next = exists
      ? current.filter((p) => !(p.groupKey === groupKey && p.itemRouterLink === itemRouterLink))
      : [
          ...current,
          {
            groupKey,
            itemRouterLink,
            sortOrder: current.filter((p) => p.groupKey === groupKey).length,
          },
        ];
    saveMutation.mutate({ isEnabled: preferences?.isEnabled ?? true, pins: next });
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "stretch",
        height: 58,
        pl: 2,
        pr: 1,
        background: TOOLBAR_BG,
        borderBottom: `1px solid ${HAIRLINE}`,
      }}
    >
      {/* Scrollable - home + module groups, with a visible scrollbar so a
          group like Production isn't just cut off when space runs short. */}
      <Box
        sx={{
          display: "flex",
          alignItems: "stretch",
          gap: 0.5,
          flex: 1,
          minWidth: 0,
          overflowX: "auto",
          // A visible (if thin) scrollbar, not a hidden one - hiding it gave
          // no clue that groups past the visible edge (e.g. Production) were
          // reachable by scrolling rather than simply cut off.
          scrollbarWidth: "thin",
          scrollbarColor: `${copperTextColor} transparent`,
          "&::-webkit-scrollbar": { height: 5 },
          "&::-webkit-scrollbar-thumb": { backgroundColor: copperTextColor, borderRadius: 3 },
          "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
        }}
      >
        <Tooltip title="Dashboard">
          <IconButton onClick={() => navigate("/")} sx={{ color: copperTextColor, flex: "none", alignSelf: "center" }}>
            <HomeOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem sx={{ borderColor: HAIRLINE, mx: 0.5 }} />

        {groups.map((group, idx) => {
          const pinned = pinnedLinksByGroup(group.routerLink);
          const pinnedSubMenus = group.subMenus.filter((sm) => pinned.includes(sm.routerLink));
          return (
            <Box key={group.routerLink} sx={{ display: "flex", alignItems: "center", gap: 0.25, flex: "none" }}>
              <Tooltip title={GROUP_FULL_NAMES[group.routerLink]}>
                {/* Same footprint as the "+" button (30x30, radius 1) - the
                    white outline sits 3px outside it rather than flush
                    against its edge, with the gap staying the toolbar's own
                    background while the button itself is copper-filled. */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    alignSelf: "center",
                    width: 30,
                    height: 30,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: ".04em",
                    color: "#000000",
                    background: copperTextColor,
                    borderRadius: 1,
                    outline: "1.5px solid #FFFFFF",
                    outlineOffset: "3px",
                    mr: 2,
                    ml: 0.5,
                    whiteSpace: "nowrap",
                  }}
                >
                  {GROUP_LABELS[group.routerLink]}
                </Box>
              </Tooltip>
              {pinnedSubMenus.length === 0 && (
                <Typography sx={{ fontSize: 11.5, color: TEXT_WHITE, opacity: 0.6, fontStyle: "italic", mr: 0.5, whiteSpace: "nowrap", alignSelf: "center" }}>
                  no pins yet
                </Typography>
              )}
              {pinnedSubMenus.map((sm) => {
                const active = location.pathname.includes(`/${sm.routerLink}`);
                return (
                  <Tooltip key={sm.routerLink} title={sm.label}>
                    <IconButton
                      onClick={() => navigate(`/${sm.routerLink}`)}
                      sx={active ? { ...activeButtonSx, alignSelf: "center" } : { color: TEXT_WHITE, alignSelf: "center" }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 700 }}>
                        {getItemAbbreviation(sm.routerLink, sm.label)}
                      </span>
                    </IconButton>
                  </Tooltip>
                );
              })}
              <Tooltip title="Add / remove pins">
                <IconButton
                  size="small"
                  onClick={(e) => setPickerAnchor({ el: e.currentTarget, groupKey: group.routerLink })}
                  sx={{ border: `1.5px solid ${copperTextColor}`, color: copperTextColor, borderRadius: 1, alignSelf: "center" }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {idx < groups.length - 1 && (
                <Divider orientation="vertical" flexItem sx={{ borderColor: HAIRLINE, mx: 1 }} />
              )}
            </Box>
          );
        })}
      </Box>

      <Popover
        open={!!pickerAnchor}
        anchorEl={pickerAnchor?.el}
        onClose={() => setPickerAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "#1B212C",
              backgroundImage: "none",
              border: `1px solid ${HAIRLINE}`,
              borderRadius: "10px",
              boxShadow: "0 18px 40px rgba(0,0,0,0.55)",
            },
          },
        }}
      >
        <Box sx={{ p: 1.5, minWidth: 260 }}>
          {pickerAnchor &&
            groups
              .find((g) => g.routerLink === pickerAnchor.groupKey)!
              .subMenus.map((sm) => (
                <Box key={sm.routerLink} sx={{ display: "flex", alignItems: "center" }}>
                  <Checkbox
                    size="small"
                    sx={checkboxSx}
                    checked={pinnedLinksByGroup(pickerAnchor.groupKey).includes(sm.routerLink)}
                    onChange={() => togglePin(pickerAnchor.groupKey, sm.routerLink)}
                  />
                  <Typography sx={{ fontSize: 13, color: TEXT_WHITE }}>{sm.label}</Typography>
                </Box>
              ))}
        </Box>
      </Popover>
    </Box>
  );
};

export default QuickAccessToolbar;
