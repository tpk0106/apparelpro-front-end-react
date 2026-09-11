import { useState } from "react";
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import type { Style } from "../../interfaces/order-management/Style";
import ColorBreakdown from "./color-breakdown.component";
import type { LocalColorRow } from "./color-breakdown-table.component";
import SizeBreakdown from "./size-breakdown.component";
import type StyleContext from "../../interfaces/order-management/StyleContext";
import {
  useGetColorSizeSavedMatrix,
  useGetColorQuantityRatiosByStyle,
  useGetStyleByBots,
} from "../../tanstack-hooks/custom-hooks";
import type { ColorSizeDetailsServiceModel } from "../material-consumption/material-consumption.types";
import { DASHBOARD_COLORS } from "../dashboard/dashboard-theme";
import { copperTextColor } from "../../themes/button-color-themes";

// 1. Move the MatrixRow interface here so it's accessible globally
export interface MatrixRow {
  sizeCode: string;
  [colorCode: string]: string | number;
}

interface WorkspaceProps {
  buyerCode: number;
  order: string;
  selectedStyleFromGrid: Style | null;
  isMatrixDirty: boolean;
  setIsMatrixDirty: (dirty: boolean) => void;
  onResetSelection: () => void;
}

const steps = ["Verify Colour Groups", "Populate Size Matrix"];

