import React, { useMemo, useState } from "react";
import { Box, Button, Card, Typography, Divider } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import SizeBreakdownTable from "./size-breakdown-table.component";
import InfoDialog from "../common/info-dialog";
import type { LocalColorRow } from "./color-breakdown-table.component";
import type { MatrixRow } from "./color-size-breakdown.component"; // Import type from parent
import { useCreateColorSizeBreakdownDetailsMutation } from "../../tanstack-hooks/custom-hooks";
import type ColorSizeBreakdownDetails from "../../interfaces/OrderManagement/ColorSizeDetails";
import type StyleContext from "../../interfaces/OrderManagement/StyleContext";
import type { ColorSizeBreakdownDetailsPayloadWithBody } from "../../interfaces/definitions";

interface SizeBreakdownProps {
  styleContext: StyleContext;
  selectedColors: LocalColorRow[];
  onBackToColors: () => void;
  onSaveComplete: () => void;
  setIsDirty: (dirty: boolean) => void;
  // 1. Accept matrix rows state directly from parent wrapper props
  matrixRows: MatrixRow[];
  setMatrixRows: React.Dispatch<React.SetStateAction<MatrixRow[]>>;
}

export default function SizeBreakdown({
  styleContext,
  selectedColors,
  onBackToColors,
  onSaveComplete,
  setIsDirty,
  matrixRows, // 2. Consume from signature hook
  setMatrixRows,
}: SizeBreakdownProps) {
  // REMOVE the old useState initialization block that used to live here!

  const columnTotals = useMemo(() => {
    console.log("size breakdown Comp: ", selectedColors);
    const totals: Record<string, number> = {};
    selectedColors.forEach((col) => {
      totals[col.colorCode] = matrixRows.reduce(
        (sum, row) => sum + (Number(row[col.colorCode]) || 0),
        0,
      );
    });
    return totals;
  }, [matrixRows, selectedColors]);

  const { mutateAsync: createNewColorSizeBreakdownDetails } =
    useCreateColorSizeBreakdownDetailsMutation();

  // FIXED (2026-08-07): replaces window.alert() with the shared InfoDialog -
  // per project convention, no native browser alert/confirm popups. The
  // success case must still wait for the user to click OK before calling
  // onSaveComplete() (which resets/exits the workspace) - see
  // handleCloseNotice below - matching the original blocking alert()
  // behaviour where onSaveComplete() only ran after the user dismissed it.
  const [notice, setNotice] = useState<{
    title: string;
    message: string;
    severity: "error" | "success";
  } | null>(null);

  const handleCloseNotice = () => {
    const wasSuccess = notice?.severity === "success";
    setNotice(null);
    if (wasSuccess) {
      onSaveComplete();
    }
  };

  const handleVerifyAndSubmit = async () => {
    const totalColorWeights = selectedColors.reduce(
      (sum, c) => sum + c.allocationWeight,
      0,
    );

    for (const col of selectedColors) {
      const enteredColumnSum = columnTotals[col.colorCode];
      if (enteredColumnSum === 0) {
        setNotice({
          title: "Validation Error",
          message: `Total size weights for colour ${col.colorCode} cannot be zero.`,
          severity: "error",
        });
        return;
      }

      // FIXED UPPERCASE ENFORCEMENT: Normalizes "q" vs "Q" comparisons cleanly
      const isExplicitPieceMode =
        String(styleContext.sizeRatio).toUpperCase() === "Q" &&
        String(styleContext.colorRatio).toUpperCase() === "Q";

      if (isExplicitPieceMode) {
        // Enforce strict piece target balance reconciliation audits
        if (enteredColumnSum !== col.allocationWeight) {
          setNotice({
            title: `Quantity Mismatch Error for Colour [${col.colorCode}]`,
            message:
              `Expected Matrix Budget Sum: ${col.allocationWeight} Pcs\n` +
              `Actual Grid Entered Total: ${enteredColumnSum} Pcs\n\n` +
              `Please balance your size columns before executing database updates.`,
            severity: "error",
          });
          return;
        }

        // const totalColorWeights = selectedColors.reduce(
        //   (sum, c) => sum + c.allocationWeight,
        //   0,
        // );

        // for (const col of selectedColors) {
        //   const enteredColumnSum = columnTotals[col.colorCode];
        //   if (enteredColumnSum === 0) {
        //     alert(
        //       `Validation Error: Total size weights for colour ${col.colorCode} cannot be zero.`,
        //     );
        //     return;
        //   }
        //   if (styleContext.sizeRatio === "Q" && styleContext.colorRatio === "Q") {
        //     if (enteredColumnSum !== col.allocationWeight) {
        //       alert(
        //         `Quantity Mismatch Error for Colour [${col.colorCode}]! Expected Matrix Sum: ${col.allocationWeight}, Actual Grid Total: ${enteredColumnSum}`,
        //       );
        //       return;
        //     }
      }
    }

    const flatApiPayload: ColorSizeBreakdownDetails[] = [];
    for (const row of matrixRows) {
      for (const col of selectedColors) {
        const gridCellInput = Number(row[col.colorCode]) || 0;
        const currentColumnTotal = columnTotals[col.colorCode];

        let targetQty = 0;
        let targetRatio = 0;

        if (styleContext.colorRatio === "R" && styleContext.sizeRatio === "R") {
          const colorSharePieces =
            (styleContext.quantity / totalColorWeights) * col.allocationWeight;
          targetRatio = gridCellInput;
          targetQty = (colorSharePieces / currentColumnTotal) * gridCellInput;
        } else if (
          styleContext.colorRatio === "Q" &&
          styleContext.sizeRatio === "R"
        ) {
          targetRatio = gridCellInput;
          targetQty =
            (col.allocationWeight / currentColumnTotal) * gridCellInput;
        } else {
          targetRatio = 0;
          targetQty = gridCellInput;
        }
        // targetQty=0

        flatApiPayload.push({
          buyerCode: Number(styleContext.buyerCode),
          order: styleContext.order,
          typeCode: Number(styleContext.typeCode),
          styleCode: styleContext.styleCode as string,
          color: col.colorCode as string,
          size: row.sizeCode as string,
          ratio: Number(targetRatio.toFixed(2)),
          quantity: Number(targetQty.toFixed(2)),
          // FIXED (2026-08-07): the description entered in Stage 1 was never
          // included in the save payload, so it was silently dropped on
          // every save. Denormalized onto every size row for this colour,
          // matching how colorCode itself is already denormalized here.
          description: col.description || "",
        });
      }
    }

    try {
      // FIX: Create a shallow copy using Array Spread syntax, preserving the array type
      const colorSizeBreakdownDetailsPayload: ColorSizeBreakdownDetails[] = [
        ...flatApiPayload,
      ];

      const fullPayload: ColorSizeBreakdownDetailsPayloadWithBody = {
        params: {
          buyerCode: flatApiPayload[0].buyerCode,
          order: flatApiPayload[0].order,
          typeCode: flatApiPayload[0].typeCode,
          styleCode: flatApiPayload[0].styleCode,
        },
        payload: colorSizeBreakdownDetailsPayload,
      };

      console.log("Syncing matrix params", fullPayload.params);
      console.log("Syncing matrix data...", fullPayload.payload);
      createNewColorSizeBreakdownDetails(fullPayload);
      setNotice({
        title: "Save Successful",
        message:
          "Breakdown matrix synced with SQL Server database via EF Core transaction successfully!",
        severity: "success",
      });
      // onSaveComplete() now runs from handleCloseNotice, once the user
      // acknowledges the dialog above - see the comment on the notice state.
    } catch (err) {
      console.log(err);
      setNotice({
        title: "Save Failed",
        message: "Failed to submit allocation matrix data.",
        severity: "error",
      });
    }
  };

  return (
    <Card sx={{ p: 3, mt: 2, boxShadow: 3, backgroundColor: "#fff" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2px",
          // backgroundColor: "#fff",
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", color: "#1a237e" }}
          >
            Stage 2: Horizontal Size Matrix Breakdown
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Input size distribution ratios or quantities across dynamic color
            boundaries.
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
            Color Mode: [{styleContext.colorRatio}] | Size Mode: [
            {styleContext.sizeRatio}]
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <SizeBreakdownTable
        matrixRows={matrixRows}
        setMatrixRows={setMatrixRows}
        selectedColors={selectedColors}
        columnTotals={columnTotals}
        setIsDirty={setIsDirty}
        unit={styleContext.unit}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "4px",
        }}
      >
        <Button variant="outlined" color="secondary" onClick={onBackToColors}>
          ← Back to Color Adjustments
        </Button>
        <Button
          variant="contained"
          size="large"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleVerifyAndSubmit}
          sx={{ px: 4, fontWeight: "bold" }}
        >
          [Esc] Save Breakdown Matrix
        </Button>
      </Box>

      <InfoDialog
        open={!!notice}
        title={notice?.title ?? ""}
        message={notice?.message ?? ""}
        severity={notice?.severity ?? "info"}
        onClose={handleCloseNotice}
      />
    </Card>
  );
}
