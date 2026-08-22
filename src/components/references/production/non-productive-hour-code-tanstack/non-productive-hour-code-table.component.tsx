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
import type { NonProductiveHourCode } from "../../../../interfaces/production/NonProductiveHourCode";
import {
  useCreateNonProductiveHourCodeMutation,
  useDeleteNonProductiveHourCodeMutation,
  useUpdateNonProductiveHourCodeMutation,
} from "../../../../tanstack-hooks/production-reference.hooks";
import { useApparelProTable } from "../../../../themes/useApparelProTable";
import ConfirmDialog from "../../../common/confirm-dialog";

const nonProductiveHourCodeSchema = z.object({
  code: z.string().trim().min(1, "Code required").max(2, "Max 2 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Description required")
    .max(30, "Max 30 characters"),
});

type ValidationErrors = Partial<Record<keyof NonProductiveHourCode, string>>;

const validateNonProductiveHourCode = (
  values: NonProductiveHourCode,
): ValidationErrors => {
  const result = nonProductiveHourCodeSchema.safeParse(values);
  if (result.success) return {};
  const errors: ValidationErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof NonProductiveHourCode;
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
};

interface Props {
  columns: MRT_ColumnDef<NonProductiveHourCode>[];
  data: NonProductiveHourCode[];
  itemsCount: number;
  isError: boolean;
  isLoading: boolean;
  paginate: PaginationData;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
}

const NonProductiveHourCodeTable = ({
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
  const [rowToDelete, setRowToDelete] =
    useState<MRT_Row<NonProductiveHourCode> | null>(null);

  const { mutateAsync: createCode } = useCreateNonProductiveHourCodeMutation();
  const { mutateAsync: updateCode } = useUpdateNonProductiveHourCodeMutation();
  const { mutateAsync: deleteCode, isPending: isDeletingCode } =
    useDeleteNonProductiveHourCodeMutation();

  const handleCreate: MRT_TableOptions<NonProductiveHourCode>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateNonProductiveHourCode(values);
      if (Object.keys(newValidationErrors).length) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await createCode(values);
      table.setCreatingRow(null);
    };

  const handleSave: MRT_TableOptions<NonProductiveHourCode>["onEditingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateNonProductiveHourCode(values);
      if (Object.keys(newValidationErrors).length) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await updateCode(values);
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = (row: MRT_Row<NonProductiveHourCode>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    await deleteCode(rowToDelete.original.code);
    setRowToDelete(null);
  };

  const handleCancelDelete = () => {
    setRowToDelete(null);
  };

  const table = useApparelProTable<NonProductiveHourCode>({
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
        New Non-Productive Nature
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
        title="Delete Non-Productive Nature Code"
        message={`Are you sure you want to delete "${rowToDelete?.original.code}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeletingCode}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default NonProductiveHourCodeTable;
