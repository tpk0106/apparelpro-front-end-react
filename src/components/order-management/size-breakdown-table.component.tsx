import React, { useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { Box, Button, TextField } from "@mui/material";
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
  // Stage 1's mode - col.allocationWeight is a Ratio (not a Pcs count) when
  // true, so the column header must say "Ratio" instead of appending unit.
  isColorRatioMode: boolean;
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
      // Trims the standard-variant input's own default vertical padding,
      // which was taller than what the cell's py alone could compensate for.
      sx={{ "& .MuiInputBase-input": { py: "2px" } }}
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
  isColorRatioMode,
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
        size: 55,
        muiTableHeadCellProps: {
          sx: { width: 55 },
        },
        muiTableBodyCellProps: {
          sx: { fontWeight: "bold", backgroundColor: "#f5f5f5", width: 55, py: "2px" },
        },
        // FIXED: the running totals used to be a completely separate <Table>
        // rendered below the MRT table, with its own independent column
        // widths - since nothing kept those widths in sync with the real
        // table's (resizable, dynamically-sized) columns, the totals never
        // lined up under the right column. Using MRT's own column Footer
        // guarantees identical widths, since it's the same column model.
        //
        // No decorative border - kept plain per feedback. boxShadow/
        // backgroundColor here override MuiTableCell's GLOBAL "footer"
        // variant styleOverrides (see themes.ts) - that global rule paints
        // every MRT footer cell app-wide with a blue background plus a
        // heavy blurred box-shadow, which was blending this whole row
        // into one undifferentiated blob instead of separate columns.
        Footer: () => (
          <Box sx={{ fontWeight: "bold", color: "#fff" }}>
            RUNNING COL TOTALS:
          </Box>
        ),
        muiTableFooterCellProps: {
          sx: {
            py: "4px",
            width: 55,
            boxShadow: "none",
            backgroundColor: "#000",
          },
        },
      },
    ];

    selectedColors.forEach((col) => {
      generatedColumns.push({
        accessorKey: col.colorCode,
        header: `${col.colorCode} : [${Number(col.allocationWeight)} ${isColorRatioMode ? "Ratio" : unit}] `,
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
        // FIXED: the numeric input cells had no cell-level padding override
        // at all, so the TextField's own default (taller) padding was
        // stretching the whole row despite density: "compact" - the
        // sizeCode column next to it already had a tighter py, which is why
        // only this table's rows looked taller than ColorBreakdownTable's.
        muiTableBodyCellProps: { sx: { py: "2px" } },
        Footer: () => (
          <Box
            sx={{
              fontFamily: "monospace",
              fontWeight: "bold",
              color: "#fff",
              textAlign: "right",
            }}
          >
            {columnTotals[col.colorCode]}
          </Box>
        ),
        muiTableFooterCellProps: {
          sx: {
            py: "4px",
            boxShadow: "none",
            backgroundColor: "#000",
          },
        },
      });
    });

    return generatedColumns;
  }, [
    selectedColors,
    setMatrixRows,
    setIsDirty,
    unit,
    isColorRatioMode,
    columnTotals,
  ]);

  const table = useMaterialReactTable({
    columns,
    data: matrixRows,
    enableEditing: false,
    enablePagination: false,
    enableBottomToolbar: false,
    enableTableFooter: true,
    // FIXED: plain column size is only a hint under the default table
    // layout - the browser can still expand a column past it based on
    // content (the long "SIZE DIMENSION" header text). table-layout: fixed
    // makes the declared widths authoritative, without switching MRT's
    // whole rendering engine (layoutMode: "grid" was tried and rebuilt the
    // table as a flex/div layout instead of a real <table> - it broke row
    // backgrounds, borders, and text wrapping across the whole grid, not
    // just the one column it was meant to fix).
    muiTableProps: {
      sx: { tableLayout: "fixed" },
    },
    getRowId: (row) => row.sizeCode,

    // FIXED: matches ColorBreakdownTable's row hover exactly (that one gets
    // this via useApparelProTable's shared muiTableBodyRowProps - see the
    // "&:hover td" block there). Every cell here is a permanently-live
    // MatrixNumericCell TextField rather than MRT's toggled row-edit mode,
    // so there's no isEditing/isCreating distinction to make - the input
    // text just needs to stay white (readable) against the black hover
    // background at all times, same principle as the Colour table's
    // "not currently editing" branch.
    muiTableBodyRowProps: {
      hover: true,
      sx: {
        "&:hover td": {
          backgroundColor: "#000000 !important",
          // Covers the plain "SIZE DIMENSION" label cell (not a TextField),
          // which would otherwise stay its default dark text color and
          // become unreadable against the black hover background.
          color: "#FFFFFF !important",
          "& .MuiInputBase-input": {
            color: "#FFFFFF !important",
            caretColor: "#FFFFFF !important",
          },
          "& .MuiInput-underline:before, & .MuiInput-underline:after, & .MuiInputBase-root:before, & .MuiInputBase-root:after":
            {
              borderColor: "#FFFFFF !important",
            },
        },
      },
    },

    // FIXED: matches ColorBreakdownTable's toolbar exactly (that one gets
    // this via the shared useApparelProTable hook; this table uses the raw
    // hook directly, so it needs the same sx here) - standard table blue
    // (#60a5fa) with white icons, instead of the global theme's default
    // black icons on blue.
    muiTopToolbarProps: {
      sx: {
        backgroundColor: "#60a5fa !important",
        boxShadow: "0px 0px 20px rgba(0,0,0,.5) !important",
        "& .MuiIconButton-root, & .MuiSvgIcon-root": {
          color: "#ffffff !important",
        },
      },
    },

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

    // Removes the built-in MRT toolbar icon cluster (search, column filters,
    // show/hide columns, toggle density, toggle fullscreen) - the Add
    // button's own icon is unrelated and stays as it was.
    enableToolbarInternalActions: false,

    initialState: { density: "compact" },
  });

  return (
    <Box>
      <MaterialReactTable table={table} />

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
