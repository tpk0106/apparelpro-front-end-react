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
import type { StyleOperationBreakdown } from "../../../interfaces/production/StyleOperationBreakdown";
import type { StyleScope } from "../style-scope/style-scope-picker.component";
import {
  useGetOperations,
  useGetMachineTypes,
} from "../../../tanstack-hooks/production-reference.hooks";
import { useApparelProTable } from "../../../themes/useApparelProTable";
import ConfirmDialog from "../../common/confirm-dialog";

const rowSchema = z.object({
  operationNumber: z.coerce.number().int().positive("Op. No. must be greater than 0"),
  operationCode: z.string().trim().min(1, "Operation required"),
  machineTypeCode: z.string().trim().min(1, "Machine type required"),
  sam: z.coerce.number().positive("SAM must be greater than 0"),
});

type ValidationErrors = Partial<Record<keyof StyleOperationBreakdown, string>>;

const validateRow = (values: StyleOperationBreakdown): ValidationErrors => {
  const result = rowSchema.safeParse(values);
  if (result.success) return {};
  const errors: ValidationErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof StyleOperationBreakdown;
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
};

interface Props {
  scope: StyleScope;
  componentSequence: number;
  componentCode: string;
  rows: StyleOperationBreakdown[];
  onRowsChange: (rows: StyleOperationBreakdown[]) => void;
}

const OperationBreakdownGrid = ({
  scope,
  componentSequence,
  componentCode,
  rows,
  onRowsChange,
}: Props) => {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [rowToDelete, setRowToDelete] = useState<MRT_Row<StyleOperationBreakdown> | null>(null);

  const { data: operationPageData } = useGetOperations({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "operationCode",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const operationOptions = operationPageData?.items ?? [];

  const { data: machineTypePageData } = useGetMachineTypes({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "code",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const machineTypeOptions = machineTypePageData?.items ?? [];

  const columns = useMemo<MRT_ColumnDef<StyleOperationBreakdown>[]>(
    () => [
      { accessorKey: "operationNumber", header: "Op. No.", size: 90, muiEditTextFieldProps: { type: "number" } },
      {
        accessorKey: "operationCode",
        header: "Operation",
        size: 220,
        editVariant: "select",
        editSelectOptions: operationOptions.map((o) => ({
          value: o.operationCode,
          label: `${o.operationCode} - ${o.description}`,
        })),
        Cell: ({ cell }) => {
          const code = cell.getValue<string>();
          const match = operationOptions.find((o) => o.operationCode === code);
          return match ? `${match.operationCode} - ${match.description}` : code;
        },
      },
      {
        accessorKey: "machineTypeCode",
        header: "Machine Type",
        size: 150,
        editVariant: "select",
        editSelectOptions: machineTypeOptions.map((m) => ({
          value: m.code,
          label: `${m.code} - ${m.description}`,
        })),
        Cell: ({ cell }) => {
          const code = cell.getValue<string>();
          const match = machineTypeOptions.find((m) => m.code === code);
          return match ? `${match.code} - ${match.description}` : code;
        },
      },
      { accessorKey: "sam", header: "SAM", size: 90, muiEditTextFieldProps: { type: "number" } },
      {
        accessorKey: "quota",
        header: "Quota",
        size: 90,
        enableEditing: false,
        // MRT seeds a new (creating) row's cells with "" for every column,
        // not undefined - Number("") is 0, so isFinite() below is the guard
        // that actually matters, not the ?? "-" (that only covers
        // null/undefined, which never happens here and let ""?.toFixed
        // through to throw "not a function" on Add).
        Cell: ({ cell }) => {
          const value = Number(cell.getValue());
          return Number.isFinite(value) ? value.toFixed(0) : "-";
        },
      },
      {
        accessorKey: "numberOfMachines",
        header: "Machines",
        size: 100,
        enableEditing: false,
        Cell: ({ cell }) => {
          const value = Number(cell.getValue());
          return Number.isFinite(value) ? value.toFixed(2) : "-";
        },
      },
    ],
    [operationOptions, machineTypeOptions],
  );

  const buildRow = (values: StyleOperationBreakdown): StyleOperationBreakdown => ({
    ...scope,
    componentSequence,
    componentCode,
    operationNumber: values.operationNumber,
    operationCode: values.operationCode,
    machineTypeCode: values.machineTypeCode,
    sam: values.sam,
    quota: 0,
    numberOfMachines: 0,
  });

  const handleCreate: MRT_TableOptions<StyleOperationBreakdown>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateRow(values);
      if (Object.keys(newValidationErrors).length) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      onRowsChange([...rows, buildRow(values)]);
      table.setCreatingRow(null);
    };

  const handleSave: MRT_TableOptions<StyleOperationBreakdown>["onEditingRowSave"] =
    async ({ values, row, table }) => {
      const newValidationErrors = validateRow(values);
      if (Object.keys(newValidationErrors).length) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      onRowsChange(rows.map((r, idx) => (idx === Number(row.id) ? buildRow(values) : r)));
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = (row: MRT_Row<StyleOperationBreakdown>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = () => {
    if (!rowToDelete) return;
    onRowsChange(rows.filter((_, idx) => idx !== Number(rowToDelete.id)));
    setRowToDelete(null);
  };

  const table = useApparelProTable<StyleOperationBreakdown>({
    columns,
    data: rows,
    getRowId: (_row, index) => index.toString(),
    initialState: { density: "compact" },
    createDisplayMode: "row",
    editDisplayMode: "row",
    enableExpandAll: false,
    enablePagination: false,
    enableEditing: true,
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
      <Button
        variant="contained"
        size="small"
        onClick={() => table.setCreatingRow(true)}
      >
        Add operation
      </Button>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => table.setEditingRow(row)}>
            <ModeEditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" color="error" onClick={() => openDeleteConfirmModal(row)}>
            <DeleteForeverOutlinedIcon fontSize="small" />
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
        title="Remove Operation"
        message={`Remove operation "${rowToDelete?.original.operationCode}"? (Not saved until the style is saved.)`}
        confirmLabel="Remove"
        confirmColor="error"
        isConfirming={false}
        onConfirm={handleConfirmDelete}
        onCancel={() => setRowToDelete(null)}
      />
    </>
  );
};

export default OperationBreakdownGrid;
