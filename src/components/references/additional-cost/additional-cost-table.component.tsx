import { useState } from "react";

import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_Row,
  type MRT_TableOptions,
} from "material-react-table";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import type { PaginationData } from "../../../interfaces/definitions";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import {
  useCreateAdditionalCostMutation,
  useDeleteAdditionalCostMutation,
  useUpdateAdditionalCostMutation,
} from "../../../tanstack-hooks/custom-hooks";
import type { AdditionalCost } from "../../../interfaces/references/AdditionalCost";
import ConfirmDialog from "../../common/confirm-dialog";
import { useApparelProTable } from "../../../themes/useApparelProTable";

interface Props {
  columns: MRT_ColumnDef<AdditionalCost>[];
  data: AdditionalCost[];
  itemsCount: number;
  isError: boolean;
  isLoading: boolean;
  paginate: PaginationData;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
}

const AdditionalCostTable = ({
  columns,
  data,
  itemsCount,
  isError,
  pagination,
  setPagination,
}: Props) => {
  const [, setValidationErrors] = useState<Record<string, string | undefined>>(
    {},
  );

  const validationRequired = (value: string) => !value?.length;
  const validateAdditionalCost = ({ code, description }: AdditionalCost) => {
    return {
      code: validationRequired(code) ? "Code required" : "",
      description: validationRequired(description) ? "Description required" : "",
    };
  };

  const { mutateAsync: createAdditionalCost } = useCreateAdditionalCostMutation();
  const { mutateAsync: updateAdditionalCost } = useUpdateAdditionalCostMutation();
  const { mutateAsync: deleteAdditionalCost, isPending: isDeleting } =
    useDeleteAdditionalCostMutation();
  const [rowToDelete, setRowToDelete] = useState<MRT_Row<AdditionalCost> | null>(
    null,
  );

  const handleCreateAdditionalCost: MRT_TableOptions<AdditionalCost>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateAdditionalCost(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      await createAdditionalCost(values);
      table.setCreatingRow(null);
    };

  const handleSaveAdditionalCost: MRT_TableOptions<AdditionalCost>["onEditingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateAdditionalCost(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      await updateAdditionalCost(values);
      table.setEditingRow(null);
    };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<AdditionalCost>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    await deleteAdditionalCost({ code: rowToDelete.original.code });
    setRowToDelete(null);
  };

  const handleCancelDelete = () => {
    setRowToDelete(null);
  };

  const table = useApparelProTable<AdditionalCost>({
    columns,
    data: data,

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
    enableEditing: true,

    rowCount: itemsCount,
    manualPagination: true,
    paginationDisplayMode: "pages",
    muiPaginationProps: {
      color: "secondary",
      rowsPerPageOptions: [5, 10, 20],
      shape: "rounded",
      variant: "outlined",
    },
    onPaginationChange: setPagination,

    state: {
      pagination: pagination,
      showAlertBanner: isError,
    },

    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateAdditionalCost,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveAdditionalCost,

    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true);
        }}
      >
        <span style={{ position: "relative", zIndex: 1 }}>New Additional Cost</span>
      </Button>
    ),

    renderRowActions: ({ row }) => (
      <Box sx={{ display: "flex", gap: "0.5rem" }}>
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
        title="Delete Additional Cost"
        message={`Are you sure you want to delete "${rowToDelete?.original.code} - ${rowToDelete?.original.description}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default AdditionalCostTable;
