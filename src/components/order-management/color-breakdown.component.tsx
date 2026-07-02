import React, { useState } from "react";
import { Box, Button, Card, Typography, Divider, Alert } from "@mui/material";
import ColorBreakdownTable, {
  type LocalColorRow,
} from "./color-breakdown-table.component";

interface ColorBreakdownProps {
  styleCode: string;
  bulkQuantity: number;
  initialColors: LocalColorRow[];
  onNextStep: (finalColors: LocalColorRow[]) => void;
}

export default function ColorBreakdown({
  styleCode,
  bulkQuantity,
  initialColors,
  onNextStep,
}: ColorBreakdownProps) {
  // Clean, native React state management with zero background hooks or effects
  const [colorsList, setColorsList] = useState<LocalColorRow[]>(initialColors);

  const currentAllocatedTotal = colorsList.reduce(
    (sum, c) => sum + (Number(c.allocationWeight) || 0),
    0,
  );
  const hasZeroWeights = colorsList.some((c) => c.allocationWeight <= 0);
  const totalQuantityMismatched = currentAllocatedTotal !== bulkQuantity;
  const isSetupInvalid =
    colorsList.length === 0 || hasZeroWeights || totalQuantityMismatched;

  const handleProceed = () => {
    if (isSetupInvalid) {
      alert(
        `Validation Guard: Total allocated pieces (${currentAllocatedTotal}) must equal the Style total (${bulkQuantity}) exactly.`,
      );
      return;
    }
    onNextStep(colorsList);
  };

  return (
    <Card sx={{ p: 3, mt: 2, boxShadow: 3 }}>
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
            sx={{ fontWeight: "bold", color: "#1a237e" }}
          >
            Stage 1: Colour Target Allocation Setup
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Define unique production colour blocks and piece targets for Style:{" "}
            <strong>{styleCode}</strong>
          </Typography>
        </Box>
        <Typography
          variant="h6"
          sx={{
            background: "#e8eaf6",
            p: 1,
            borderRadius: 1,
            fontWeight: "bold",
            color: "#1a237e",
          }}
        >
          Bulk Style Target: {bulkQuantity.toLocaleString()} Pcs
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {colorsList.length > 0 && hasZeroWeights && (
        <Alert severity="warning" sx={{ mb: 2, fontWeight: "bold" }}>
          Attention: Some colour rows have an allocation quantity of 0.
        </Alert>
      )}

      {colorsList.length > 0 && totalQuantityMismatched && (
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

      {colorsList.length > 0 && !isSetupInvalid && (
        <Alert severity="success" sx={{ mb: 2, fontWeight: "bold" }}>
          ✓ Perfect Balance! Colour quantities match the total Style Target
          perfectly. Ready to proceed.
        </Alert>
      )}

      <ColorBreakdownTable colors={colorsList} setColors={setColorsList} />

      <Box
        sx={{ display: "flex", justifyContent: "flex-end", marginTop: "3px" }}
      >
        <Button
          variant="contained"
          size="large"
          color="success"
          disabled={isSetupInvalid}
          onClick={handleProceed}
          sx={{ px: 4, fontWeight: "bold" }}
        >
          Generate Size Distribution Matrix →
        </Button>
      </Box>
    </Card>
  );
}
