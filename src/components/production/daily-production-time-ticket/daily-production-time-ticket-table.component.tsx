import { useMemo, useState } from "react";
import { z } from "zod";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
} from "material-react-table";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import type { DailyProductionTimeTicketEntry } from "../../../interfaces/production/DailyProductionTimeTicket";
import type { TicketScope } from "../../../services/production/daily-production-time-ticket.service";
import {
  useGetEmployees,
  useGetOperations,
  useGetNonProductiveHourCodes,
} from "../../../tanstack-hooks/production-reference.hooks";
import { useBulkSaveDailyProductionTimeTicketMutation } from "../../../tanstack-hooks/daily-production-time-ticket.hooks";
import { useApparelProTable } from "../../../themes/useApparelProTable";
import ConfirmDialog from "../../common/confirm-dialog";

const rowSchema = z.object({
  employeeCode: z.string().trim().min(1, "Employee required"),
  operationCode: z.string().trim().min(1, "Operation required"),
  quantity: z.coerce.number().nonnegative("Quantity must be 0 or more"),
  nonProductiveHours: z.coerce.number().nonnegative("NPH must be 0 or more"),
  workHours: z.coerce.number().positive("Work hours must be greater than 0"),
});

type ValidationErrors = Partial<Record<keyof DailyProductionTimeTicketEntry, string>>;

const validateRow = (values: DailyProductionTimeTicketEntry): ValidationErrors => {
  const result = rowSchema.safeParse(values);
  if (result.success) return {};
  const errors: ValidationErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof DailyProductionTimeTicketEntry;
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
};

interface Props {
  scope: TicketScope;
  rows: DailyProductionTimeTicketEntry[];
  setRows: React.Dispatch<React.SetStateAction<DailyProductionTimeTicketEntry[]>>;
  isLoading: boolean;
}

const DailyProductionTimeTicketTable = ({ scope, rows, setRows, isLoading }: Props) => {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [rowToDelete, setRowToDelete] = useState<MRT_Row<DailyProductionTimeTicketEntry> | null>(null);

  const { data: employeePageData } = useGetEmployees({
    pageIndex: 0, pageSize: 999, sortColumn: "employeeCode", sortOrder: "asc",
    filterColumn: null, filterQuery: null,
  });
  const employeeOptions = employeePageData?.items ?? [];

  const { data: operationPageData } = useGetOperations({
    pageIndex: 0, pageSize: 999, sortColumn: "operationCode", sortOrder: "asc",
    filterColumn: null, filterQuery: null,
  });
  const operationOptions = operationPageData?.items ?? [];

  const { data: nphPageData } = useGetNonProductiveHourCodes({
    pageIndex: 0, pageSize: 999, sortColumn: "code", sortOrder: "asc",
    filterColumn: null, filterQuery: null,
  });
  const nphOptions = nphPageData?.items ?? [];

  const { mutateAsync: bulkSave, isPending: isSaving } = useBulkSaveDailyProductionTimeTicketMutation();

  const columns = useMemo<MRT_ColumnDef<DailyProductionTimeTicketEntry>[]>(
    () => [
      {
        accessorKey: "employeeCode",
        header: "Empl. No.",
        size: 150,
        editVariant: "select",
        editSelectOptions: employeeOptions.map((e) => ({ value: e.employeeCode, label: `${e.employeeCode} - ${e.name}` })),
        Cell: ({ cell }) => {
          const code = cell.getValue<string>();
          const match = employeeOptions.find((e) => e.employeeCode === code);
          return match ? `${match.employeeCode} - ${match.name}` : code;
        },
      },
      {
        accessorKey: "operationCode",
        header: "Op. Code",
        size: 200,
        editVariant: "select",
        editSelectOptions: operationOptions.map((o) => ({ value: o.operationCode, label: `${o.operationCode} - ${o.description}` })),
        Cell: ({ cell }) => {
          const code = cell.getValue<string>();
          const match = operationOptions.find((o) => o.operationCode === code);
          return match ? `${match.operationCode} - ${match.description}` : code;
        },
      },
      { accessorKey: "quantity", header: "Qty.", size: 90, muiEditTextFieldProps: { type: "number" } },
      {
        accessorKey: "nonProductiveHourCode",
        header: "NP Code",
        size: 150,
        editVariant: "select",
        editSelectOptions: nphOptions.map((n) => ({ value: n.code, label: `${n.code} - ${n.description}` })),
        Cell: ({ cell }) => {
          const code = cell.getValue<string | null>();
          if (!code) return "-";
          const match = nphOptions.find((n) => n.code === code);
          return match ? `${match.code} - ${match.description}` : code;
        },
      },
      { accessorKey: "nonProductiveHours", header: "NPH", size: 90, muiEditTextFieldProps: { type: "number" } },
      { accessorKey: "workHours", header: "Hrs Wrkd", size: 100, muiEditTextFieldProps: { type: "number" } },
    ],
    [employeeOptions, operationOptions, nphOptions],
  );

  const buildRow = (values: DailyProductionTimeTicketEntry): DailyProductionTimeTicketEntry => ({
    ...scope,
    employeeCode: values.employeeCode,
    operationCode: values.operationCode,
    quantity: values.quantity,
    nonProductiveHourCode: values.nonProductiveHourCode || null,
    nonProductiveHours: values.nonProductiveHours,
    workHours: values.workHours,
  });

  const handleCreate: MRT_TableOptions<DailyProductionTimeTicketEntry>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateRow(values);
      if (Object.keys(newValidationErrors).length) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      setRows((prev) => [...prev, buildRow(values)]);
      table.setCreatingRow(null);
    };

  const handleSave: MRT_TableOptions<DailyProductionTimeTicketEntry>["onEditingRowSave"] =
    async ({ values, row, table }) => {
      const newValidationErrors = validateRow(values);
      if (Object.keys(newValidationErrors).length) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      setRows((prev) => prev.map((r, idx) => (idx === Number(row.id) ? buildRow(values) : r)));
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = (row: MRT_Row<DailyProductionTimeTicketEntry>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = () => {
    if (!rowToDelete) return;
    setRows((prev) => prev.filter((_, idx) => idx !== Number(rowToDelete.id)));
    setRowToDelete(null);
  };

  const handleSaveAll = async () => {
    await bulkSave({ scope, records: rows });
  };

  const table = useApparelProTable<DailyProductionTimeTicketEntry>({
    columns,
    data: rows,
    getRowId: (_row, index) => index.toString(),
    initialState: { density: "compact" },
    createDisplayMode: "row",
    editDisplayMode: "row",
    enableExpandAll: false,
    enablePagination: false,
    enableEditing: true,
    state: { isLoading },
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
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Button variant="contained" onClick={() => table.setCreatingRow(true)}>
          Add entry
        </Button>
        <Button variant="outlined" onClick={handleSaveAll} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </Box>
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
        title="Remove Entry"
        message={`Remove this entry for "${rowToDelete?.original.employeeCode}"? (Not saved until you click Save.)`}
        confirmLabel="Remove"
        confirmColor="error"
        isConfirming={false}
        onConfirm={handleConfirmDelete}
        onCancel={() => setRowToDelete(null)}
      />
    </>
  );
};

export default DailyProductionTimeTicketTable;
