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
import type { EstimatedProductionEntry } from "../../../interfaces/production/EstimatedProductionEntry";
import type { EstimatedProductionEntryScope } from "../../../services/production/estimated-production-entry.service";
import { useGetHolidays } from "../../../tanstack-hooks/production-line-allocation.hooks";
import { useBulkSaveEstimatedProductionEntriesMutation } from "../../../tanstack-hooks/estimated-production-entry.hooks";
import { useApparelProTable } from "../../../themes/useApparelProTable";
import ConfirmDialog from "../../common/confirm-dialog";

const rowSchema = z.object({
  date: z.string().trim().min(1, "Date required"),
  quantity: z.coerce.number().nonnegative("Quantity must be 0 or more"),
});

type ValidationErrors = Partial<Record<keyof EstimatedProductionEntry, string>>;

const validateRow = (values: EstimatedProductionEntry): ValidationErrors => {
  const result = rowSchema.safeParse(values);
  if (result.success) return {};
  const errors: ValidationErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof EstimatedProductionEntry;
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
};

interface Props {
  scope: EstimatedProductionEntryScope;
  unit: string;
  rows: EstimatedProductionEntry[];
  setRows: React.Dispatch<React.SetStateAction<EstimatedProductionEntry[]>>;
  isLoading: boolean;
  onSaveError: (message: string | null) => void;
}

const EstimatedProductionEntryTable = ({ scope, unit, rows, setRows, isLoading, onSaveError }: Props) => {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [rowToDelete, setRowToDelete] = useState<MRT_Row<EstimatedProductionEntry> | null>(null);

  // Legacy PR_ESTD1.PRG shows a soft, dismissible warning - "Date falls on
  // {holiday}, continue?" - rather than a hard block, so a pending row is
  // held here and only committed to local state once confirmed.
  const [pendingRow, setPendingRow] = useState<{
    values: EstimatedProductionEntry;
    holidayDescription: string;
    onConfirm: () => void;
  } | null>(null);

  const { data: holidayPageData } = useGetHolidays({
    pageIndex: 0, pageSize: 999, sortColumn: "date", sortOrder: "asc",
    filterColumn: null, filterQuery: null,
  });
  const holidays = holidayPageData?.items ?? [];

  const { mutateAsync: bulkSave, isPending: isSaving } = useBulkSaveEstimatedProductionEntriesMutation();

  const columns = useMemo<MRT_ColumnDef<EstimatedProductionEntry>[]>(
    () => [
      { accessorKey: "date", header: "Date", size: 150, muiEditTextFieldProps: { type: "date" } },
      { accessorKey: "quantity", header: "Estimated Output", size: 150, muiEditTextFieldProps: { type: "number" } },
    ],
    [],
  );

  const buildRow = (values: EstimatedProductionEntry): EstimatedProductionEntry => ({
    ...scope,
    date: values.date,
    unit,
    quantity: values.quantity,
  });

  const commitRow = (values: EstimatedProductionEntry, existingIndex: number | null) => {
    const row = buildRow(values);
    setRows((prev) =>
      existingIndex === null ? [...prev, row] : prev.map((r, idx) => (idx === existingIndex ? row : r)),
    );
  };

  const saveRowWithHolidayCheck = (values: EstimatedProductionEntry, existingIndex: number | null) => {
    const holiday = holidays.find((h) => h.date === values.date);
    if (holiday) {
      setPendingRow({
        values,
        holidayDescription: holiday.description,
        onConfirm: () => commitRow(values, existingIndex),
      });
      return;
    }
    commitRow(values, existingIndex);
  };

  const handleCreate: MRT_TableOptions<EstimatedProductionEntry>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateRow(values);
      if (Object.keys(newValidationErrors).length) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      saveRowWithHolidayCheck(values, null);
      table.setCreatingRow(null);
    };

  const handleSave: MRT_TableOptions<EstimatedProductionEntry>["onEditingRowSave"] =
    async ({ values, row, table }) => {
      const newValidationErrors = validateRow(values);
      if (Object.keys(newValidationErrors).length) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      saveRowWithHolidayCheck(values, Number(row.id));
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = (row: MRT_Row<EstimatedProductionEntry>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = () => {
    if (!rowToDelete) return;
    setRows((prev) => prev.filter((_, idx) => idx !== Number(rowToDelete.id)));
    setRowToDelete(null);
  };

  const handleSaveAll = async () => {
    onSaveError(null);
    try {
      await bulkSave({ scope, unit, records: rows });
    } catch (err) {
      const message =
        (err as { response?: { data?: string } })?.response?.data ?? (err as Error).message;
      onSaveError(String(message));
    }
  };

  const table = useApparelProTable<EstimatedProductionEntry>({
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
          Add date
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
        message={`Remove the estimate for "${rowToDelete?.original.date}"? (Not saved until you click Save.)`}
        confirmLabel="Remove"
        confirmColor="error"
        isConfirming={false}
        onConfirm={handleConfirmDelete}
        onCancel={() => setRowToDelete(null)}
      />
      <ConfirmDialog
        open={!!pendingRow}
        title="Date falls on a holiday"
        message={`${pendingRow?.values.date} falls on "${pendingRow?.holidayDescription}". Continue anyway?`}
        confirmLabel="Continue"
        confirmColor="warning"
        isConfirming={false}
        onConfirm={() => {
          pendingRow?.onConfirm();
          setPendingRow(null);
        }}
        onCancel={() => setPendingRow(null)}
      />
    </>
  );
};

export default EstimatedProductionEntryTable;
