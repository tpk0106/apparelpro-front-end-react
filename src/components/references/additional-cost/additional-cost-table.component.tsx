import { useState } from "react";

import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_Row,
  type MRT_TableOptions,
} from "material-react-table";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import type { PaginationData } from "../../../interfaces/definitions";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import {
  useCreateAdditionalCostMutation,
  useDeleteAdditionalCostMutation,
  useUpdateAdditionalCostMutation,
} from "../../../tanstack-hooks/custom-hooks";
import type { AdditionalCost } from "../../../interfaces/references/AdditionalCost";
import ConfirmDialog from "../../common/confirm-dialog";

// SCOPED LOOK-AND-FEEL EXPERIMENT (2026-08-08) - see additional-cost.component.tsx's header
// comment for the full rationale. This table deliberately calls useMaterialReactTable()
// directly instead of the shared useApparelProTable() hook, because that hook hard-codes the
// app-wide sky-blue toolbar + alternating blue/black rows (see
// src/themes/useApparelProTable.ts) and clobbers any per-instance row sx passed to it - there
// is no way to opt only this screen out of that look through the hook's public options. Going
// straight to useMaterialReactTable() keeps this experiment 100% contained to this file; every
// other screen still using useApparelProTable() is completely unaffected. To revert, swap this
// back to useApparelProTable() and drop the sx overrides below.
const mockupColors = {
  surface: "#141922",
  input: "#0D1117",
  border: "#232a36",
  text: "#F4F6F8",
  muted: "#8B93A1",
  accent: "#60a5fa",
  danger: "#f87171",
};

interface Props {
  columns: MRT_ColumnDef<AdditionalCost>[];
  data: AdditionalCost[];
  itemsCount: number;
  isError: boolean;
  isLoading: boolean;
  paginate: PaginationData;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
}

