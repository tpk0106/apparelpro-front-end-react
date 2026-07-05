import { useState } from "react";
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Alert,
} from "@mui/material";
import type { Style } from "../../interfaces/OrderManagement/Style";
import ColorBreakdown from "./color-breakdown.component";
import type { LocalColorRow } from "./color-breakdown-table.component";
import SizeBreakdown from "./size-breakdown.component";
import type StyleContext from "../../interfaces/OrderManagement/StyleContext";
import { useGetColorSizeSavedMatrix } from "../../tanstack-hooks/custom-hooks";
import type { ColorSizeDetailsServiceModel } from "../material-consumption/material-consumption.types";

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
  // FIXED: Explicitly append this signature parameter to satisfy the compilation checking engine!
  //initialColors: any[]; // Maps directly to your LocalColorRow[] data array structure
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

  // 2. Add the Matrix State Memory here at the master parent level
  const [matrixRows, setMatrixRows] = useState<MatrixRow[]>([
    { sizeCode: "S" },
    { sizeCode: "M" },
    { sizeCode: "L" },
    { sizeCode: "XL" },
  ]);

  const [prevStyleId, setPrevStyleId] = useState<string | null>(null);
  const currentStyleId = selectedStyleFromGrid
    ? `${selectedStyleFromGrid.typeCode}-${selectedStyleFromGrid.styleCode}`
    : null;

  if (currentStyleId !== prevStyleId) {
    setPrevStyleId(currentStyleId);
    setActiveStep(0);
    setConfiguredColors([]);

    // 3. Reset sizes back to blank base values ONLY when switching to an entirely different style
    setMatrixRows([
      { sizeCode: "S" },
      { sizeCode: "M" },
      { sizeCode: "L" },
      { sizeCode: "XL" },
    ]);
  }

  {
    /* new component to pass existing colorSizeDetails from DB */
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

  // const matrix1 = useMemo(() => {
  //   if (!savedMatrixData) return [];

  //   // 1. Sum up by color
  //   const colorTotalQty = savedMatrixData.reduce<Record<string, number>>(
  //     (acc, item) => {
  //       if (!acc[item.color]) acc[item.color] = 0;
  //       acc[item.color] += item.qty;
  //       return acc;
  //     },
  //     {},
  //   );

  //   // 2. Map directly to your LocalColorRow format and return it
  //   return Object.entries(colorTotalQty).map(([color, totalQty]) => ({
  //     colorCode: color,
  //     description: color,
  //     allocationWeight: totalQty,
  //   }));
  // }, [savedMatrixData]); // matrix auto-updates safely only when data changes

  {
    /* end of new component to pass existing colorSizeDetails from DB */
  }

  {
    /* Add this single hydration block inside ColorSizeBreakdown.tsx right after your matrix useMemo block */
  }

  /// ----------------------------------------------------------------------------------
  // 🏛️ REBUILT COMPUTATION MODULES: REMOVED MANUALuseMemo BLOCKS FOR REACT 19 COMPILER
  // ----------------------------------------------------------------------------------

  // Extract a safe, non-undefined data tracking reference baseline array
  const activeDataArray = savedMatrixData || [];

  // 1. Evaluate if pre-existing style records exist inside SQL Server
  const hasExistingDbEntries = activeDataArray.length > 0;

  // 2. Compute your Stage 1 column allocations dynamically on the fly

  let matrix: LocalColorRow[] = [];
  if (hasExistingDbEntries) {
    const colorTotalQty: Record<string, number> = {};
    activeDataArray.forEach((item: ColorSizeDetailsServiceModel) => {
      if (item?.color) {
        const colorKey = String(item.color).toUpperCase().trim();
        colorTotalQty[colorKey] = (colorTotalQty[colorKey] || 0) + (item.qty || 0);
      }
    });

    matrix = Object.keys(colorTotalQty).map((colorName, idx) => ({
      id: idx + 1,
      colorCode: colorName,
      description: `Allocated Production Block ${colorName}`,
      allocationWeight: colorTotalQty[colorName],
    }));
  }

  // 2. FIXED HYDRATION ROUTINE: Push database records into state once on load
  // This allows "Add Product Size Row" to append fresh items to state without being blocked!
  const [prevHydrationKey, setPrevHydrationKey] = useState<string | null>(null);
  const currentHydrationKey = hasExistingDbEntries
    ? `${selectedStyleFromGrid?.styleCode}-${activeDataArray.length}`
    : "NEW";

  if (currentHydrationKey !== prevHydrationKey) {
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

        matchingDbRowsForSize.forEach((item: ColorSizeDetailsServiceModel) => {
          if (item?.color) {
            rowObject[item.color] = item.qty || 0;
          }
        });
        return rowObject;
      });

      setMatrixRows(initialRows); // Hydrate your active state container cleanly!
    }
  }

  // --- AUTOMATED INTERACTION FOR MODE CONTROLS ---
  const currentWorkingStep = hasExistingDbEntries ? 1 : activeStep;
  const currentWorkingColors = hasExistingDbEntries ? matrix : configuredColors;
  // FIXED: The grid now reads exclusively from your modifiable state memory loop!
  const currentWorkingRows = matrixRows;
  // let matrix: LocalColorRow[] = [];
  // if (hasExistingDbEntries) {
  //   const colorTotalQty: Record<string, number> = {};

  //   activeDataArray.forEach((item: ColorSizeDetailsServiceModel) => {
  //     if (item?.color) {
  //       const colorKey = String(item.color).toUpperCase().trim();
  //       colorTotalQty[colorKey] =
  //         (colorTotalQty[colorKey] || 0) + (item.qty || item.qty || 0);
  //     }
  //   });

  //   matrix = Object.keys(colorTotalQty).map((colorName, idx) => ({
  //     id: idx + 1,
  //     colorCode: colorName,
  //     description: `Allocated Production Block ${colorName}`,
  //     allocationWeight: colorTotalQty[colorName],
  //   }));
  // }

  // // 3. Compute your Stage 2 grid cell sizing rows dynamically on the fly
  // let hydratedMatrixRows: MatrixRow[] = matrixRows; // Default to your normal blank input state variables array
  // if (hasExistingDbEntries) {
  //   const uniqueSizesInDb = Array.from(
  //     new Set(
  //       activeDataArray.map((item: ColorSizeDetailsServiceModel) =>
  //         String(item?.size || "")
  //           .trim()
  //           .toUpperCase(),
  //       ),
  //     ),
  //   );
  //   const targetSizes =
  //     uniqueSizesInDb.length > 0 ? uniqueSizesInDb : ["S", "M", "L", "XL"];

  //   hydratedMatrixRows = targetSizes.map((sizeName) => {
  //     const rowObject: MatrixRow = { sizeCode: sizeName };
  //     const matchingDbRowsForSize = activeDataArray.filter(
  //       (item: any) =>
  //         String(item?.size || "")
  //           .trim()
  //           .toUpperCase() === sizeName,
  //     );

  //     matchingDbRowsForSize.forEach((item: any) => {
  //       if (item?.color) {
  //         rowObject[item.color] = item.qty || item.quantity || 0;
  //       }
  //     });

  //     return rowObject;
  //   });
  // }

  // --- AUTOMATED RUNTIME CONTEXT ASSIGNMENTS ---
  // const currentWorkingStep = hasExistingDbEntries ? 1 : activeStep;
  // const currentWorkingColors = hasExistingDbEntries ? matrix : configuredColors;
  // const currentWorkingRows = hasExistingDbEntries
  //   ? hydratedMatrixRows
  //   : matrixRows;

  // Verify if the database actually contains active rows for this style context
  // 1. SAFE TRUTH ENGINE EVALUATION (Added a strict fallback array check to handle 'undefined')
  // const hasExistingDbEntries = useMemo<boolean>(() => {
  //   const recordsArray = savedMatrixData || [];
  //   return recordsArray.length > 0;
  // }, [savedMatrixData]);

  // // 2. FIXED STAGE 1 MEMO: Clean variable extraction satisfies the React 19 Compiler!
  // const matrix = useMemo<LocalColorRow[]>(() => {
  //   // Structural type guard: check database state cleanly
  //   const activeData = savedMatrixData || [];

  //   if (activeData.length === 0) {
  //     const emptyFallback: LocalColorRow[] = [];
  //     return emptyFallback; // Early exit using a typed instance clears the compiler optimization bug!
  //   }

  //   const colorTotalQty = activeData.reduce<Record<string, number>>(
  //     (acc, item) => {
  //       if (!item?.color) return acc;
  //       if (!acc[item.color]) acc[item.color] = 0;
  //       acc[item.color] += item.qty || item.quantity || 0;
  //       return acc;
  //     },
  //     {},
  //   );

  //   return Object.keys(colorTotalQty).map((color, idx) => ({
  //     id: idx + 1,
  //     colorCode: color,
  //     description: `Allocated Production Block ${color}`,
  //     allocationWeight: colorTotalQty[color],
  //   }));
  // }, [savedMatrixData]);

  // // 3. FIXED STAGE 2 MEMO: Fully aligned type definitions with zero undefined risks
  // const hydratedMatrixRows = useMemo<MatrixRow[]>(() => {
  //   const activeData = savedMatrixData || [];

  //   if (activeData.length === 0) {
  //     return matrixRows; // If a fresh style context is loaded, seamlessly drop into standard blank rows
  //   }

  //   const uniqueSizesInDb = Array.from(
  //     new Set(
  //       activeData.map((item: any) =>
  //         String(item?.size || "")
  //           .trim()
  //           .toUpperCase(),
  //       ),
  //     ),
  //   );
  //   const targetSizes =
  //     uniqueSizesInDb.length > 0 ? uniqueSizesInDb : ["S", "M", "L", "XL"];

  //   return targetSizes.map((sizeName) => {
  //     const rowObject: MatrixRow = { sizeCode: sizeName };
  //     const matchingDbRowsForSize = activeData.filter(
  //       (item: any) =>
  //         String(item?.size || "")
  //           .trim()
  //           .toUpperCase() === sizeName,
  //     );

  //     matchingDbRowsForSize.forEach((item: any) => {
  //       if (item?.color) {
  //         rowObject[item.color] = item.qty || item.quantity || 0;
  //       }
  //     });

  //     return rowObject;
  //   });
  // }, [savedMatrixData, matrixRows]);

  // // --- AUTOMATED INTERACTION FOR MODE CONTROLS ---
  // // If database rows exist, override the step to show the matrix directly, otherwise let state handle it
  // const currentWorkingStep = hasExistingDbEntries ? 1 : activeStep;
  // const currentWorkingColors = hasExistingDbEntries ? matrix : configuredColors;
  // const currentWorkingRows = hasExistingDbEntries
  //   ? hydratedMatrixRows
  //   : matrixRows;

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

  const styleContextSanitized: StyleContext = {
    buyerCode: buyerCode,
    order: order,
    typeCode: selectedStyleFromGrid.typeCode,
    styleCode: selectedStyleFromGrid.styleCode,
    quantity: Number(selectedStyleFromGrid.quantity) || 0,
    colorRatio: selectedStyleFromGrid.colorRatio?.trim().toUpperCase() || "Q",
    sizeRatio: selectedStyleFromGrid.sizeRatio?.trim().toUpperCase() || "Q",
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

  // ----------------------------------------------------------------------------------
  // 2. LOCATE YOUR JSX TEMPLATE RETURN BLOCK AND REPLACE YOUR CONDITIONALS EXACTLY LIKE THIS:
  // ----------------------------------------------------------------------------------
  return (
    <Box sx={{ width: "100%", mt: 1 }}>
      <Paper elevation={2} sx={{ p: 2, mb: 3, backgroundColor: "#fafafa" }}>
        <Stepper activeStep={currentWorkingStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Keep your Active Working Target Green Banner Info Box completely the same... */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 3,
          backgroundColor: "#f0f4c3",
          borderColor: "#c0ca33",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "bold", color: "#2e7d32" }}
          >
            Active Working Target: Style Code [{" "}
            {styleContextSanitized.styleCode} ]
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Buyer: {buyerCode} | Order Ref: {order} | Bulk Target Size:{" "}
            {styleContextSanitized.quantity.toLocaleString()}{" "}
            {selectedStyleFromGrid.unit || "Pcs"}
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right" }}>
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
            sx={{ fontWeight: "bold", display: "block" }}
          >
            SIZE MATRIX MODE:{" "}
            {styleContextSanitized.sizeRatio === "R"
              ? "Ratio Splitting [R]"
              : "Explicit Pieces [Q]"}
          </Typography>
        </Box>
      </Paper>

      {/* PATHWAY 1: NORMAL STEPPED ROUTE (Fires only if it is a brand-new style with no data) */}
      {!hasExistingDbEntries && currentWorkingStep === 0 && (
        <ColorBreakdown
          styleCode={styleContextSanitized.styleCode}
          bulkQuantity={styleContextSanitized.quantity}
          initialColors={currentWorkingColors}
          onNextStep={handleColorConfigurationComplete}
        />
      )}

      {!hasExistingDbEntries && currentWorkingStep === 1 && (
        <SizeBreakdown
          styleContext={styleContextSanitized}
          selectedColors={currentWorkingColors}
          onBackToColors={handleReturnToColors}
          onSaveComplete={handleWorkflowComplete}
          setIsDirty={setIsMatrixDirty}
          matrixRows={currentWorkingRows}
          setMatrixRows={setMatrixRows}
        />
      )}

      {/* PATHWAY 2: DYNAMIC PRE-POPULATION ROUTE (Fires only if pre-existing entries exist in SQL Server) */}
      {hasExistingDbEntries && (
        <SizeBreakdown
          styleContext={styleContextSanitized}
          selectedColors={currentWorkingColors}
          onBackToColors={handleReturnToColors}
          onSaveComplete={handleWorkflowComplete}
          setIsDirty={setIsMatrixDirty}
          matrixRows={currentWorkingRows}
          setMatrixRows={setMatrixRows}
        />
      )}
    </Box>
  );
}

