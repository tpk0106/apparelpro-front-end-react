import { useState } from "react";

import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
} from "material-react-table";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import type { GarmentTypeItem } from "../../../interfaces/references/GarmentTypeItem";
import {
  useDeleteGarmentTypeItemMutation,
  useSaveGarmentTypeItemMutation,
} from "../../../tanstack-hooks/custom-hooks";
import { useApparelProTable } from "../../../themes/useApparelProTable";
import ConfirmDialog from "../../common/confirm-dialog";

interface Props {
  columns: MRT_ColumnDef<GarmentTypeItem>[];
  data: GarmentTypeItem[];
  garmentTypeId: number;
  isError: boolean;
  isLoading: boolean;
}

// The "Stock / Item" column is a synthetic, non-persisted field (id: "stockItem",
// combined "StockCode|ItemCode" value) - see garment-type-items.component.tsx for
// why. material-react-table still reports it back on save keyed by column id, so
// the values object handed to onCreatingRowSave/onEditingRowSave carries this
// extra key alongside the real GarmentTypeItem fields.
type GarmentTypeItemFormValues = GarmentTypeItem & { stockItem?: string };

const splitStockItem = (stockItem: string | undefined) => {
  const [stockCode, itemCode] = (stockItem || "").split("|");
  return { stockCode: stockCode || "", itemCode: itemCode || "" };
};

const GarmentTypeItemsTable = ({
  columns,
  data,
  garmentTypeId,
  isError,
  isLoading,
}: Props) => {
  const [, setValidationErrors] = useState<Record<string, string | undefined>>(
    {},
  );
  const [rowToDelete, setRowToDelete] = useState<MRT_Row<GarmentTypeItem> | null>(
    null,
  );

  const validationRequired = (value: string) => !value?.length;
  const validateGarmentTypeItem = (values: GarmentTypeItemFormValues) => {
    const { stockCode, itemCode } = values.stockItem
      ? splitStockItem(values.stockItem)
      : { stockCode: values.stockCode, itemCode: values.itemCode };
    return {
      stockItem:
        validationRequired(stockCode) || validationRequired(itemCode)
          ? "Stock / Item required"
          : "",
      unit: validationRequired(values.unit) ? "Unit required" : "",
      quantity:
        !values.quantity || values.quantity <= 0
          ? "Quantity must be greater than zero"
          : "",
    };
  };

  // Backend upserts by (garmentTypeId, stockCode, itemCode) - same Save endpoint
  // handles both create and edit, matching OD_ITM1.PRG's add-or-update dbedit logic.
  const { mutateAsync: saveGarmentTypeItem } = useSaveGarmentTypeItemMutation();
  const { mutateAsync: deleteGarmentTypeItem, isPending: isDeleting } =
    useDeleteGarmentTypeItemMutation();

  const handleCreateGarmentTypeItem: MRT_TableOptions<GarmentTypeItem>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const formValues = values as GarmentTypeItemFormValues;
      const newValidationErrors = validateGarmentTypeItem(formValues);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      const { stockCode, itemCode } = splitStockItem(formValues.stockItem);
      await saveGarmentTypeItem({
        garmentTypeId,
        stockCode,
        itemCode,
        unit: values.unit,
        quantity: values.quantity,
      });
      table.setCreatingRow(null);
    };

  const handleSaveGarmentTypeItem: MRT_TableOptions<GarmentTypeItem>["onEditingRowSave"] =
    async ({ values, table }) => {
      const formValues = values as GarmentTypeItemFormValues;
      const newValidationErrors = validateGarmentTypeItem(formValues);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      // Stock/Item stays locked once created (enableEditing on the column), so
      // formValues.stockItem here is just the row's original, unchanged value -
      // accessorFn recomputes it from row.original every render. There are no
      // separate stockCode/itemCode columns any more, so this is the only
      // source for both codes on edit as well as create.
      const { stockCode, itemCode } = splitStockItem(formValues.stockItem);
      await saveGarmentTypeItem({
        garmentTypeId,
        stockCode,
        itemCode,
        unit: values.unit,
        quantity: values.quantity,
      });
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = (row: MRT_Row<GarmentTypeItem>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    await deleteGarmentTypeItem({
      garmentTypeId,
      stockCode: rowToDelete.original.stockCode,
      itemCode: rowToDelete.original.itemCode,
    });
    setRowToDelete(null);
  };

  const handleCancelDelete = () => {
    setRowToDelete(null);
  };

  const table = useApparelProTable<GarmentTypeItem>({
    columns,
    data,

    initialState: {
      density: "compact",
    },

    createDisplayMode: "row",
    editDisplayMode: "row",

    enableExpandAll: false,
    enableEditing: true,

    state: {
      isLoading,
      showAlertBanner: isError,
    },

    localization: {
      noRecordsToDisplay:
        garmentTypeId > 0
          ? "No item requirements yet for this Garment Type - click 'New Item Requirement' to add one."
          : "Select a Garment Type above to view/manage its default item requirements.",
    },

    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateGarmentTypeItem,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveGarmentTypeItem,

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
      <Tooltip
        title={
          garmentTypeId > 0 ? "" : "Select a Garment Type above first"
        }
      >
        <span>
          <Button
            variant="contained"
            disabled={garmentTypeId <= 0}
            onClick={() => {
              table.setCreatingRow(true);
            }}
          >
            New Item Requirement
          </Button>
        </span>
      </Tooltip>
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
        title="Delete Item Requirement"
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

export default GarmentTypeItemsTable;
