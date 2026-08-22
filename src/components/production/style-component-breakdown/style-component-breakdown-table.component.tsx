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
import type { StyleComponentBreakdown } from "../../../interfaces/production/StyleComponentBreakdown";
import type { StyleScope } from "../style-scope/style-scope-picker.component";
import { useGetGarmentComponents } from "../../../tanstack-hooks/production-reference.hooks";
import { useBulkSaveComponentBreakdownMutation } from "../../../tanstack-hooks/production-style-breakdown.hooks";
import { useApparelProTable } from "../../../themes/useApparelProTable";
import ConfirmDialog from "../../common/confirm-dialog";

const rowSchema = z.object({
  componentSequence: z.coerce.number().int().positive("Sequence must be greater than 0"),
  componentCode: z.string().trim().min(1, "Component required"),
});

type ValidationErrors = Partial<Record<keyof StyleComponentBreakdown, string>>;

const validateRow = (values: StyleComponentBreakdown): ValidationErrors => {
  const result = rowSchema.safeParse(values);
  if (result.success) return {};
  const errors: ValidationErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof StyleComponentBreakdown;
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
};

interface Props {
  scope: StyleScope;
  rows: StyleComponentBreakdown[];
  setRows: React.Dispatch<React.SetStateAction<StyleComponentBreakdown[]>>;
  isLoading: boolean;
}

const StyleComponentBreakdownTable = ({ scope, rows, setRows, isLoading }: Props) => {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [rowToDelete, setRowToDelete] = useState<MRT_Row<StyleComponentBreakdown> | null>(null);

  const { data: componentPageData } = useGetGarmentComponents({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "componentCode",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const componentOptions = componentPageData?.items ?? [];

  const { mutateAsync: bulkSave, isPending: isSaving } = useBulkSaveComponentBreakdownMutation();

  const columns = useMemo<MRT_ColumnDef<StyleComponentBreakdown>[]>(
    () => [
      {
        accessorKey: "componentSequence",
        header: "Sequence",
        size: 120,
        muiEditTextFieldProps: { type: "number" },
      },
      {
        accessorKey: "componentCode",
        header: "Component",
        size: 250,
        editVariant: "select",
        editSelectOptions: componentOptions.map((c) => ({
          value: c.componentCode,
          label: `${c.componentCode} - ${c.description}`,
        })),
        Cell: ({ cell }) => {
          const code = cell.getValue<string>();
          const match = componentOptions.find((c) => c.componentCode === code);
          return match ? `${match.componentCode} - ${match.description}` : code;
        },
      },
    ],
    [componentOptions],
  );

  const handleCreate: MRT_TableOptions<StyleComponentBreakdown>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateRow(values);
      if (Object.keys(newValidationErrors).length) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      setRows((prev) => [...prev, { ...scope, ...values }]);
      table.setCreatingRow(null);
    };

  const handleSave: MRT_TableOptions<StyleComponentBreakdown>["onEditingRowSave"] =
    async ({ values, row, table }) => {
      const newValidationErrors = validateRow(values);
      if (Object.keys(newValidationErrors).length) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      setRows((prev) =>
        prev.map((r, idx) => (idx === Number(row.id) ? { ...scope, ...values } : r)),
      );
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = (row: MRT_Row<StyleComponentBreakdown>) => {
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

  const table = useApparelProTable<StyleComponentBreakdown>({
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
          Add component
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
        title="Remove Component"
        message={`Remove component "${rowToDelete?.original.componentCode}" from this style? (Not saved until you click Save.)`}
        confirmLabel="Remove"
        confirmColor="error"
        isConfirming={false}
        onConfirm={handleConfirmDelete}
        onCancel={() => setRowToDelete(null)}
      />
    </>
  );
};

export default StyleComponentBreakdownTable;