export default function ColorSizeBreakdown({
  buyerCode,
  order,
  selectedStyleFromGrid,
  // isMatrixDirty,
  setIsMatrixDirty,
  onResetSelection,
}: WorkspaceProps) {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [configuredColors, setConfiguredColors] = useState<LocalColorRow[]>([]);

  // FIXED (2026-08-07): tracks which colour codes were already saved for
  // this style before this session started (captured once, at hydration -
  // see below), as distinct from colours added locally via "Add Product
  // Colour" and not yet saved. Used to gate the Delete action per row -
  // see color-breakdown-table.component.tsx.
  const [existingColorCodes, setExistingColorCodes] = useState<Set<string>>(
    new Set(),
  );

  // A Supplier Purchase Order has already been raised against this style -
  // detected reactively when ColorBreakdown's save attempt fails for exactly
  // that reason (see color-breakdown.component.tsx's handleProceed). Once
  // true, the Size Matrix step renders view-only instead of blocking
  // navigation to it entirely.
  const [isLockedByPurchaseOrder, setIsLockedByPurchaseOrder] = useState(false);

  // 2. Add the Matrix State Memory here at the master parent level
  const [matrixRows, setMatrixRows] = useState<MatrixRow[]>([
    { sizeCode: "S" },
    { sizeCode: "M" },
    { sizeCode: "L" },
    { sizeCode: "XL" },
  ]);

  // Ratio/Quantity mode for each stage - set by the user via the toggle at
  // the top of each stage (see ColorBreakdown/SizeBreakdown), persisted to
  // Style.ColorRatio/Style.SizeRatio. Initialized from whatever the style
  // already has saved, defaulting to Quantity mode for a brand-new style.
  const [colorMode, setColorMode] = useState<"R" | "Q">("Q");
  const [sizeMode, setSizeMode] = useState<"R" | "Q">("Q");

  const [prevStyleId, setPrevStyleId] = useState<string | null>(null);
  const currentStyleId = selectedStyleFromGrid
    ? `${selectedStyleFromGrid.typeCode}-${selectedStyleFromGrid.styleCode}`
    : null;

  if (currentStyleId !== prevStyleId) {
    setPrevStyleId(currentStyleId);
    setActiveStep(0);
    setConfiguredColors([]);
    setExistingColorCodes(new Set());
    setIsLockedByPurchaseOrder(false);

    // 3. Reset sizes back to blank base values ONLY when switching to an entirely different style
    setMatrixRows([
      { sizeCode: "S" },
      { sizeCode: "M" },
      { sizeCode: "L" },
      { sizeCode: "XL" },
    ]);
  }

  // FIXED: colorMode/sizeMode are no longer initialized from
  // selectedStyleFromGrid.colorRatio/sizeRatio above - that prop is a
  // one-time snapshot captured when the user clicked into this style from
  // the Style Details grid, and the grid's own cached list is never
  // refetched when the mode toggle updates Style.ColorRatio/SizeRatio
  // server-side. Revisiting a style within the same session (without a full
  // page reload) kept showing the mode from before the last toggle. This
  // fetches the style fresh, independent of the grid's cache, and re-syncs
  // colorMode/sizeMode whenever its persisted mode actually changes -
  // including right after a toggle (useSetColorRatioModeMutation/
  // useSetSizeRatioModeMutation invalidate this same query on success).
  const { data: freshStyle, isLoading: isStyleLoading } = useGetStyleByBots(
    {
      buyerCode: buyerCode,
      order: order,
      typeCode: selectedStyleFromGrid?.typeCode || 0,
      styleCode: selectedStyleFromGrid?.styleCode || "",
    },
    !!selectedStyleFromGrid,
  );

  const [prevModeSyncKey, setPrevModeSyncKey] = useState<string | null>(null);
  const modeSyncKey = freshStyle
    ? `${freshStyle.typeCode}-${freshStyle.styleCode}-${freshStyle.colorRatio}-${freshStyle.sizeRatio}`
    : null;

  if (modeSyncKey && modeSyncKey !== prevModeSyncKey) {
    setPrevModeSyncKey(modeSyncKey);
    setColorMode(
      freshStyle!.colorRatio?.trim().toUpperCase() === "R" ? "R" : "Q",
    );
    setSizeMode(
      freshStyle!.sizeRatio?.trim().toUpperCase() === "R" ? "R" : "Q",
    );
  }

  // if existing color/size breakdown
  const { data: savedMatrixData, isLoading: isMatrixLoading } =
    useGetColorSizeSavedMatrix(
      {
        buyerCode: buyerCode,
        order: order,
        typeCode: selectedStyleFromGrid?.typeCode || 0,
        styleCode: selectedStyleFromGrid?.styleCode || "",
      },
      !!selectedStyleFromGrid, // Skip query if no active style context is selected yet
    );

  // Extract a safe, non-undefined data tracking reference baseline array
  const activeDataArray = savedMatrixData || [];

  // 1. Evaluate if pre-existing style records exist inside SQL Server
  const hasExistingDbEntries = activeDataArray.length > 0;

  // Colour-level allocation rows (od_clqr equivalent) - the real source of
  // truth for what the user originally entered at Stage 1, including the
  // Ratio value for a style saved in Ratio mode (which summing
  // ColorSizeDetails.Qty alone can never recover).
  const { data: savedColorQuantityRatios, isLoading: isRatiosLoading } =
    useGetColorQuantityRatiosByStyle(
      {
        buyerCode: buyerCode,
        order: order,
        typeCode: selectedStyleFromGrid?.typeCode || 0,
        styleCode: selectedStyleFromGrid?.styleCode || "",
      },
      !!selectedStyleFromGrid,
    );
  const activeRatioArray = savedColorQuantityRatios || [];

  // 2. Compute the existing colour allocation totals (Stage 1 data), used to
  // pre-populate the Colour screen for a style that already has a saved
  // matrix - see the hydration block below.
  let matrix: LocalColorRow[] = [];
  if (activeRatioArray.length > 0) {
    // Preferred path: real Stage 1 rows exist - use them directly, showing
    // Ratio or Quantity per the style's saved mode. Deliberately reads
    // freshStyle (the query's own data) rather than the local colorMode
    // state: colorMode is set from freshStyle one render later (a setState
    // scheduled during render doesn't take effect until the next render), so
    // reading colorMode here on the very first qualifying render would still
    // see the stale "Q" default and hydrate with the wrong values - freshStyle
    // itself carries no such lag once its query has resolved (see the
    // isStyleLoading gate below, which holds off hydration until it has).
    const isRatioStyle = freshStyle?.colorRatio?.trim().toUpperCase() === "R";
    matrix = activeRatioArray.map((item, idx) => ({
      id: idx + 1,
      colorCode: String(item.color).toUpperCase().trim(),
      description: item.description || "",
      allocationWeight: isRatioStyle ? item.ratio : item.quantity,
    }));
  } else if (hasExistingDbEntries) {
    // Fallback for data saved before ColorQuantityRatios existed - derive
    // colour totals by summing the size matrix, same as before.
    const colorTotalQty: Record<string, number> = {};
    // FIXED (2026-08-07): previously this only tallied quantities and then
    // fabricated a placeholder description ("Allocated Production Block
    // ...") on every reload, silently discarding whatever the user had
    // actually typed into the Colour Description field. Now captures the
    // real saved description per colour (every size row for a given colour
    // carries the same description, so the first non-blank one found wins).
    const colorDescriptions: Record<string, string> = {};
    activeDataArray.forEach((item: ColorSizeDetailsServiceModel) => {
      if (item?.color) {
        const colorKey = String(item.color).toUpperCase().trim();
        colorTotalQty[colorKey] =
          (colorTotalQty[colorKey] || 0) + (item.qty || 0);

        if (!colorDescriptions[colorKey] && item.description) {
          colorDescriptions[colorKey] = item.description;
        }
      }
    });

    matrix = Object.keys(colorTotalQty).map((colorName, idx) => ({
      id: idx + 1,
      colorCode: colorName,
      description: colorDescriptions[colorName] || "",
      allocationWeight: colorTotalQty[colorName],
    }));
  }

  // FIXED HYDRATION ROUTINE: push database records into state once per style
  // load, for BOTH the colour screen and the size matrix screen. Previously
  // only matrixRows was hydrated here, which is why the size screen already
  // showed existing data correctly while the colour screen never did.
  //
  // Deliberately NOT keyed on colorMode/sizeMode - doing so would re-run
  // hydration (and silently discard any in-progress unsaved edits) every
  // time the user clicks the Ratio/Quantity toggle mid-session, which should
  // only relabel the numbers already on screen, not reset them. Instead,
  // eligibility to hydrate at all is gated below on isStyleLoading being
  // false, guaranteeing freshStyle (and therefore the isRatioStyle checks
  // above/below, which read freshStyle directly - see the comment there) is
  // already resolved before this ever runs, so it can only ever hydrate
  // using the correct, already-settled mode - never a stale "Q" default.
  const [prevHydrationKey, setPrevHydrationKey] = useState<string | null>(null);
  const currentHydrationKey = hasExistingDbEntries
    ? `${selectedStyleFromGrid?.styleCode}-${activeDataArray.length}-${activeRatioArray.length}`
    : "NEW";
  const readyToHydrate =
    !isMatrixLoading && !isRatiosLoading && !isStyleLoading;

  if (readyToHydrate && currentHydrationKey !== prevHydrationKey) {
    setPrevHydrationKey(currentHydrationKey);

    if (hasExistingDbEntries) {
      const uniqueSizesInDb = Array.from(
        new Set(
          activeDataArray.map((item: ColorSizeDetailsServiceModel) =>
            String(item?.size || "")
              .trim()
              .toUpperCase(),
          ),
        ),
      );
      const targetSizes =
        uniqueSizesInDb.length > 0 ? uniqueSizesInDb : ["S", "M", "L", "XL"];

      const initialRows = targetSizes.map((sizeName) => {
        const rowObject: MatrixRow = { sizeCode: sizeName };
        const matchingDbRowsForSize = activeDataArray.filter(
          (item: ColorSizeDetailsServiceModel) =>
            String(item?.size || "")
              .trim()
              .toUpperCase() === sizeName,
        );

        const isSizeRatioStyle =
          freshStyle?.sizeRatio?.trim().toUpperCase() === "R";
        matchingDbRowsForSize.forEach((item: ColorSizeDetailsServiceModel) => {
          if (item?.color) {
            // FIXED: previously always read item.qty regardless of mode -
            // in Ratio mode this silently showed the computed piece counts
            // instead of the originally entered per-size ratios. Reads
            // freshStyle directly rather than the local sizeMode state, same
            // reasoning as isRatioStyle above (no render-lag).
            rowObject[item.color] =
              (isSizeRatioStyle ? item.ratio : item.qty) || 0;
          }
        });
        return rowObject;
      });

      setMatrixRows(initialRows); // Hydrate the size-matrix state container
      setConfiguredColors(matrix); // FIXED: also hydrate the colour-screen state container
      setExistingColorCodes(new Set(matrix.map((c) => c.colorCode)));
    }
  }

  // FIXED (2026-08-07): the step and colour source used to be forced to
  // "Size" / the DB-derived matrix whenever an existing style had saved
  // data, which is exactly why an existing style always skipped the Colour
  // screen and "Back to Colour Adjustments" appeared to do nothing (it set
  // activeStep back to 0, but this line ignored activeStep entirely and
  // recomputed step 1 again on every render). Both new and existing styles
  // now walk through the same two-step flow, driven purely by activeStep;
  // the only difference is that an existing style's Colour screen starts
  // pre-populated with its saved allocation (via the hydration above)
  // instead of starting blank.
  const currentWorkingStep = activeStep;
  const currentWorkingColors = configuredColors;
  const currentWorkingRows = matrixRows;

  // A style with an approvedDate is locked - its already-saved colours
  // (existingColorCodes) must stay intact, so their Delete action is
  // hidden. A colour added locally and not yet saved can still be removed
  // regardless of the style's approval state.
  const isStyleApproved = !!selectedStyleFromGrid?.approvedDate;

  if (!selectedStyleFromGrid) {
    return (
      <Box sx={{ padding: "3px" }}>
        <Alert severity="info" variant="filled">
          No Style context selected. Please return to the{" "}
          <strong>[Style Details]</strong> tab and click the{" "}
          <strong>Grid matrix button</strong> on a style row to begin allocation
          formatting.
        </Alert>
      </Box>
    );
  }

  // FIXED: wait for the existing-matrix lookup to resolve before rendering
  // the Colour/Size screens. Without this, the Colour screen could mount
  // (and permanently capture its initial state) before the hydration above
  // had a chance to run, showing an empty colour list for an existing style.
  if (isMatrixLoading || isRatiosLoading || isStyleLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  const styleContextSanitized: StyleContext = {
    buyerCode: buyerCode,
    order: order,
    typeCode: selectedStyleFromGrid.typeCode,
    styleCode: selectedStyleFromGrid.styleCode,
    quantity: Number(selectedStyleFromGrid.quantity) || 0,
    colorRatio: colorMode,
    sizeRatio: sizeMode,
    unit: selectedStyleFromGrid.unit,
  };

  const handleColorConfigurationComplete = (
    confirmedColors: LocalColorRow[],
  ) => {
    setConfiguredColors(confirmedColors);
    setActiveStep(1);
  };

  const handleReturnToColors = () => {
    setActiveStep(0); // Simply switches step components—matrixRows stays safely in memory!
  };

  const handleWorkflowComplete = () => {
    setActiveStep(0);
    setConfiguredColors([]);
    setIsMatrixDirty(false);
    onResetSelection();
  };

  return (
    <Box sx={{ width: "100%", mt: 1 }}>
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 3,
          backgroundColor: DASHBOARD_COLORS.cardBg,
          border: `1px solid ${DASHBOARD_COLORS.border}`,
        }}
      >
        <Stepper
          activeStep={currentWorkingStep}
          alternativeLabel
          sx={{
            "& .MuiStepIcon-root": {
              color: "#F3EADF",
              "&.Mui-active, &.Mui-completed": { color: copperTextColor },
            },
            "& .MuiStepIcon-text": { fill: "#14120A" },
            "& .MuiStepConnector-line": {
              borderColor: DASHBOARD_COLORS.border,
            },
            "& .MuiStepLabel-label": {
              color: DASHBOARD_COLORS.accentStrong,
              fontWeight: 600,
              "&.Mui-active, &.Mui-completed": {
                color: DASHBOARD_COLORS.accentStrong,
                fontWeight: 700,
              },
            },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Active Working Target banner */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 3,
          backgroundColor: DASHBOARD_COLORS.cardBg,
          borderColor: DASHBOARD_COLORS.border,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.accentStrong }}
          >
            Active Working Target: Style Code [{" "}
            {styleContextSanitized.styleCode} ]
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textSecondary }}
          >
            Buyer: {buyerCode} | Order Ref: {order} | Bulk Target Size:{" "}
            {styleContextSanitized.quantity.toLocaleString()}{" "}
            {selectedStyleFromGrid.unit || "Pcs"}
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right", color: DASHBOARD_COLORS.textSecondary }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: "bold", display: "block" }}
          >
            COLOUR MODE:{" "}
            {styleContextSanitized.colorRatio === "R"
              ? "Ratio Splitting [R]"
              : "Explicit Pieces [Q]"}
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: "bold", display: "block", color: DASHBOARD_COLORS.textSecondary }}
          >
            SIZE MATRIX MODE:{" "}
            {styleContextSanitized.sizeRatio === "R"
              ? "Ratio Splitting [R]"
              : "Explicit Pieces [Q]"}
          </Typography>
        </Box>
      </Paper>

      {/* Step 1 of 2: Colour allocation - for a brand-new style this starts
          blank; for an existing style it starts pre-populated with the
          saved matrix's colour totals (see the hydration block above). */}
      {currentWorkingStep === 0 && (
        <ColorBreakdown
          styleContext={styleContextSanitized}
          colorsList={currentWorkingColors}
          setColorsList={setConfiguredColors}
          existingColorCodes={existingColorCodes}
          isStyleApproved={isStyleApproved}
          colorMode={colorMode}
          setColorMode={setColorMode}
          onNextStep={handleColorConfigurationComplete}
          isLockedByPurchaseOrder={isLockedByPurchaseOrder}
          onPoLockDetected={() => setIsLockedByPurchaseOrder(true)}
        />
      )}

      {/* Step 2 of 2: Size matrix - always follows Colour, for both new and
          existing styles. */}
      {currentWorkingStep === 1 && (
        <SizeBreakdown
          styleContext={styleContextSanitized}
          selectedColors={currentWorkingColors}
          onBackToColors={handleReturnToColors}
          onSaveComplete={handleWorkflowComplete}
          setIsDirty={setIsMatrixDirty}
          matrixRows={currentWorkingRows}
          setMatrixRows={setMatrixRows}
          sizeMode={sizeMode}
          setSizeMode={setSizeMode}
          isLockedByPurchaseOrder={isLockedByPurchaseOrder}
        />
      )}
    </Box>
  );
}
