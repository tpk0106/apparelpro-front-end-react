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
  useCreateCurrencyConversionMutation,
  useDeleteCurrencyConversionMutation,
  useUpdateCurrencyConversionMutation,
} from "../../../tanstack-hooks/custom-hooks";
import { useApparelProTable } from "../../../themes/useApparelProTable";
import type { CurrencyConversion } from "../../../interfaces/references/CurrencyConversion";
import ConfirmDialog from "../../common/confirm-dialog";

interface Props {
  columns: MRT_ColumnDef<CurrencyConversion>[];
  data: CurrencyConversion[];
  itemsCount: number;
  isError: boolean;
  isLoading: boolean;
  paginate: PaginationData;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
}

const CurrencyConversionTable = ({
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
  const validateCurrencyConversion = ({
    fromCurrency,
    toCurrency,
    value,
  }: CurrencyConversion) => {
    return {
      fromCurrency: validationRequired(fromCurrency)
        ? "From Currency required"
        : "",
      toCurrency: validationRequired(toCurrency) ? "To Currency required" : "",
      value: !value || value <= 0 ? "Rate must be greater than zero" : "",
    };
  };

  const { mutateAsync: createCurrencyConversion } =
    useCreateCurrencyConversionMutation();
  const { mutateAsync: updateCurrencyConversion } =
    useUpdateCurrencyConversionMutation();
  const { mutateAsync: deleteCurrencyConversion, isPending: isDeleting } =
    useDeleteCurrencyConversionMutation();
  const [rowToDelete, setRowToDelete] =
    useState<MRT_Row<CurrencyConversion> | null>(null);

  const handleCreateCurrencyConversion: MRT_TableOptions<CurrencyConversion>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateCurrencyConversion(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      if (values.fromCurrency === values.toCurrency) {
        setValidationErrors({
          toCurrency: "From Currency and To Currency must be different",
        });
        return;
      }
      setValidationErrors({});

      await createCurrencyConversion(values);
      table.setCreatingRow(null);
    };

  const handleSaveCurrencyConversion: MRT_TableOptions<CurrencyConversion>["onEditingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateCurrencyConversion(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      await updateCurrencyConversion(values);
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = (row: MRT_Row<CurrencyConversion>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    await deleteCurrencyConversion({
      fromCurrency: rowToDelete.original.fromCurrency,
      toCurrency: rowToDelete.original.toCurrency,
    });
    setRowToDelete(null);
  };

  const handleCancelDelete = () => {
    setRowToDelete(null);
  };

  const table = useApparelProTable<CurrencyConversion>({
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
    onCreatingRowSave: handleCreateCurrencyConversion,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveCurrencyConversion,

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
        New Conversion Rate
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
        title="Delete Conversion Rate"
        message={`Are you sure you want to delete the ${rowToDelete?.original.fromCurrency} -> ${rowToDelete?.original.toCurrency} conversion rate?`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default CurrencyConversionTable;
