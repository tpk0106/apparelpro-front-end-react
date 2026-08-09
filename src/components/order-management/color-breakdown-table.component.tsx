import React, { useMemo, useState } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { Box, Button, IconButton, TextField, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import { useApparelProTable } from "../../themes/useApparelProTable";
import InfoDialog from "../common/info-dialog";
import ConfirmDialog from "../common/confirm-dialog";

export interface LocalColorRow {
  colorCode: string;
  description: string;
  allocationWeight: number; // Matches the numerical values for ratios or quantities
}

interface TableProps {
  colors: LocalColorRow[];
  setColors: React.Dispatch<React.SetStateAction<LocalColorRow[]>>;
  // Colour codes already saved against this style before this session
  // started (loaded from the DB matrix), as opposed to colours added
  // locally via "Add Product Colour" and not yet saved.
  existingColorCodes: Set<string>;
  // Styles with an approvedDate are locked - their already-saved colours
  // must stay intact, so the Delete action is hidden for them. A newly
  // added, not-yet-saved colour can still be removed even on an approved
  // style, since it was never part of the approved allocation.
  isStyleApproved: boolean;
}

const ColorBreakdownTable = ({
  colors,
  setColors,
  existingColorCodes,
  isStyleApproved,
}: TableProps) => {
  // FIXED (2026-08-07): replaces window.alert() with the shared InfoDialog -
  // per project convention, no native browser alert/confirm popups.
  const [duplicateCodeMessage, setDuplicateCodeMessage] = useState<
    string | null
  >(null);

  // FIXED (2026-08-07): replaces window.prompt() with the shared ConfirmDialog -
  // per project convention, no native browser prompt popups.
  const [isAddColorDialogOpen, setIsAddColorDialogOpen] = useState(false);
  const [newColorCodeInput, setNewColorCodeInput] = useState("");

  const handleConfirmAddColor = () => {
    const cleanCode = newColorCodeInput.toUpperCase().trim();
    setIsAddColorDialogOpen(false);
    if (!cleanCode) return;

    if (colors.some((c) => c.colorCode === cleanCode)) {
      setDuplicateCodeMessage(
        "This color identifier code already exists in your table.",
      );
      return;
    }

    setColors((prev) => [
      ...prev,
      { colorCode: cleanCode, description: "", allocationWeight: 0 },
    ]);
  };

  const handleCancelAddColor = () => {
    setIsAddColorDialogOpen(false);
  };

  // FIXED (2026-08-07): adds a Delete action for colour rows - reusing the
  // shared ConfirmDialog rather than window.confirm(), per project
  // convention. A colour already saved against an approved style cannot be
  // removed at all (its Delete button is simply not rendered - see
  // renderRowActions below); every other row (a newly added, not-yet-saved
  // colour, or any colour on a style that is not yet approved) can be
  // removed.
  const [deleteTarget, setDeleteTarget] = useState<LocalColorRow | null>(
    null,
  );

  const handleRequestDeleteColor = (row: LocalColorRow) => {
    setDeleteTarget(row);
  };

  const handleConfirmDeleteColor = () => {
    if (!deleteTarget) return;
    setColors((prev) =>
      prev.filter((c) => c.colorCode !== deleteTarget.colorCode),
    );
    setDeleteTarget(null);
  };

  const handleCancelDeleteColor = () => {
    setDeleteTarget(null);
  };

  const columns = useMemo<MRT_ColumnDef<LocalColorRow>[]>(
    () => [
      {
        accessorKey: "colorCode",
        header: "Colour Code (Max 6)",
        muiEditTextFieldProps: {
          required: true,
          inputProps: { maxLength: 6, style: { textTransform: "uppercase" } },
        },
      },
      {
        accessorKey: "description",
        header: "Colour Description / Shade Name",
        muiEditTextFieldProps: {
          inputProps: { maxLength: 30 },
        },
      },
      {
        accessorKey: "allocationWeight",
        header: "Allocation Weight (Ratio / Pieces)",
        type: "number",
        muiEditTextFieldProps: {
          type: "number",
          required: true,
        },
      },
    ],
    [],
  );

  const table = useApparelProTable<LocalColorRow>({
    columns,
    data: colors,
    editDisplayMode: "row", // Smooth, click-to-edit interface rows
    enableEditing: true,
    enablePagination: false, // Keeps full visibility on continuous matrix rows
    enableBottomToolbar: false,
    getRowId: (row) => row.colorCode,
    enableRowActions: true,

    onEditingRowSave: ({ values, exitEditingMode }) => {
      const sanitizedValues: LocalColorRow = {
        colorCode: values.colorCode.toUpperCase().trim(),
        description: values.description,
        allocationWeight: Math.max(0, Number(values.allocationWeight) || 0),
      };

      setColors((prev) =>
        prev.map((item) =>
          item.colorCode === sanitizedValues.colorCode ? sanitizedValues : item,
        ),
      );
      exitEditingMode();
    },

    renderRowActions: ({ row, table }) => {
      const isLockedExistingColor =
        existingColorCodes.has(row.original.colorCode) && isStyleApproved;

      return (
        <Box sx={{ display: "flex", gap: "1rem" }}>
          <Tooltip title="Edit">
            <IconButton onClick={() => table.setEditingRow(row)}>
              <ModeEditOutlinedIcon />
            </IconButton>
          </Tooltip>
          {!isLockedExistingColor && (
            <Tooltip title="Delete">
              <IconButton
                color="error"
                onClick={() => handleRequestDeleteColor(row.original)}
              >
                <DeleteForeverOutlinedIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      );
    },

    renderTopToolbarCustomActions: () => (
      <Box sx={{ p: 1 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {
            setNewColorCodeInput("");
            setIsAddColorDialogOpen(true);
          }}
        >
          Add Product Colour
        </Button>
      </Box>
    ),
  });

  return (
    <>
      <MaterialReactTable table={table} />

      <InfoDialog
        open={!!duplicateCodeMessage}
        title="Duplicate Colour Code"
        message={duplicateCodeMessage}
        severity="warning"
        onClose={() => setDuplicateCodeMessage(null)}
      />

      <ConfirmDialog
        open={isAddColorDialogOpen}
        title="Add Product Colour"
        message={
          <TextField
            autoFocus
            fullWidth
            label="Colour Identifier Code"
            placeholder="e.g. WHT, BLK, RED"
            value={newColorCodeInput}
            onChange={(e) =>
              setNewColorCodeInput(e.target.value.toUpperCase())
            }
            slotProps={{
              htmlInput: {
                maxLength: 6,
                style: { textTransform: "uppercase" },
              },
            }}
            sx={{
              mt: 1,
              // FIXED (2026-08-07): the shared ConfirmDialog uses a dark
              // paper background, but the app's global MuiTextField theme
              // sets input text to a near-black color (#141922) with no
              // background override - fine on the light Cards/Tables this
              // theme was designed for, but invisible on a dark dialog
              // (dark text on dark background). Giving the input field
              // itself a white background restores contrast without
              // touching the global theme.
              "& .MuiOutlinedInput-root": { backgroundColor: "#FFFFFF" },
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleConfirmAddColor();
              }
            }}
          />
        }
        confirmLabel="Add"
        confirmColor="primary"
        onConfirm={handleConfirmAddColor}
        onCancel={handleCancelAddColor}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove Colour"
        message={`Remove colour "${deleteTarget?.colorCode ?? ""}" from this style? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleConfirmDeleteColor}
        onCancel={handleCancelDeleteColor}
      />
    </>
  );
};

export default ColorBreakdownTable;
