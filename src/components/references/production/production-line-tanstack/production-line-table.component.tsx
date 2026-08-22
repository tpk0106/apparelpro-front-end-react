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
import type { ProductionLine } from "../../../../interfaces/production/ProductionLine";
import {
  useCreateProductionLineMutation,
  useDeleteProductionLineMutation,
  useUpdateProductionLineMutation,
} from "../../../../tanstack-hooks/production-reference.hooks";
import { useApparelProTable } from "../../../../themes/useApparelProTable";
import ConfirmDialog from "../../../common/confirm-dialog";

// Zod governs field validation for this controlled MRT inline-edit form -
// mirrors the strict-typing/validation requirement without introducing a
// separate modal form component the legacy screen never needed.
const productionLineSchema = z.object({
  lineCode: z
    .string()
    .trim()
    .min(1, "Line Code required")
    .max(3, "Max 3 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Description required")
    .max(30, "Max 30 characters"),
  numberOfMachines: z.coerce
    .number()
    .int("Whole number only")
    .positive("Must be greater than 0"),
  currencyCode: z
    .string()
    .trim()
    .min(1, "Currency Code required")
    .max(3, "Max 3 characters"),
  lineCostPerDay: z.coerce.number().nonnegative("Must be 0 or more"),
  minimumProductionPerOrder: z.coerce
    .number()
    .int("Whole number only")
    .nonnegative("Must be 0 or more"),
  unitCode: z.string().trim().min(1, "Unit Code required").max(3, "Max 3 characters"),
});

type ValidationErrors = Partial<Record<keyof ProductionLine, string>>;

const validateProductionLine = (values: ProductionLine): ValidationErrors => {
  const result = productionLineSchema.safeParse(values);
  if (result.success) return {};
  const errors: ValidationErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof ProductionLine;
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
};

interface Props {
  columns: MRT_ColumnDef<ProductionLine>[];
  data: ProductionLine[];
  itemsCount: number;
  isError: boolean;
  isLoading: boolean;
  paginate: PaginationData;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
}

const ProductionLineTable = ({
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
    useState<MRT_Row<ProductionLine> | null>(null);

  const { mutateAsync: createProductionLine } =
    useCreateProductionLineMutation();
  const { mutateAsync: updateProductionLine } =
    useUpdateProductionLineMutation();
  const {
    mutateAsync: deleteProductionLine,
    isPending: isDeletingProductionLine,
  } = useDeleteProductionLineMutation();

  const handleCreateProductionLine: MRT_TableOptions<ProductionLine>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateProductionLine(values);
      if (Object.keys(newValidationErrors).length) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await createProductionLine(values);
      table.setCreatingRow(null);
    };

  const handleSaveProductionLine: MRT_TableOptions<ProductionLine>["onEditingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateProductionLine(values);
      if (Object.keys(newValidationErrors).length) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await updateProductionLine(values);
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = (row: MRT_Row<ProductionLine>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    await deleteProductionLine(rowToDelete.original.lineCode);
    setRowToDelete(null);
  };

  const handleCancelDelete = () => {
    setRowToDelete(null);
  };

  const table = useApparelProTable<ProductionLine>({
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
    onCreatingRowSave: handleCreateProductionLine,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveProductionLine,
    renderCaption: () =>
      Object.values(validationErrors).some(Boolean) ? (
        <Box sx={{ color: "error.main", px: 2, py: 1 }}>
          {Object.values(validationErrors).filter(Boolean).join(" | ")}
        </Box>
      ) : null,
    renderTopToolbarCustomActions: ({ table }) => (
      <Button variant="contained" onClick={() => table.setCreatingRow(true)}>
        New Production Line
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
        title="Delete Production Line"
        message={`Are you sure you want to delete "${rowToDelete?.original.lineCode}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeletingProductionLine}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default ProductionLineTable;
