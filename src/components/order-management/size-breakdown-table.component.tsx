import React, { useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import InfoDialog from "../common/info-dialog";
import ConfirmDialog from "../common/confirm-dialog";

import type { LocalColorRow } from "./color-breakdown-table.component";
import type { MatrixRow } from "./color-size-breakdown.component";
// import type { StyleContext } from "../material-consumption/material-consumption.types";

interface TableProps {
  matrixRows: MatrixRow[];
  setMatrixRows: React.Dispatch<React.SetStateAction<MatrixRow[]>>;
  selectedColors: LocalColorRow[];
  columnTotals: Record<string, number>;
  setIsDirty: (dirty: boolean) => void;
  unit: string;
}

// 1. ISOLATED DE-COUPLED CELL COMPONENT - Fully Typed for MUI v6
const MatrixNumericCell = ({
  initialValue,
  colorCode,
  sizeCode,
  setMatrixRows,
  setIsDirty,
}: {
  initialValue: number;
  colorCode: string;
  sizeCode: string;
  setMatrixRows: React.Dispatch<React.SetStateAction<MatrixRow[]>>;
  setIsDirty: (dirty: boolean) => void;
}) => {
  const [localVal, setLocalVal] = useState<string>(String(initialValue || ""));

  // Track the last raw value seen during render execution
  const [prevInitialVal, setPrevInitialVal] = useState<number>(initialValue);

  // IN-MEMORY RESET GUARD: Replaces useEffect to avoid cascading render errors completely
  if (initialValue !== prevInitialVal) {
    setPrevInitialVal(initialValue);
    setLocalVal(String(initialValue || ""));
  }

  const commitChanges = () => {
    const finalNum = Math.max(0, Number(localVal) || 0);

    // Save to the master table state ONLY when the user finishes editing and leaves the cell
    setMatrixRows((prev) =>
      prev.map((r) =>
        r.sizeCode === sizeCode ? { ...r, [colorCode]: finalNum } : r,
      ),
    );
  };

  return (
    <TextField
      variant="standard"
      value={localVal}
      // 100% compliant with MUI v6 slotProps specifications for the native HTML element
      slotProps={{
        htmlInput: {
          inputMode: "numeric",
          pattern: "[0-9]*",
          style: { textAlign: "right", fontFamily: "monospace" },
        },
      }}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        // Strictly accept numerical digits only - blocks text letters, exponents, or math symbols
        const cleanDigitsOnly = rawValue.replace(/[^0-9]/g, "");
        setLocalVal(cleanDigitsOnly);
        setIsDirty(true);
      }}
      onBlur={commitChanges}
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          commitChanges();
          (e.target as HTMLInputElement).blur(); // Safely remove focus
        }
      }}
      fullWidth
    />
  );
};

