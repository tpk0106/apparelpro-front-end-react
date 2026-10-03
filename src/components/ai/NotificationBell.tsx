// ─────────────────────────────────────────────────────────────────────────────
// 🎓 NOTIFICATION BELL COMPONENT
// Phase 3: Anomaly Detection & Alerts — the bell icon that lives in the header.
//
// This component has TWO responsibilities:
//   1. BADGE: Show a red badge with the count of unread (NEW) alerts
//   2. DROPDOWN: When clicked, show a compact list of recent alerts
//
// 🎓 ARCHITECTURE DECISIONS:
// - The badge count uses useUnreadAlertCount which polls every 30 seconds
// - The recent alerts dropdown uses useRecentAlerts which only fetches
//   when the dropdown is open (enabled: dropdownOpen)
// - Clicking an alert in the dropdown navigates to the full alert panel
// - The dropdown auto-closes when clicking outside (ClickAwayListener)
//
// 🎓 WHY MUI Popper (NOT absolute positioning)?
// The header's parent div has overflow:hidden, which clips any absolutely
// positioned dropdown. MUI's Popper renders via a React Portal — the
// dropdown DOM node lives outside the header tree entirely, so no parent
// overflow can clip it. We pair it with ClickAwayListener for close-on-
// outside-click, and we still have full control over styling.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton, Badge, Tooltip, Popper, ClickAwayListener, Paper } from "@mui/material";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
// 🎓 Using base icon variants — this project's @mui/icons-material doesn't
// include the "Outline" variants. WarningAmber replaces ErrorOutline
// (established pattern in AiVoicePanel.tsx).
import DeleteIcon from "@mui/icons-material/Delete";
import ErrorIcon from "@mui/icons-material/WarningAmber";
import type { AnomalyAlertSummary, AnomalyType, AnomalySeverity } from "../../interfaces/ai/anomaly-alert.interfaces";
import {
  useUnreadAlertCount,
  useRecentAlerts,
} from "../../tanstack-hooks/ai/anomaly-alert.hooks";

// ─── Severity color mapping ─────────────────────────────────
// 🎓 These colors match the design system's semantic color palette.
// CRITICAL = red, HIGH = orange, MEDIUM = amber, LOW = sky blue.
// Using a record type ensures TypeScript catches any missing severity.

const severityColors: Record<AnomalySeverity, string> = {
  CRITICAL: "#ef4444",  // red-500
  HIGH: "#f97316",      // orange-500
  MEDIUM: "#f59e0b",    // amber-500
  LOW: "#60a5fa",       // sky blue (matches the app's accent)
};

// 🎓 Short labels for the severity badge in each alert row
const severityLabels: Record<AnomalySeverity, string> = {
  CRITICAL: "CRIT",
  HIGH: "HIGH",
  MEDIUM: "MED",
  LOW: "LOW",
};

// ─── Anomaly type icon mapping ──────────────────────────────
// 🎓 Each anomaly type gets a distinct icon so merchandisers can
// visually scan the dropdown and immediately know what kind of
// anomaly each alert represents.

const AnomalyTypeIcon = ({ type }: { type: AnomalyType }) => {
  switch (type) {
    case "OVER_CONSUMPTION":
      // 🎓 Warning triangle = something exceeded its expected amount
      return <WarningAmberIcon sx={{ fontSize: 18, color: "#f59e0b" }} />;
    case "PRICE_SPIKE":
      // 🎓 Trending up arrow = price went higher than expected
      return <TrendingUpIcon sx={{ fontSize: 18, color: "#ef4444" }} />;
    case "WASTE_DAMAGE":
      // 🎓 Trash/delete icon = material was wasted or damaged
      return <DeleteIcon sx={{ fontSize: 18, color: "#f97316" }} />;
    default:
      // 🎓 Fallback — should never happen with our union type, but
      // TypeScript exhaustiveness checking appreciates the default
      return <ErrorIcon sx={{ fontSize: 18, color: "#8B93A1" }} />;
  }
};

// ─── Time-ago formatter ─────────────────────────────────────
// 🎓 Converts an ISO date string to a human-readable relative time.
// "2 min ago", "3 hrs ago", "1 day ago" — much more scannable than
// full timestamps in a compact dropdown.

const formatTimeAgo = (isoDate: string): string => {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  // 🎓 Beyond a week, show the actual date (shorter format)
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
};

// ─── Anomaly type human-readable labels ─────────────────────
const anomalyTypeLabels: Record<AnomalyType, string> = {
  OVER_CONSUMPTION: "Over-Consumption",
  PRICE_SPIKE: "Price Spike",
  WASTE_DAMAGE: "Waste / Damage",
};

// ─── Component ──────────────────────────────────────────────

