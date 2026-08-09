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
  useCreateOrderItemCatalogMutation,
  useDeleteOrderItemCatalogMutation,
  useUpdateOrderItemCatalogMutation,
} from "../../../tanstack-hooks/custom-hooks";
import { useApparelProTable } from "../../../themes/useApparelProTable";
import type { OrderItemCatalog } from "../../../interfaces/references/OrderItemCatalog";
import ConfirmDialog from "../../common/confirm-dialog";

interface Props {
  columns: MRT_ColumnDef<OrderItemCatalog>[];
  data: OrderItemCatalog[];
  itemsCount: number;
  isError: boolean;
  isLoading: boolean;
  paginate: PaginationData;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
}

const OrderItemCatalogTable = ({
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
  const validateOrderItemCatalog = ({ stockCode, itemCode, description }: OrderItemCatalog) => {
    return {
      stockCode: validationRequired(stockCode) ? "Stock Code required" : "",
      // StockItems.ItemCode is varchar(4) - the input's slotProps.htmlInput
      // maxLength already stops normal typing, but validate here too as a
      // backstop (defense in depth, same as basis.component.tsx's Code field).
      itemCode: validationRequired(itemCode)
        ? "Item Code required"
        : itemCode.trim().length > 4
          ? "Item Code must be 4 characters or fewer"
          : "",
      description: validationRequired(description) ? "Description required" : "",
    };
  };

  const { mutateAsync: createOrderItemCatalog } = useCreateOrderItemCatalogMutation();
  const { mutateAsync: updateOrderItemCatalog } = useUpdateOrderItemCatalogMutation();
  const { mutateAsync: deleteOrderItemCatalog, isPending: isDeleting } =
    useDeleteOrderItemCatalogMutation();
  const [rowToDelete, setRowToDelete] = useState<MRT_Row<OrderItemCatalog> | null>(
    null,
  );

  const handleCreateOrderItemCatalog: MRT_TableOptions<OrderItemCatalog>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateOrderItemCatalog(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      await createOrderItemCatalog({
        ...values,
        itemCode: values.itemCode.trim().toUpperCase().slice(0, 4),
      });
      table.setCreatingRow(null);
    };

  const handleSaveOrderItemCatalog: MRT_TableOptions<OrderItemCatalog>["onEditingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateOrderItemCatalog(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      await updateOrderItemCatalog({
        ...values,
        itemCode: values.itemCode.trim().toUpperCase().slice(0, 4),
      });
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = (row: MRT_Row<OrderItemCatalog>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    await deleteOrderItemCatalog({
      stockCode: rowToDelete.original.stockCode,
      itemCode: rowToDelete.original.itemCode,
    });
    setRowToDelete(null);
  };

  const handleCancelDelete = () => {
    setRowToDelete(null);
  };

  const table = useApparelProTable<OrderItemCatalog>({
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
    onCreatingRowSave: handleCreateOrderItemCatalog,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveOrderItemCatalog,

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
        New Order Item
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
        title="Delete Order Item"
        message={`Are you sure you want to delete "${rowToDelete?.original.stockCode}/${rowToDelete?.original.itemCode} - ${rowToDelete?.original.description}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default OrderItemCatalogTable;
