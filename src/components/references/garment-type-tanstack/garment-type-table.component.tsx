import { useState } from "react";

import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_Row,
  type MRT_TableOptions,
} from "material-react-table";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import type { PaginationData } from "../../../interfaces/definitions";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import type { GarmentType } from "../../../interfaces/references/GarmentType";
import {
  useCreateGarmentTypeMutation,
  useDeleteGarmentTypeMutation,
  useUpdateGarmentTypeMutation,
} from "../../../tanstack-hooks/custom-hooks";
import { useApparelProTable } from "../../../themes/useApparelProTable";
import ConfirmDialog from "../../common/confirm-dialog";

interface Props {
  columns: MRT_ColumnDef<GarmentType>[];
  data: GarmentType[];
  itemsCount: number;
  isError: boolean;
  isLoading: boolean;
  paginate: PaginationData;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
}

const GarmentTypeTable = ({
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

  const [rowToDelete, setRowToDelete] = useState<MRT_Row<GarmentType> | null>(
    null,
  );
  const validationRequired = (value: string) => !value?.length;
  const validateGarmentType = ({ typeName }: GarmentType) => {
    console.log("validation :", validationRequired(typeName));
    return {
      typeName: validationRequired(typeName) ? "GarmentType Name required" : "",
    };
  };

  // 1. Consume mutations cleanly
  const { mutateAsync: createGarmentType } = useCreateGarmentTypeMutation();
  const { mutateAsync: updateGarmentType } = useUpdateGarmentTypeMutation();
  const { mutateAsync: deleteGarmentType, isPending: isDeletingGarmentType } =
    useDeleteGarmentTypeMutation();

  // 2. Your save hooks remain highly intuitive
  const handleCreateGarmentType: MRT_TableOptions<GarmentType>["onCreatingRowSave"] =
    async ({ values, table }) => {
      console.log("save");
      values = { ...values, id: 0 };
      const newValidationErrors = validateGarmentType(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        console.log("validation err: ", newValidationErrors);
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      // Fires mutationFn, runs network call, invalidates cache automatically on success!
      await createGarmentType(values);
      table.setCreatingRow(null);
    };

  const handleSaveGarmentType: MRT_TableOptions<GarmentType>["onEditingRowSave"] =
    async ({ values, row, table }) => {
      const newValidationErrors = validateGarmentType(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      // Fires mutationFn, runs network call, invalidates cache automatically on success!
      await updateGarmentType({ ...values, id: row.original.id });
      table.setEditingRow(null);
    };

  //DELETE action

  const openDeleteConfirmModal = (row: MRT_Row<GarmentType>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    await deleteGarmentType(rowToDelete.original.id);
    setRowToDelete(null);
  };

  const handleCancelDelete = () => {
    setRowToDelete(null);
  };

  //  CRUD Operations

  const table = useApparelProTable<GarmentType>({
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
    onCreatingRowSave: handleCreateGarmentType,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveGarmentType,

    muiExpandButtonProps: ({ row, table }) => ({
      onClick: () => table.setExpanded({ [row.id]: !row.getIsExpanded() }),
    }),

    muiTableBodyRowProps: ({ table }) => ({
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
        New GarmentType
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
        title="Delete Garment Type"
        message={`Are you sure you want to delete "${rowToDelete?.original.typeName}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeletingGarmentType}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default GarmentTypeTable;
