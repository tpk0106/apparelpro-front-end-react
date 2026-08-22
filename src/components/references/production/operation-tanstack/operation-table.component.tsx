import { useState } from "react";
import { z } from "zod";

import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_Row,
  type MRT_TableOptions,
} from "material-react-table";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import type { PaginationData } from "../../../../interfaces/definitions";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import type { Operation } from "../../../../interfaces/production/Operation";
import {
  useCreateOperationMutation,
  useDeleteOperationMutation,
  useUpdateOperationMutation,
} from "../../../../tanstack-hooks/production-reference.hooks";
import { useApparelProTable } from "../../../../themes/useApparelProTable";
import ConfirmDialog from "../../../common/confirm-dialog";

const operationSchema = z.object({
  operationCode: z
    .string()
    .trim()
    .min(1, "Operation Code required")
    .max(4, "Max 4 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Operation description required")
    .max(30, "Max 30 characters"),
});

type ValidationErrors = Partial<Record<keyof Operation, string>>;

const validateOperation = (values: Operation): ValidationErrors => {
  const result = operationSchema.safeParse(values);
  if (result.success) return {};
  const errors: ValidationErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof Operation;
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
};

interface Props {
  columns: MRT_ColumnDef<Operation>[];
  data: Operation[];
  itemsCount: number;
  isError: boolean;
  isLoading: boolean;
  paginate: PaginationData;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
}

const OperationTable = ({
  columns,
  data,
  itemsCount,
  isError,
  pagination,
  setPagination,
}: Props) => {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
  const [rowToDelete, setRowToDelete] = useState<MRT_Row<Operation> | null>(
    null,
  );

  const { mutateAsync: createOperation } = useCreateOperationMutation();
  const { mutateAsync: updateOperation } = useUpdateOperationMutation();
  const { mutateAsync: deleteOperation, isPending: isDeletingOperation } =
    useDeleteOperationMutation();

  const handleCreateOperation: MRT_TableOptions<Operation>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateOperation(values);
      if (Object.keys(newValidationErrors).length) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await createOperation(values);
      table.setCreatingRow(null);
    };

  const handleSaveOperation: MRT_TableOptions<Operation>["onEditingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateOperation(values);
      if (Object.keys(newValidationErrors).length) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await updateOperation(values);
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = (row: MRT_Row<Operation>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    await deleteOperation(rowToDelete.original.operationCode);
    setRowToDelete(null);
  };

  const handleCancelDelete = () => {
    setRowToDelete(null);
  };

  const table = useApparelProTable<Operation>({
    columns,
    data,
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
    rowCount: itemsCount,
    manualPagination: true,
    paginationDisplayMode: "pages",
    muiPaginationProps: {
      color: "secondary",
      rowsPerPageOptions: [10, 20, 50],
      shape: "rounded",
      variant: "outlined",
    },
    onPaginationChange: setPagination,
    enableEditing: true,
    state: {
      pagination: pagination,
      showAlertBanner: isError,
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateOperation,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveOperation,
    renderCaption: () =>
      Object.values(validationErrors).some(Boolean) ? (
        <Box sx={{ color: "error.main", px: 2, py: 1 }}>
          {Object.values(validationErrors).filter(Boolean).join(" | ")}
        </Box>
      ) : null,
    renderTopToolbarCustomActions: ({ table }) => (
      <Button variant="contained" onClick={() => table.setCreatingRow(true)}>
        New Operation
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
            <DeleteForeverOutlinedIcon />
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
        title="Delete Operation"
        message={`Are you sure you want to delete "${rowToDelete?.original.operationCode}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeletingOperation}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default OperationTable;
