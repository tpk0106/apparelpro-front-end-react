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
  useCreateStockMutation,
  useDeleteStockMutation,
  useUpdateStockMutation,
} from "../../../tanstack-hooks/custom-hooks";
import { useApparelProTable } from "../../../themes/useApparelProTable";
import type { Stock } from "../../../interfaces/references/Stock";
import ConfirmDialog from "../../common/confirm-dialog";

interface Props {
  columns: MRT_ColumnDef<Stock>[];
  data: Stock[];
  itemsCount: number;
  isError: boolean;
  isLoading: boolean;
  paginate: PaginationData;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
}

const StockTable = ({
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
  const validateStock = ({ stockCode, description }: Stock) => {
    return {
      stockCode: validationRequired(stockCode) ? "Stock Code required" : "",
      description: validationRequired(description) ? "Description required" : "",
    };
  };

  const { mutateAsync: createStock } = useCreateStockMutation();
  const { mutateAsync: updateStock } = useUpdateStockMutation();
  const { mutateAsync: deleteStock, isPending: isDeleting } =
    useDeleteStockMutation();
  const [rowToDelete, setRowToDelete] = useState<MRT_Row<Stock> | null>(null);

  const handleCreateStock: MRT_TableOptions<Stock>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateStock(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      await createStock(values);
      table.setCreatingRow(null);
    };

  const handleSaveStock: MRT_TableOptions<Stock>["onEditingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateStock(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      await updateStock(values);
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = (row: MRT_Row<Stock>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    await deleteStock({ stockCode: rowToDelete.original.stockCode });
    setRowToDelete(null);
  };

  const handleCancelDelete = () => {
    setRowToDelete(null);
  };

  const table = useApparelProTable<Stock>({
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
    onCreatingRowSave: handleCreateStock,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveStock,

    muiExpandButtonProps: ({ row, table }) => ({
      onClick: () => table.setExpanded({ [row.id]: !row.getIsExpanded() }),
    }),

    muiTableBodyRowProps: ({ table }) => ({
      hover: !table.getState().editingRow,
      sx: {
        "& .MuiInputBase-input": {
          color: "#000000",
          WebkitTextFillColor: "#000000",
        },
      },
    }),

    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true);
        }}
      >
        New Stock Reference
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
        title="Delete Stock Reference"
        message={`Are you sure you want to delete "${rowToDelete?.original.stockCode} - ${rowToDelete?.original.description}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default StockTable;
