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
import type { Holiday } from "../../../../interfaces/production/Holiday";
import {
  useCreateHolidayMutation,
  useDeleteHolidayMutation,
} from "../../../../tanstack-hooks/production-line-allocation.hooks";
import { useApparelProTable } from "../../../../themes/useApparelProTable";
import ConfirmDialog from "../../../common/confirm-dialog";

// Matches legacy CALENDER.PRG exactly: a holiday can be added or deleted,
// never edited in place (there's no "edit description" path in the source).
const holidaySchema = z.object({
  date: z.string().trim().min(1, "Date required"),
  description: z.string().trim().min(1, "Description required").max(50, "Max 50 characters"),
});

type ValidationErrors = Partial<Record<keyof Holiday, string>>;

const validateHoliday = (values: Holiday): ValidationErrors => {
  const result = holidaySchema.safeParse(values);
  if (result.success) return {};
  const errors: ValidationErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof Holiday;
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
};

interface Props {
  columns: MRT_ColumnDef<Holiday>[];
  data: Holiday[];
  itemsCount: number;
  isError: boolean;
  isLoading: boolean;
  paginate: PaginationData;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
}

const HolidayTable = ({ columns, data, itemsCount, isError, pagination, setPagination }: Props) => {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [rowToDelete, setRowToDelete] = useState<MRT_Row<Holiday> | null>(null);

  const { mutateAsync: createHoliday } = useCreateHolidayMutation();
  const { mutateAsync: deleteHoliday, isPending: isDeletingHoliday } = useDeleteHolidayMutation();

  const handleCreate: MRT_TableOptions<Holiday>["onCreatingRowSave"] = async ({ values, table }) => {
    const newValidationErrors = validateHoliday(values);
    if (Object.keys(newValidationErrors).length) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createHoliday(values);
    table.setCreatingRow(null);
  };

  const openDeleteConfirmModal = (row: MRT_Row<Holiday>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    await deleteHoliday(rowToDelete.original.date);
    setRowToDelete(null);
  };

  const table = useApparelProTable<Holiday>({
    columns,
    data,
    initialState: { density: "compact", pagination: { pageIndex: pagination.pageIndex, pageSize: pagination.pageSize } },
    createDisplayMode: "row",
    enableEditing: true,
    editDisplayMode: "row",
    enableExpandAll: false,
    rowCount: itemsCount,
    manualPagination: true,
    paginationDisplayMode: "pages",
    muiPaginationProps: { color: "secondary", rowsPerPageOptions: [10, 20, 50], shape: "rounded", variant: "outlined" },
    onPaginationChange: setPagination,
    state: { pagination, showAlertBanner: isError },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreate,
    renderCaption: () =>
      Object.values(validationErrors).some(Boolean) ? (
        <Box sx={{ color: "error.main", px: 2, py: 1 }}>
          {Object.values(validationErrors).filter(Boolean).join(" | ")}
        </Box>
      ) : null,
    renderTopToolbarCustomActions: ({ table }) => (
      <Button variant="contained" onClick={() => table.setCreatingRow(true)}>
        Add holiday
      </Button>
    ),
    renderRowActions: ({ row }) => (
      <Tooltip title="Delete">
        <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
          <DeleteForeverOutlinedIcon />
        </IconButton>
      </Tooltip>
    ),
  });

  return (
    <>
      <MaterialReactTable table={table} />
      <ConfirmDialog
        open={!!rowToDelete}
        title="Delete Holiday"
        message={`Are you sure you want to delete "${rowToDelete?.original.date}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeletingHoliday}
        onConfirm={handleConfirmDelete}
        onCancel={() => setRowToDelete(null)}
      />
    </>
  );
};

export default HolidayTable;