export default function SizeBreakdownTable({
  matrixRows,
  setMatrixRows,
  selectedColors,
  columnTotals,
  setIsDirty,
  unit,
}: TableProps) {
  // FIXED (2026-08-07): replaces window.alert() with the shared InfoDialog -
  // per project convention, no native browser alert/confirm popups.
  const [duplicateSizeMessage, setDuplicateSizeMessage] = useState<
    string | null
  >(null);

  // FIXED (2026-08-07): replaces window.prompt() with the shared ConfirmDialog -
  // per project convention, no native browser prompt popups.
  const [isAddSizeDialogOpen, setIsAddSizeDialogOpen] = useState(false);
  const [newSizeLabelInput, setNewSizeLabelInput] = useState("");

  const handleConfirmAddSize = () => {
    const cleanLabel = newSizeLabelInput.toUpperCase().trim();
    setIsAddSizeDialogOpen(false);
    if (!cleanLabel) return;

    if (matrixRows.some((r) => r.sizeCode === cleanLabel)) {
      setDuplicateSizeMessage(
        "This size label notation already exists inside the active workspace.",
      );
      return;
    }

    const blankRow: MatrixRow = { sizeCode: cleanLabel };
    selectedColors.forEach((c) => {
      blankRow[c.colorCode] = 0;
    });
    setMatrixRows((prev) => [...prev, blankRow]);
  };

  const handleCancelAddSize = () => {
    setIsAddSizeDialogOpen(false);
  };

  // 2. Map structural grid blueprints
  const columns = useMemo<MRT_ColumnDef<MatrixRow>[]>(() => {
    const generatedColumns: MRT_ColumnDef<MatrixRow>[] = [
      {
        accessorKey: "sizeCode",
        header: "SIZE DIMENSION",
        enableEditing: false,
        muiTableBodyCellProps: {
          sx: { fontWeight: "bold", backgroundColor: "#f5f5f5" },
        },
      },
    ];

    selectedColors.forEach((col) => {
      generatedColumns.push({
        accessorKey: col.colorCode,
        header: `${col.colorCode} : [${Number(col.allocationWeight)} ${unit}] `,
        enableEditing: false, // Override internal MRT handlers to use our custom text field inputs instead

        Cell: ({ row }) => {
          const currentCellNum = Number(row.original[col.colorCode]) || 0;
          return (
            <MatrixNumericCell
              initialValue={currentCellNum}
              colorCode={col.colorCode}
              sizeCode={row.original.sizeCode}
              setMatrixRows={setMatrixRows}
              setIsDirty={setIsDirty}
            />
          );
        },
      });
    });

    return generatedColumns;
  }, [selectedColors, setMatrixRows, setIsDirty, unit]);

  const table = useMaterialReactTable({
    columns,
    data: matrixRows,
    enableEditing: false,
    enablePagination: false,
    enableBottomToolbar: false,
    getRowId: (row) => row.sizeCode,

    renderTopToolbarCustomActions: () => (
      <Box sx={{ p: 1 }}>
        <Button
          variant="contained"
          color="info"
          startIcon={<AddIcon />}
          onClick={() => {
            setNewSizeLabelInput("");
            setIsAddSizeDialogOpen(true);
          }}
        >
          Add Product Size Row
        </Button>
      </Box>
    ),
  });

  return (
    <Box>
      <MaterialReactTable table={table} />

      {/* Real-Time Running Totals Footer Grid Panel */}
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ mt: 1, backgroundColor: "#eceff1" }}
      >
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell
                sx={{ fontWeight: "bold", width: "180px", color: "#37474f" }}
              >
                RUNNING COL TOTALS:
              </TableCell>
              {selectedColors.map((col) => (
                <TableCell
                  key={col.colorCode}
                  sx={{
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    color: "#263238",
                  }}
                >
                  {col.colorCode}: {columnTotals[col.colorCode]}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <InfoDialog
        open={!!duplicateSizeMessage}
        title="Duplicate Size Label"
        message={duplicateSizeMessage}
        severity="warning"
        onClose={() => setDuplicateSizeMessage(null)}
      />

      <ConfirmDialog
        open={isAddSizeDialogOpen}
        title="Add Product Size Row"
        message={
          <TextField
            autoFocus
            fullWidth
            label="Size Label"
            placeholder="e.g. 32, 34, L, XL"
            value={newSizeLabelInput}
            onChange={(e) =>
              setNewSizeLabelInput(e.target.value.toUpperCase())
            }
            slotProps={{
              htmlInput: {
                maxLength: 10,
                style: { textTransform: "uppercase" },
              },
            }}
            sx={{
              mt: 1,
              // FIXED (2026-08-07): same dark-on-dark input contrast issue
              // as the Add Colour dialog - see the matching comment there.
              "& .MuiOutlinedInput-root": { backgroundColor: "#FFFFFF" },
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleConfirmAddSize();
              }
            }}
          />
        }
        confirmLabel="Add"
        confirmColor="primary"
        onConfirm={handleConfirmAddSize}
        onCancel={handleCancelAddSize}
      />
    </Box>
  );
}
