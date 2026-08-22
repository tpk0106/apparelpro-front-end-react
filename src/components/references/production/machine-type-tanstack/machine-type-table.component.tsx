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
import type { MachineType } from "../../../../interfaces/production/MachineType";
import {
  useCreateMachineTypeMutation,
  useDeleteMachineTypeMutation,
  useUpdateMachineTypeMutation,
} from "../../../../tanstack-hooks/production-reference.hooks";
import { useApparelProTable } from "../../../../themes/useApparelProTable";
import ConfirmDialog from "../../../common/confirm-dialog";

const machineTypeSchema = z.object({
  code: z.string().trim().min(1, "Code required").max(2, "Max 2 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Description required")
    .max(30, "Max 30 characters"),
  isManual: z.coerce.boolean(),
});

type ValidationErrors = Partial<Record<keyof MachineType, string>>;

const validateMachineType = (values: MachineType): ValidationErrors => {
  const result = machineTypeSchema.safeParse(values);
  if (result.success) return {};
  const errors: ValidationErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof MachineType;
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
};

interface Props {
  columns: MRT_ColumnDef<MachineType>[];
  data: MachineType[];
  itemsCount: number;
  isError: boolean;
  isLoading: boolean;
  paginate: PaginationData;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
}

const MachineTypeTable = ({
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
  const [rowToDelete, setRowToDelete] = useState<MRT_Row<MachineType> | null>(
    null,
  );

  const { mutateAsync: createMachineType } = useCreateMachineTypeMutation();
  const { mutateAsync: updateMachineType } = useUpdateMachineTypeMutation();
  const { mutateAsync: deleteMachineType, isPending: isDeletingMachineType } =
    useDeleteMachineTypeMutation();

  const handleCreate: MRT_TableOptions<MachineType>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateMachineType(values);
      if (Object.keys(newValidationErrors).length) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await createMachineType(values);
      table.setCreatingRow(null);
    };

  const handleSave: MRT_TableOptions<MachineType>["onEditingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateMachineType(values);
      if (Object.keys(newValidationErrors).length) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await updateMachineType(values);
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = (row: MRT_Row<MachineType>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    await deleteMachineType(rowToDelete.original.code);
    setRowToDelete(null);
  };

  const handleCancelDelete = () => {
    setRowToDelete(null);
  };

  const table = useApparelProTable<MachineType>({
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
    onCreatingRowSave: handleCreate,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSave,
    renderCaption: () =>
      Object.values(validationErrors).some(Boolean) ? (
        <Box sx={{ color: "error.main", px: 2, py: 1 }}>
          {Object.values(validationErrors).filter(Boolean).join(" | ")}
        </Box>
      ) : null,
    renderTopToolbarCustomActions: ({ table }) => (
      <Button variant="contained" onClick={() => table.setCreatingRow(true)}>
        New Machine Type
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
        title="Delete Machine Type"
        message={`Are you sure you want to delete "${rowToDelete?.original.code}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeletingMachineType}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default MachineTypeTable;