const NotificationBell = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // 🎓 Anchor element ref for the Popper — the bell icon button.
  // Popper positions itself relative to this element but renders in
  // a React Portal outside the header DOM tree, so overflow:hidden
  // on any parent cannot clip the dropdown.
  const anchorRef = useRef<HTMLButtonElement>(null);

  // 🎓 Always poll unread count (every 30s via the hook's refetchInterval).
  // This keeps the badge number fresh even when the dropdown is closed.
  const { data: unreadCount = 0 } = useUnreadAlertCount();

  // 🎓 Only fetch recent alerts when the dropdown is actually open.
  // This avoids unnecessary API calls while the bell is just sitting there.
  const { data: recentAlerts = [] } = useRecentAlerts(dropdownOpen);

  // 🎓 Close dropdown when clicking outside — MUI ClickAwayListener
  // wraps the Popper content and calls this on any outside click.
  const handleClickAway = useCallback(() => {
    setDropdownOpen(false);
  }, []);

  // 🎓 Toggle dropdown open/closed on bell click
  const handleBellClick = useCallback(() => {
    setDropdownOpen((prev) => !prev);
  }, []);

  // 🎓 Navigate to the full anomaly alert panel when "View All" is clicked
  const handleViewAll = useCallback(() => {
    setDropdownOpen(false);
    navigate("/anomaly-alerts");
  }, [navigate]);

  // 🎓 Navigate to alert detail (for now, goes to the panel with the alert
  // highlighted — we can add deep-linking later)
  const handleAlertClick = useCallback(
    (_alert: AnomalyAlertSummary) => {
      setDropdownOpen(false);
      navigate("/anomaly-alerts");
    },
    [navigate],
  );

  return (
    <>
      {/* ── Bell icon button with badge ──────────────────── */}
      <Tooltip title="Anomaly Alerts">
        <IconButton
          ref={anchorRef}
          onClick={handleBellClick}
          size="small"
          sx={{ color: "#60a5fa" }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            max={99}
            sx={{
              "& .MuiBadge-badge": {
                // 🎓 Small font for the badge number, positioned slightly
                // higher than default so it doesn't overlap the bell icon
                fontSize: "0.65rem",
                minWidth: "18px",
                height: "18px",
                padding: "0 4px",
              },
            }}
          >
            <NotificationsOutlinedIcon fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* ── Dropdown panel (rendered via Portal) ────────── */}
      {/* 🎓 MUI Popper renders through a React Portal — its DOM node
          lives at document.body, completely outside the header's overflow:hidden
          container. This is why the dropdown is no longer clipped.
          placement="bottom-end" aligns the panel's right edge with the bell's
          right edge, preventing it from overflowing the viewport. */}
      <Popper
        open={dropdownOpen}
        anchorEl={anchorRef.current}
        placement="bottom-end"
        sx={{ zIndex: 9999 }}
        modifiers={[
          {
            // 🎓 8px gap between the bell icon and the dropdown
            name: "offset",
            options: { offset: [0, 8] },
          },
        ]}
      >
        <ClickAwayListener onClickAway={handleClickAway}>
          <Paper
            className="w-[360px] rounded-lg border border-gray-700 shadow-2xl"
            sx={{ backgroundColor: "#141922", backgroundImage: "none" }}
          >
            {/* ── Header ─────────────────────────────────── */}
            <div
              className="flex items-center justify-between px-4 py-3
                         border-b border-gray-700"
            >
              <span className="text-sm font-semibold text-white">
                Anomaly Alerts
              </span>
              {unreadCount > 0 && (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: "#ef4444", color: "#fff" }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            {/* ── Alert list ─────────────────────────────── */}
            <div className="max-h-[400px] overflow-y-auto scrollbar-none">
              {recentAlerts.length === 0 ? (
                // 🎓 Empty state — shown when there are no recent alerts
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  No recent alerts
                </div>
              ) : (
                recentAlerts.map((alert) => (
                  <div
                    key={alert.alertId}
                    onClick={() => handleAlertClick(alert)}
                    className="flex items-start gap-3 px-4 py-3
                               cursor-pointer transition-colors duration-150
                               hover:bg-[#1a2030] border-b border-gray-800"
                  >
                    {/* 🎓 Left: anomaly type icon */}
                    <div className="mt-0.5 flex-shrink-0">
                      <AnomalyTypeIcon type={alert.anomalyType} />
                    </div>

                    {/* 🎓 Middle: description + metadata */}
                    <div className="flex-1 min-w-0">
                      {/* Alert type label + severity badge */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-300">
                          {anomalyTypeLabels[alert.anomalyType]}
                        </span>
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                          style={{
                            backgroundColor: `${severityColors[alert.severity]}20`,
                            color: severityColors[alert.severity],
                          }}
                        >
                          {severityLabels[alert.severity]}
                        </span>
                      </div>

                      {/* Description — truncated to 2 lines */}
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {alert.description}
                      </p>

                      {/* Style + time metadata */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-gray-500">
                          {alert.styleCode} · {alert.order}
                        </span>
                        <span className="text-[10px] text-gray-600">
                          {formatTimeAgo(alert.detectedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ── Footer: View All link ─────────────────── */}
            <div className="border-t border-gray-700 px-4 py-2.5 text-center">
              <button
                onClick={handleViewAll}
                className="text-xs font-medium text-[#60a5fa]
                           hover:text-white transition-colors duration-150"
              >
                View All Alerts
              </button>
            </div>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};

export default NotificationBell;