const AdditionalCostTable = ({
  columns,
  data,
  itemsCount,
  isError,
  pagination,
  setPagination,
}: Props) => {
  const [, setValidationErrors] = useState<Record<string, string | undefined>>(
    {},
  );

  const validationRequired = (value: string) => !value?.length;
  const validateAdditionalCost = ({ code, description }: AdditionalCost) => {
    return {
      code: validationRequired(code) ? "Code required" : "",
      description: validationRequired(description) ? "Description required" : "",
    };
  };

  const { mutateAsync: createAdditionalCost } = useCreateAdditionalCostMutation();
  const { mutateAsync: updateAdditionalCost } = useUpdateAdditionalCostMutation();
  const { mutateAsync: deleteAdditionalCost, isPending: isDeleting } =
    useDeleteAdditionalCostMutation();
  const [rowToDelete, setRowToDelete] = useState<MRT_Row<AdditionalCost> | null>(
    null,
  );

  const handleCreateAdditionalCost: MRT_TableOptions<AdditionalCost>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateAdditionalCost(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      await createAdditionalCost(values);
      table.setCreatingRow(null);
    };

  const handleSaveAdditionalCost: MRT_TableOptions<AdditionalCost>["onEditingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateAdditionalCost(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      await updateAdditionalCost(values);
      table.setEditingRow(null);
    };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<AdditionalCost>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    await deleteAdditionalCost({ code: rowToDelete.original.code });
    setRowToDelete(null);
  };

  const handleCancelDelete = () => {
    setRowToDelete(null);
  };

  const table = useMaterialReactTable<AdditionalCost>({
    columns,
    data: data,

    initialState: {
      density: "compact",
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    },

    createDisplayMode: "row",
    editDisplayMode: "row",

    enableExpandAll: false,
    enableEditing: true,

    rowCount: itemsCount,
    manualPagination: true,
    paginationDisplayMode: "pages",
    muiPaginationProps: {
      color: "secondary",
      rowsPerPageOptions: [5, 10, 20],
      shape: "rounded",
      variant: "outlined",
    },
    onPaginationChange: setPagination,

    state: {
      pagination: pagination,
      showAlertBanner: isError,
    },

    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateAdditionalCost,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveAdditionalCost,

    // Flat dark-card surface (no default MRT paper shadow/border) - matches the
    // mockup's .grid-panel, which is already provided by the parent component's
    // wrapping Box, so this table renders transparent inside it.
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        backgroundColor: "transparent !important",
        backgroundImage: "none !important",
      },
    },

    // Plain dark toolbar instead of the shared hook's sky-blue band.
    muiTopToolbarProps: {
      sx: {
        backgroundColor: "transparent !important",
        boxShadow: "none !important",
        "& .MuiIconButton-root, & .MuiSvgIcon-root": {
          color: `${mockupColors.muted} !important`,
        },
      },
    },

    muiBottomToolbarProps: {
      sx: {
        backgroundColor: "transparent !important",
        boxShadow: "none !important",
        color: `${mockupColors.muted} !important`,
      },
    },

    muiTableContainerProps: {
      sx: { backgroundColor: "transparent !important" },
    },

    muiTableHeadCellProps: {
      sx: {
        backgroundColor: "transparent !important",
        color: `${mockupColors.muted} !important`,
        borderBottom: `1px solid ${mockupColors.border} !important`,
        fontWeight: 600,
        fontSize: "12px",
      },
    },

    // Flat rows, no alternating blue/white banding - just a subtle hover, matching
    // the mockup's tr:hover rule.
    muiTableBodyRowProps: ({ table }) => {
      const anyRowEditing = !!table.getState().editingRow;
      return {
        hover: !anyRowEditing,
        sx: {
          backgroundColor: "transparent !important",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.02) !important",
          },
          "& td": {
            color: `${mockupColors.text} !important`,
            borderBottom: `1px solid ${mockupColors.border} !important`,
            fontSize: "12.5px",
          },
        },
      };
    },

    // Inline-edit text fields keep the dark input look instead of the shared
    // hook's white-background edit row. muiTableBodyCellEditTextFieldProps
    // isn't a real MRT_TableOptions prop, so these overrides live on
    // muiTableBodyCellProps instead - the nested selectors still reach the
    // input when a cell is in edit mode.
    muiTableBodyCellProps: {
      sx: {
        backgroundColor: "transparent !important",
        "& .MuiInputBase-input": {
          color: `${mockupColors.text} !important`,
          backgroundColor: `${mockupColors.input} !important`,
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: `${mockupColors.border} !important`,
        },
      },
    },

    // editDisplayMode is "row" (not "modal"), so this prop has no visible
    // effect at runtime, but MRT's type still requires a full DialogProps
    // (including `open`) when set.
    muiEditRowDialogProps: {
      open: true,
      sx: { backgroundColor: mockupColors.surface },
    },

    renderTopToolbarCustomActions: () => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true);
        }}
        sx={{
          backgroundColor: `${mockupColors.accent} !important`,
          color: "#06101f !important",
          fontWeight: 700,
          borderRadius: "6px",
          textTransform: "none",
          boxShadow: "none !important",
        }}
      >
        New Additional Cost
      </Button>
    ),

    renderRowActions: ({ row }) => (
      <Box sx={{ display: "flex", gap: "0.5rem" }}>
        <Tooltip title="Edit">
          <IconButton
            onClick={() => table.setEditingRow(row)}
            sx={{
              width: 28,
              height: 28,
              borderRadius: "6px",
              border: `1px solid ${mockupColors.border}`,
              backgroundColor: `${mockupColors.input} !important`,
              color: `${mockupColors.muted} !important`,
            }}
          >
            <ModeEditOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            onClick={() => openDeleteConfirmModal(row)}
            sx={{
              width: 28,
              height: 28,
              borderRadius: "6px",
              border: `1px solid ${mockupColors.border}`,
              backgroundColor: `${mockupColors.input} !important`,
              color: `${mockupColors.danger} !important`,
            }}
          >
            <DeleteForeverOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  });

  return (
    <>
      <MaterialReactTable table={table} />
      <ConfirmDialog
        open={!!rowToDelete}
        title="Delete Additional Cost"
        message={`Are you sure you want to delete "${rowToDelete?.original.code} - ${rowToDelete?.original.description}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default AdditionalCostTable;
