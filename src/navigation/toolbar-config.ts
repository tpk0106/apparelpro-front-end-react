import { navbarData } from "../data/nav-data";
import type { ToolbarPin } from "../interfaces/toolbar/Toolbar";

// Order here is the display order on the toolbar/settings panel, not just a
// membership filter - Orderwise Inventory before General Inventory per the
// user's requested swap.
export const SCOPED_GROUPS = ["ordermanagement", "orderwiseinventory", "generalinventory", "productioncontrol"];

// Short codes shown on the toolbar strip itself (space is tight with 4
// groups on one row); the full name still shows as each label's tooltip.
export const GROUP_LABELS: Record<string, string> = {
  ordermanagement: "OM",
  generalinventory: "GI",
  orderwiseinventory: "OWI",
  productioncontrol: "PR",
};

export const GROUP_FULL_NAMES: Record<string, string> = {
  ordermanagement: "Order Management",
  generalinventory: "General Inventory",
  orderwiseinventory: "Orderwise Inventory",
  productioncontrol: "Production",
};

// Hand-picked codes for items where a plain 2-letter slice of the label
// reads badly (e.g. "Order Confirmation Routine" -> "OR" is meaningless).
// Anything not listed here falls back to the first two letters of its label.
export const ITEM_ABBREVIATIONS: Record<string, string> = {
  // Order Management
  po: "OC", // Order Confirmation Routine
  "material-consumption": "MC", // Material Consumptions
  "trim-sheet-approval": "ATS", // Approve Trim Sheet
  additional: "AC", // Additional Costs per Garment
  subcont: "SC", // Sub Contracts
  "supplier-po": "POE", // Purchase Order Entry
  "stylewise-events": "SWE", // Style-wise Events

  // General Inventory
  "general-srn": "SR",
  "general-gin": "GI",
  "general-grn": "GR",
  "general-rtn": "GN",
  "general-gtn": "GT",
  "general-ogtn": "GO",
  "general-srtn": "SU",
  "general-dgn": "DG",
  ain: "AI",
  "general-san": "SA",
  "general-po": "PO",
  "general-stock-master": "SM",

  // Orderwise Inventory. Note: "dtn" backs two different nav-data.ts labels
  // ("Direct Goods Transfer Note" and "Direct Transfer Note") under the same
  // routerLink - a pre-existing duplicate in that file, not introduced here -
  // so only one code can apply; using DT per the user's call.
  srn: "GQ",
  "gin-cascade": "GI",
  "grn-cascade": "GR",
  rtn: "GN",
  gtn: "GT",
  dtn: "DT",
  "supplier-return-note": "SR",
  dgn: "DN",
  arn: "AR",
  san: "SA",

  // Production
  "daily-production-time-ticket": "DP",
  "daily-production-entry": "AP",
  "estimated-production-entry": "ES",
  "production-line-allocation": "PA",
  "style-component-breakdown": "CB",
  "style-operation-breakdown": "OB",
  "end-of-production-confirmation": "EP",
  "estimated-production-line-allocation": "LA",
  "production-progress-graph": "PG",
};

export const getItemAbbreviation = (routerLink: string, label: string): string =>
  ITEM_ABBREVIATIONS[routerLink] ?? label.trim().slice(0, 2).toUpperCase();

// First-time default: whatever nav-data.ts already marks `pinned: true`
// within the 4 scoped groups - used only until a user saves their own
// preference (see ToolbarPreference.isDefault).
export const getDefaultToolbarPins = (): ToolbarPin[] =>
  navbarData
    .filter((g) => SCOPED_GROUPS.includes(g.routerLink))
    .flatMap((g) =>
      g.subMenus
        .filter((sm) => sm.pinned)
        .map((sm, idx) => ({ groupKey: g.routerLink, itemRouterLink: sm.routerLink, sortOrder: idx })),
    );
