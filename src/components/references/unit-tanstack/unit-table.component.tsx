// Inside UnitTable.tsx component body:

import { useState } from "react";
import type { Unit } from "../../../interfaces/references/Unit";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_Row,
  type MRT_TableOptions,
} from "material-react-table";
import { Box, Button, darken, IconButton, Tooltip } from "@mui/material";
import type { PaginationData } from "../../../interfaces/definitions";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import {
  useCreateUnitMutation,
  useDeleteUnitMutation,
  useUpdateUnitMutation,
} from "../../../tanstack-hooks/custom-hooks";
import { useApparelProTable } from "../../../themes/useApparelProTable";
import ConfirmDialog from "../../common/confirm-dialog";

interface Props {
  columns: MRT_ColumnDef<Unit>[];
  data: Unit[];
  itemsCount: number;
  isError: boolean;
  isLoading: boolean;
  paginate: PaginationData;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
}

const UnitTable = ({
  columns,
  data,
  itemsCount,
  isError,
  isLoading,
  //    paginate,
  pagination,
  setPagination,
}: Props) => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const [rowToDelete, setRowToDelete] = useState<MRT_Row<Unit> | null>(null);

  const validationRequired = (value: string) => !value?.length;
  const validateUnit = ({ description, code }: Unit) => {
    return {
      name: validationRequired(description) ? "Unit description required" : "",
      code: validationRequired(code) ? "Unit Code required" : "",
    };
  };

  // 1. Consume mutations cleanly
  const { mutateAsync: createUnit, isPending: isCreatingUnit } =
    useCreateUnitMutation();
  const { mutateAsync: updateUnit, isPending: isUpdatingUnit } =
    useUpdateUnitMutation();
  const { mutateAsync: deleteUnit, isPending: isDeletingUnit } =
    useDeleteUnitMutation();

  // 2. Your save hooks remain highly intuitive
  const handleCreateUnit: MRT_TableOptions<Unit>["onCreatingRowSave"] = async ({
    values,
    table,
  }) => {
    console.log("save");
    values = { ...values, id: 0 };
    const newValidationErrors = validateUnit(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      console.log("validation err: ", newValidationErrors);
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});

    // Fires mutationFn, runs network call, invalidates cache automatically on success!
    await createUnit(values);
    table.setCreatingRow(null);
  };

  const handleSaveUnit: MRT_TableOptions<Unit>["onEditingRowSave"] = async ({
    values,
    table,
  }) => {
    values = { ...values, description: values.description.toUpperCase() };
    console.log("Val: ", values);
    console.log("Val: ", values.description);
    const newValidationErrors = validateUnit(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});

    // Fires mutationFn, runs network call, invalidates cache automatically on success!
    await updateUnit(values);
    table.setEditingRow(null); //exit editing mode
  };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<Unit>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    await deleteUnit(rowToDelete.original.code);
    setRowToDelete(null);
  };

  const handleCancelDelete = () => {
    setRowToDelete(null);
  };

  //  CRUD Operations

  const table = useApparelProTable<Unit>({
    columns,
    data: data,

    // 🚀 THE CRITICAL FIX: Explicitly bind your initial pagination keys here!
    initialState: {
      density: "compact",
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    },

    // Display mode configuration
    createDisplayMode: "row",
    editDisplayMode: "row",

    enableExpandAll: false,

    // pagination
    // Pagination configuration
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

    enableEditing: true,

    // 🚀 CHANGE THIS: Map directly to the incoming prop variables
    state: {
      pagination: pagination, // Uses the prop passed from Currencies.tsx
      showAlertBanner: isError,
    },

    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateUnit,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveUnit,

    muiExpandButtonProps: ({ row, table }) => ({
      onClick: () => table.setExpanded({ [row.id]: !row.getIsExpanded() }),
    }),

    // muiTopToolbarProps: {
    //   sx: () => ({
    //     backgroundColor: "rgb(96 165 250)",
    //     boxShadow: "0px 0px 20px rgba(0,0,0,.5)",
    //   }),
    // },

    // Cell styling
    // muiTableHeadCellProps: {
    //   sx: {
    //     fontSize: "0.8rem",
    //     fontWeight: "600",
    //     backgroundColor: "#fff",
    //     // color: "#42a5f5",
    //     color: "#000",
    //     boxShadow: "0 -5px 3px -3px black, 0 5px 3px -3px ",
    //   },
    // },

    // // table body
    // muiTableBodyProps: {
    //   sx: {
    //     fontSize: "0.5rem",
    //   },
    // },

    // muiTableBodyRowProps: ({ row, table }) => ({
    //   hover: !table.getState().editingRow,
    //   sx: {
    //     opacity:
    //       !table.getState().editingRow ||
    //       table.getState().editingRow?.id === row.id ||
    //       table.getState().creatingRow
    //         ? 1
    //         : 0.4,
    //     backgroundColor:
    //       Number(row?.id) % 2 === 0 ||
    //       table.getState().editingRow?.id === row.id
    //         ? darken("#4B9CD3", 0)
    //         : darken("#7CB9E8", 0),
    //     "&:hover td": {
    //       borderTop: "1px solid #fff",
    //       borderBottom: "1px solid #fff",
    //       color: "#4B9CD3",
    //       backgroundColor:
    //         table.getState().editingRow?.id === row.id ||
    //         table.getState().creatingRow
    //           ? "#fff"
    //           : "#000",
    //     },
    //   },
    // }),

    // muiTableFooterRowProps: {
    //   sx: () => ({
    //     backgroundColor: "rgb(96 165 250)",
    //     boxShadow: "0px 0px 20px rgba(0,0,0,.5)",
    //     boder: "5px solid red",
    //   }),
    // },

    muiTableBodyRowProps: ({ row, table }) => ({
      hover: !table.getState().editingRow,
      sx: {
        "& .MuiInputBase-input": {
          color: "#000000", // Forces input text color to black
          WebkitTextFillColor: "#000000", // Ensures compatibility with Safari
        },
      },
    }),

    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true);
        }}
      >
        New Unit
      </Button>
    ),

    renderRowActions: ({ row }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <ModeEditOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
            <DeleteForeverOutlinedIcon className="flex w-full justify-start h-5 w1-5 border1-4 border1-yellow-300" />
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
        title="Delete Unit"
        message={`Are you sure you want to delete "${rowToDelete?.original.code}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeletingUnit}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default UnitTable;