//   return (
//     <Box sx={{ width: "100%", mt: 1 }}>
//       <Paper elevation={2} sx={{ p: 2, mb: 3, backgroundColor: "#fafafa" }}>
//         <Stepper activeStep={activeStep} alternativeLabel>
//           {steps.map((label) => (
//             <Step key={label}>
//               <StepLabel>{label}</StepLabel>
//             </Step>
//           ))}
//         </Stepper>
//       </Paper>

//       <Paper
//         variant="outlined"
//         sx={{
//           p: 2,
//           mb: 3,
//           backgroundColor: "#f0f4c3",
//           borderColor: "#c0ca33",
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//         }}
//       >
//         <Box>
//           <Typography
//             variant="subtitle1"
//             sx={{ fontWeight: "bold", color: "#2e7d32" }}
//           >
//             Active Working Target: Style Code [{" "}
//             {styleContextSanitized.styleCode} ]
//           </Typography>
//           <Typography variant="body2" color="text.secondary">
//             Buyer: {buyerCode} | Order Ref: {order} | Bulk Target Size:{" "}
//             {styleContextSanitized.quantity.toLocaleString()}{" "}
//             {selectedStyleFromGrid.unit || "Pcs"}
//           </Typography>
//         </Box>
//         <Box sx={{ textAlign: "right" }}>
//           <Typography
//             variant="caption"
//             sx={{ fontWeight: "bold", display: "block" }}
//           >
//             COLOUR MODE:{" "}
//             {styleContextSanitized.colorRatio === "R"
//               ? "Ratio Splitting [R]"
//               : "Explicit Pieces [Q]"}
//           </Typography>
//           <Typography
//             variant="caption"
//             sx={{ fontWeight: "bold", display: "block" }}
//           >
//             SIZE MATRIX MODE:{" "}
//             {styleContextSanitized.sizeRatio === "R"
//               ? "Ratio Splitting [R]"
//               : "Explicit Pieces [Q]"}
//           </Typography>
//         </Box>
//       </Paper>

