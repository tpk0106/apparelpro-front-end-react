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
import type { Employee } from "../../../../interfaces/production/Employee";
import {
  useCreateEmployeeMutation,
  useDeleteEmployeeMutation,
  useUpdateEmployeeMutation,
} from "../../../../tanstack-hooks/production-reference.hooks";
import { useApparelProTable } from "../../../../themes/useApparelProTable";
import ConfirmDialog from "../../../common/confirm-dialog";

const employeeSchema = z.object({
  employeeCode: z
    .string()
    .trim()
    .min(1, "Employee No. required")
    .max(4, "Max 4 characters"),
  name: z
    .string()
    .trim()
    .min(1, "Name required")
    .max(30, "Max 30 characters"),
});

type ValidationErrors = Partial<Record<keyof Employee, string>>;

const validateEmployee = (values: Employee): ValidationErrors => {
  const result = employeeSchema.safeParse(values);
  if (result.success) return {};
  const errors: ValidationErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof Employee;
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
};

interface Props {
  columns: MRT_ColumnDef<Employee>[];
  data: Employee[];
  itemsCount: number;
  isError: boolean;
  isLoading: boolean;
  paginate: PaginationData;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
}

const EmployeeTable = ({
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
  const [rowToDelete, setRowToDelete] = useState<MRT_Row<Employee> | null>(
    null,
  );

  const { mutateAsync: createEmployee } = useCreateEmployeeMutation();
  const { mutateAsync: updateEmployee } = useUpdateEmployeeMutation();
  const { mutateAsync: deleteEmployee, isPending: isDeletingEmployee } =
    useDeleteEmployeeMutation();

  const handleCreate: MRT_TableOptions<Employee>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateEmployee(values);
      if (Object.keys(newValidationErrors).length) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await createEmployee(values);
      table.setCreatingRow(null);
    };

  const handleSave: MRT_TableOptions<Employee>["onEditingRowSave"] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateEmployee(values);
    if (Object.keys(newValidationErrors).length) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateEmployee(values);
    table.setEditingRow(null);
  };

  const openDeleteConfirmModal = (row: MRT_Row<Employee>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    await deleteEmployee(rowToDelete.original.employeeCode);
    setRowToDelete(null);
  };

  const handleCancelDelete = () => {
    setRowToDelete(null);
  };

  const table = useApparelProTable<Employee>({
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
        New Employee
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
        title="Delete Employee"
        message={`Are you sure you want to delete "${rowToDelete?.original.employeeCode}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeletingEmployee}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default EmployeeTable;
