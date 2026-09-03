import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  Typography,
  Divider,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ColorBreakdownTable, {
  type LocalColorRow,
} from "./color-breakdown-table.component";
import InfoDialog from "../common/info-dialog";
import type StyleContext from "../../interfaces/order-management/StyleContext";
import {
  useBulkSaveColorQuantityRatiosMutation,
  useSetColorRatioModeMutation,
} from "../../tanstack-hooks/custom-hooks";
import { DASHBOARD_COLORS } from "../dashboard/dashboard-theme";
import { oliveGlossSx } from "../../themes/button-color-themes";
import { primaryActionButtonSx, themedButtonLabelStyle } from "../../themes/workspace-theme";

interface ColorBreakdownProps {
  styleContext: StyleContext;
  // FIXED (2026-08-07): converted from an uncontrolled component (its own
  // useState seeded once from an "initialColors" prop) to a fully controlled
  // one, matching the pattern SizeBreakdown already uses for matrixRows. An
  // uncontrolled useState only reads its initial value on first mount - for
  // an existing style, the saved colour matrix arrives asynchronously (after
  // useGetColorSizeSavedMatrix resolves), so the old initialColors prop
  // updated *after* this component had already mounted with an empty array,
  // and the update was silently ignored. Being fully controlled means this
  // component always reflects whatever the parent's state currently holds.
  colorsList: LocalColorRow[];
  setColorsList: React.Dispatch<React.SetStateAction<LocalColorRow[]>>;
  existingColorCodes: Set<string>;
  isStyleApproved: boolean;
  colorMode: "R" | "Q";
  setColorMode: (mode: "R" | "Q") => void;
  onNextStep: (finalColors: LocalColorRow[]) => void;
}

