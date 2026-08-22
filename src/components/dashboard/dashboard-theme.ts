// Dashboard-scoped palette pilot - deliberately NOT applied to the rest of
// the app (which still uses the sky-blue #60a5fa accent everywhere). If this
// reads well after living with it, promote these into themes.ts as a
// follow-up pass rather than here, since a lot of other screens hardcode the
// blue accent directly (same scattered-hex pattern that caused the
// invisible-text bug) and touching them all is a separate, bigger change.
//
// `accent` is brand/interactive chrome only - tabs, meters, the completion
// ring, the hero KPI. Pushed warmer/brighter (chartreuse-olive rather than
// muted khaki) for more visual pop on a landing screen, while `success`
// stays a distinctly cooler teal-emerald reserved for "on track" status
// (line schedule, stock alerts) - hue, not just value, keeps the two from
// blending into each other when shown side by side. Near-blacks and the
// off-white text are warmed to match, so the accent doesn't sit on a
// colder ground than itself.
export const DASHBOARD_COLORS = {
  pageBg: "#120f08",
  cardBg: "#1a1710",
  border: "rgba(191,168,90,0.16)",
  borderStrong: "rgba(191,168,90,0.3)",
  accent: "#93A83C",
  accentStrong: "#C4DE5E",
  textPrimary: "#F6F2E4",
  textSecondary: "#B7AE86",
  success: "#22C48C",
  warning: "#E2A716",
  critical: "#D0453B",
};

// One color per production section, in Section.Code order (Cutting first).
// Shared between the section funnel and the multi-section trend chart so a
// given section reads as the same color everywhere on this dashboard.
export const SECTION_COLORS = ["#e35a24", "#e2a716", "#0aa88a", "#9138cc", "#e0327a", "#1c8fd6"];

// Zebra striping for tables - the same accent green as the order fulfillment
// meter (rgb(147,168,60), i.e. `accent` above), at low opacity so alternate
// rows read as tinted rather than filled, regardless of exactly which card
// background sits behind them.
export const ROW_ALT_BG = "rgba(147,168,60,0.18)";
