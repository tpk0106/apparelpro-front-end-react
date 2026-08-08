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
  useCreateOrderItemFeatureMutation,
  useDeleteOrderItemFeatureMutation,
  useUpdateOrderItemFeatureMutation,
} from "../../../tanstack-hooks/custom-hooks";
import { useApparelProTable } from "../../../themes/useApparelProTable";
import type { OrderItemFeature } from "../../../interfaces/references/OrderItemFeature";
import ConfirmDialog from "../../common/confirm-dialog";

interface Props {
  columns: MRT_ColumnDef<OrderItemFeature>[];
  data: OrderItemFeature[];
  itemsCount: number;
  isError: boolean;
  isLoading: boolean;
  paginate: PaginationData;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
}

const OrderItemFeatureTable = ({
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
  const validateOrderItemFeature = ({
    stockCode,
    itemCode,
  }: OrderItemFeature) => {
    return {
      stockCode: validationRequired(stockCode) ? "Stock Code required" : "",
      itemCode: validationRequired(itemCode) ? "Item Code required" : "",
    };
  };

  const { mutateAsync: createOrderItemFeature } =
    useCreateOrderItemFeatureMutation();
  const { mutateAsync: updateOrderItemFeature } =
    useUpdateOrderItemFeatureMutation();
  const { mutateAsync: deleteOrderItemFeature, isPending: isDeleting } =
    useDeleteOrderItemFeatureMutation();
  const [rowToDelete, setRowToDelete] =
    useState<MRT_Row<OrderItemFeature> | null>(null);

  const handleCreateOrderItemFeature: MRT_TableOptions<OrderItemFeature>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateOrderItemFeature(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      await createOrderItemFeature(values);
      table.setCreatingRow(null);
    };

  const handleSaveOrderItemFeature: MRT_TableOptions<OrderItemFeature>["onEditingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateOrderItemFeature(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      await updateOrderItemFeature(values);
      table.setEditingRow(null);
    };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<OrderItemFeature>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    await deleteOrderItemFeature({
      stockCode: rowToDelete.original.stockCode,
      itemCode: rowToDelete.original.itemCode,
    });
    setRowToDelete(null);
  };

  const handleCancelDelete = () => {
    setRowToDelete(null);
  };

  const table = useApparelProTable<OrderItemFeature>({
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

    enableEditing: true,

    state: {
      pagination: pagination,
      showAlertBanner: isError,
    },

    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateOrderItemFeature,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveOrderItemFeature,

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
        New Order Item Feature
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
        title="Delete Order Item Feature"
        message={`Are you sure you want to delete "${rowToDelete?.original.stockCode} / ${rowToDelete?.original.itemCode}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default OrderItemFeatureTable;