//       {activeStep === 0 && !savedMatrixData && (
//         <ColorBreakdown
//           styleCode={styleContextSanitized.styleCode}
//           bulkQuantity={styleContextSanitized.quantity}
//           initialColors={configuredColors}
//           onNextStep={handleColorConfigurationComplete}
//         />
//       )}

//       {activeStep === 1 && !savedMatrixData && (
//         <SizeBreakdown
//           styleContext={styleContextSanitized}
//           selectedColors={configuredColors}
//           onBackToColors={handleReturnToColors}
//           onSaveComplete={handleWorkflowComplete}
//           setIsDirty={setIsMatrixDirty}
//           // 4. Pass matrix row properties down to Step 2
//           matrixRows={matrixRows}
//           setMatrixRows={setMatrixRows}
//         />
//       )}

//       {/* new component to pass existing colorSizeDetails from DB */}
//       {savedMatrixData && matrix && (
//         <SizeBreakdown
//           styleContext={styleContextSanitized}
//           selectedColors={matrix}
//           onBackToColors={handleReturnToColors}
//           onSaveComplete={handleWorkflowComplete}
//           setIsDirty={setIsMatrixDirty}
//           // 4. Pass matrix row properties down to Step 2
//           matrixRows={matrixRows}
//           setMatrixRows={setMatrixRows}
//         />
//       )}
//     </Box>
//   );
// }
