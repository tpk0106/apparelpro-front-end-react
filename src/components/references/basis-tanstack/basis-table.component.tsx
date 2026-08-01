import { useState } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_Row,
  type MRT_TableOptions,
} from "material-react-table";
import ConfirmDialog from "../../common/confirm-dialog";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";

import {
  useCreateBasisMutation,
  useDeleteBasisMutation,
  useUpdateBasisMutation,
} from "../../../tanstack-hooks/custom-hooks";

import type { PaginationData } from "../../../interfaces/definitions";
import type { Basis } from "../../../interfaces/references/Basis";
import { useApparelProTable } from "../../../themes/useApparelProTable";

import type {
  DeleteBasisPayload,
  UpdateBasisPayload,
} from "../../../tanstack-hooks/interfaces";

interface Props {
  columns: MRT_ColumnDef<Basis>[];
  data: Basis[];
  itemsCount: number;
  isError: boolean;
  isLoading: boolean;
  paginate: PaginationData;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
}

const BasisTable = ({
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

  const [rowToDelete, setRowToDelete] = useState<MRT_Row<Basis> | null>(null);

  const validationRequired = (value: string) => !value?.length;
  const validateCurrency = ({ code, description }: Basis) => {
    return {
      name: validationRequired(description) ? "Description required" : "",
      code: validationRequired(code) ? "Basis Code required" : "",
    };
  };

  // 1. Consume mutations cleanly
  const { mutateAsync: createBasis } = useCreateBasisMutation();
  const { mutateAsync: updateEditBasis } = useUpdateBasisMutation();
  const { mutateAsync: deleteBasis, isPending: isDeletingBasis } =
    useDeleteBasisMutation();

  // 2. Your save hooks remain highly intuitive
  const handleCreateCurrency: MRT_TableOptions<Basis>["onCreatingRowSave"] =
    async ({ values, table }) => {
      // valueAdd starts out as "" until the user opens the select, so coerce
      // it to a real boolean here - never forward "" to the API
      // (CreateBasisAPIModel.ValueAdd is a non-nullable bool and rejects it,
      // which is what produced the "createBasisAPIModel field is required" error).
      values = { ...values, id: 0, valueAdd: values.valueAdd === true };
      const newValidationErrors = validateCurrency(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        console.log("validation err: ", newValidationErrors);
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      // Fires mutationFn, runs network call, invalidates cache automatically on success!
      await createBasis(values);
      table.setCreatingRow(null);
    };

  const handleSaveBasis: MRT_TableOptions<Basis>["onEditingRowSave"] = async ({
    values,
    table,
  }) => {
    values = { ...values, id: 0, valueAdd: values.valueAdd === true };
    const newValidationErrors = validateCurrency(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});

    // Fires mutationFn, runs network call, invalidates cache automatically on success!
    const updateBasisPayload: UpdateBasisPayload = {
      basisToUpdate: { ...values },
      code: values.code,
    };
    await updateEditBasis(updateBasisPayload);
    table.setEditingRow(null);
  };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<Basis>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    const deleteBasisPayload: DeleteBasisPayload = {
      code: rowToDelete.original.code,
    };
    await deleteBasis(deleteBasisPayload);
    setRowToDelete(null);
  };

  const handleCancelDelete = () => {
    setRowToDelete(null);
  };

  //  CRUD Operations

  const table = useApparelProTable<Basis>({
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
    onCreatingRowSave: handleCreateCurrency,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveBasis,

    muiExpandButtonProps: ({ row, table }) => ({
      onClick: () => table.setExpanded({ [row.id]: !row.getIsExpanded() }),
    }),

    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true);
        }}
      >
        New Basis
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
        title="Delete Basis"
        message={`Are you sure you want to delete "${rowToDelete?.original.code}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeletingBasis}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default BasisTable;