export default function ColorBreakdown({
  styleContext,
  colorsList,
  setColorsList,
  existingColorCodes,
  isStyleApproved,
  colorMode,
  setColorMode,
  onNextStep,
}: ColorBreakdownProps) {
  const bulkQuantity = styleContext.quantity;
  const isRatioMode = colorMode === "R";

  const currentAllocatedTotal = colorsList.reduce(
    (sum, c) => sum + (Number(c.allocationWeight) || 0),
    0,
  );
  const hasZeroWeights = colorsList.some((c) => c.allocationWeight <= 0);
  // Quantity mode: entered pieces must reconcile exactly to the style's bulk
  // target, same as before. Ratio mode: entered values are relative weights
  // (e.g. 1, 2, 1) - Stage 2 (SizeBreakdown) splits the bulk quantity across
  // them proportionally, so there is nothing here for them to sum to.
  const totalQuantityMismatched =
    !isRatioMode && currentAllocatedTotal !== bulkQuantity;
  const isSetupInvalid =
    colorsList.length === 0 || hasZeroWeights || totalQuantityMismatched;

  // FIXED (2026-08-07): replaces window.alert() with the shared InfoDialog -
  // per project convention, no native browser alert/confirm popups.
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );

  const { mutateAsync: bulkSaveColorQuantityRatios } =
    useBulkSaveColorQuantityRatiosMutation();
  const { mutateAsync: setColorRatioModeOnServer } =
    useSetColorRatioModeMutation();

  const handleModeChange = (
    _: React.MouseEvent<HTMLElement>,
    newMode: "R" | "Q" | null,
  ) => {
    if (!newMode || newMode === colorMode) return;
    setColorMode(newMode);
    setColorRatioModeOnServer({
      buyerCode: styleContext.buyerCode,
      order: styleContext.order,
      typeCode: styleContext.typeCode,
      styleCode: styleContext.styleCode,
      mode: newMode,
    });
  };

  const handleProceed = async () => {
    if (isSetupInvalid) {
      setValidationMessage(
        isRatioMode
          ? "Every colour needs an allocation ratio greater than zero."
          : `Total allocated pieces (${currentAllocatedTotal}) must equal the Style total (${bulkQuantity}) exactly.`,
      );
      return;
    }

    // Persist the colour-level allocation (od_clqr equivalent) before moving
    // on to the size matrix. In Ratio mode, the actual piece quantity per
    // colour is derived proportionally from the entered ratios - same
    // zdiv(bulkQty, sumOfRatios) * ratio formula legacy used.
    const sumOfRatios = currentAllocatedTotal;
    const payload = colorsList.map((c) => ({
      buyerCode: styleContext.buyerCode,
      order: styleContext.order,
      typeCode: styleContext.typeCode,
      styleCode: styleContext.styleCode,
      color: c.colorCode,
      description: c.description,
      ratio: isRatioMode ? c.allocationWeight : 0,
      quantity: isRatioMode
        ? sumOfRatios > 0
          ? Number(
              ((bulkQuantity / sumOfRatios) * c.allocationWeight).toFixed(2),
            )
          : 0
        : c.allocationWeight,
    }));

    try {
      await bulkSaveColorQuantityRatios({
        params: {
          buyerCode: styleContext.buyerCode,
          order: styleContext.order,
          typeCode: styleContext.typeCode,
          styleCode: styleContext.styleCode,
        },
        payload,
      });
    } catch {
      // useBulkSaveColorQuantityRatiosMutation's onError already surfaces a
      // toast - stop here rather than proceeding on top of a failed save.
      return;
    }

    onNextStep(colorsList);
  };

  return (
    <Card
      sx={{
        p: 3,
        mt: 2,
        boxShadow: 3,
        backgroundColor: DASHBOARD_COLORS.cardBg,
        border: `1px solid ${DASHBOARD_COLORS.border}`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "2px",
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.accentStrong }}
          >
            Stage 1: Colour Target Allocation Setup
          </Typography>
          <Typography variant="body2" sx={{ color: DASHBOARD_COLORS.textSecondary }}>
            Define unique production colour blocks and{" "}
            {isRatioMode ? "ratios" : "piece targets"} for Style:{" "}
            <strong>{styleContext.styleCode}</strong>
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <ToggleButtonGroup
            value={colorMode}
            exclusive
            size="small"
            onChange={handleModeChange}
            sx={{
              ...oliveGlossSx,
              borderRadius: 1,
              p: "3px",
              "& .MuiToggleButton-root": {
                position: "relative",
                zIndex: 1,
                color: "#F3EADF",
                fontWeight: "bold",
                border: "none",
                borderRadius: "6px !important",
                px: 2,
                // Unselected: blends into the olive gloss bar - selected:
                // switches to the copper gloss with a checkmark, so which
                // mode is active is unmistakable at a glance.
                "&.Mui-selected": {
                  ...primaryActionButtonSx,
                },
                "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
              },
            }}
          >
            <ToggleButton value="Q">
              {colorMode === "Q" && (
                <CheckCircleIcon sx={{ fontSize: 16, mr: 0.5, position: "relative", zIndex: 1 }} />
              )}
              <span style={themedButtonLabelStyle}>Quantity</span>
            </ToggleButton>
            <ToggleButton value="R">
              {colorMode === "R" && (
                <CheckCircleIcon sx={{ fontSize: 16, mr: 0.5, position: "relative", zIndex: 1 }} />
              )}
              <span style={themedButtonLabelStyle}>Ratio</span>
            </ToggleButton>
          </ToggleButtonGroup>
          <Typography
            variant="h6"
            sx={{
              display: "inline-block",
              p: 1,
              borderRadius: 1,
              fontWeight: "bold",
              backgroundColor: "rgba(159,174,94,0.18)",
              border: `1px solid ${DASHBOARD_COLORS.border}`,
              color: DASHBOARD_COLORS.accentStrong,
            }}
          >
            Bulk Style Target: {bulkQuantity.toLocaleString()} Pcs
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {colorsList.length > 0 && hasZeroWeights && (
        <Alert severity="warning" sx={{ mb: 2, fontWeight: "bold" }}>
          Attention: Some colour rows have an allocation{" "}
          {isRatioMode ? "ratio" : "quantity"} of 0.
        </Alert>
      )}

      {!isRatioMode && colorsList.length > 0 && totalQuantityMismatched && (
        <Alert
          severity={currentAllocatedTotal > bulkQuantity ? "error" : "info"}
          sx={{ mb: 2, fontWeight: "bold" }}
        >
          Quantity Bookkeeping: Total entered is{" "}
          <strong>{currentAllocatedTotal.toLocaleString()}</strong> Pcs.
          {currentAllocatedTotal < bulkQuantity
            ? ` You need to allocate ${(bulkQuantity - currentAllocatedTotal).toLocaleString()} more Pcs.`
            : ` You have over-allocated by ${(currentAllocatedTotal - bulkQuantity).toLocaleString()} Pcs.`}
        </Alert>
      )}

      {isRatioMode && colorsList.length > 0 && !hasZeroWeights && (
        <Alert severity="info" sx={{ mb: 2, fontWeight: "bold" }}>
          Ratio Mode: the {bulkQuantity.toLocaleString()} Pcs bulk target will
          be split across colours proportionally to the ratios entered below
          (total ratio weight: {currentAllocatedTotal.toLocaleString()}).
        </Alert>
      )}

      {colorsList.length > 0 && !isSetupInvalid && (
        <Alert severity="success" sx={{ mb: 2, fontWeight: "bold" }}>
          ✓{" "}
          {isRatioMode
            ? "Every colour has a valid ratio. Ready to proceed."
            : "Perfect Balance! Colour quantities match the total Style Target perfectly. Ready to proceed."}
        </Alert>
      )}

      <ColorBreakdownTable
        colors={colorsList}
        setColors={setColorsList}
        existingColorCodes={existingColorCodes}
        isStyleApproved={isStyleApproved}
        isRatioMode={isRatioMode}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button
          variant="contained"
          size="large"
          disabled={isSetupInvalid}
          onClick={handleProceed}
          sx={{ ...primaryActionButtonSx, px: 4, fontWeight: "bold" }}
        >
          <span style={themedButtonLabelStyle}>Generate Size Distribution Matrix →</span>
        </Button>
      </Box>

      <InfoDialog
        open={!!validationMessage}
        title="Validation Guard"
        message={validationMessage}
        severity="error"
        onClose={() => setValidationMessage(null)}
      />
    </Card>
  );
}
