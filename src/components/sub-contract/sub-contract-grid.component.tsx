import { useMemo, useState } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
} from "material-react-table";
import { Box, Button, IconButton, MenuItem, Tooltip } from "@mui/material";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import { useApparelProTable } from "../../themes/useApparelProTable";
import ConfirmDialog from "../common/confirm-dialog";
import type { SubContractor } from "../../interfaces/references/SubContractor";
import type { Currency } from "../../interfaces/references/Currency";
import type { Unit } from "../../interfaces/references/Unit";
import type {
  SubContractRow,
  SaveSubContractPayload,
} from "./sub-contract.types";
import {
  useSaveSubContractMutation,
  useDeleteSubContractMutation,
} from "../../tanstack-hooks/sub-contract.hooks";

interface SubContractScope {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
}

interface SubContractGridProps {
  scope: SubContractScope;
  rows: SubContractRow[];
  isLoading: boolean;
  subContractorsList: SubContractor[];
  currenciesList: Currency[];
  unitsList: Unit[];
  onQuantityWarning: (message: string | null) => void;
  onSaveError: (message: string | null) => void;
}

const selectMenuProps = {
  MenuProps: {
    PaperProps: {
      sx: {
        backgroundColor: "#ffffff !important",
        "& .MuiMenuItem-root": {
          color: "#000000 !important",
        },
        "& .Mui-selected": {
          backgroundColor: "#e3f2fd !important",
          color: "#000000 !important",
        },
      },
    },
  },
};

export default function SubContractGrid({
  scope,
  rows,
  isLoading,
  subContractorsList,
  currenciesList,
  unitsList,
  onQuantityWarning,
  onSaveError,
}: SubContractGridProps) {
  const [, setValidationErrors] = useState<Record<string, string | undefined>>(
    {},
  );
  const [rowToDelete, setRowToDelete] = useState<MRT_Row<SubContractRow> | null>(
    null,
  );

  const { mutateAsync: saveSubContract } = useSaveSubContractMutation();
  const { mutateAsync: deleteSubContract, isPending: isDeleting } =
    useDeleteSubContractMutation();

  // Mirrors the backend's hard-block validation in SubContractService
  // (SubQuantity/CostPerGarment must be > 0, ReceivedQuantity can't be
  // negative or exceed SubQuantity) - see SubContractService.cs.
  const validateSubContract = (values: SubContractRow) => {
    return {
      subContractorCode: !values.subContractorCode
        ? "Sub Contractor required"
        : "",
      subQuantity:
        !values.subQuantity || values.subQuantity <= 0
          ? "Quantity must be greater than zero"
          : "",
      costPerGarment:
        !values.costPerGarment || values.costPerGarment <= 0
          ? "Cost per Garment must be greater than zero"
          : "",
      currency: !values.currency ? "Currency required" : "",
      unit: !values.unit ? "Unit required" : "",
      receivedQuantity:
        values.receivedQuantity < 0
          ? "Received Qty can't be negative"
          : values.receivedQuantity > values.subQuantity
            ? "Received Qty can't exceed Sub Contract Qty"
            : "",
    };
  };

  const buildPayload = (values: SubContractRow): SaveSubContractPayload => ({
    buyerCode: scope.buyerCode,
    order: scope.order,
    typeCode: scope.typeCode,
    styleCode: scope.styleCode,
    subContractorCode: values.subContractorCode,
    subQuantity: values.subQuantity,
    costPerGarment: values.costPerGarment,
    currency: values.currency,
    unit: values.unit,
    receivedQuantity: values.receivedQuantity || 0,
  });

  const handleSaveRow = async (
    values: SubContractRow,
    closeEditor: () => void,
  ) => {
    const newValidationErrors = validateSubContract(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    onSaveError(null);

    try {
      const result = await saveSubContract(buildPayload(values));
      onQuantityWarning(result.quantityWarning);
      closeEditor();
    } catch (error) {
      onSaveError(
        error instanceof Error ? error.message : "Failed to save Sub Contract entry",
      );
    }
  };

  const handleCreateSubContract: MRT_TableOptions<SubContractRow>["onCreatingRowSave"] =
    async ({ values, table }) => {
      await handleSaveRow(values as SubContractRow, () =>
        table.setCreatingRow(null),
      );
    };

  const handleEditSubContract: MRT_TableOptions<SubContractRow>["onEditingRowSave"] =
    async ({ values, table }) => {
      await handleSaveRow(values as SubContractRow, () =>
        table.setEditingRow(null),
      );
    };

  const openDeleteConfirmModal = (row: MRT_Row<SubContractRow>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    await deleteSubContract({
      ...scope,
      subContractorCode: rowToDelete.original.subContractorCode,
    });
    setRowToDelete(null);
  };

  const handleCancelDelete = () => {
    setRowToDelete(null);
  };

  const columns = useMemo<MRT_ColumnDef<SubContractRow>[]>(
    () => [
      {
        accessorKey: "subContractorCode",
        header: "Sub Contractor",
        size: 200,
        // Composite key column with the style scope - locked once the row
        // exists, same pattern as Garment Type Items' Stock/Item column.
        enableEditing: (row) => !row.original.subContractorCode,
        Cell: ({ row }) =>
          `${row.original.subContractorCode} - ${row.original.subContractorName || ""}`,
        muiEditTextFieldProps: {
          select: true,
          required: true,
          SelectProps: selectMenuProps.MenuProps,
          children: subContractorsList.map((sc) => (
            <MenuItem key={sc.code} value={sc.code}>
              {sc.code} - {sc.name}
            </MenuItem>
          )),
        },
      },
      {
        accessorKey: "subQuantity",
        header: "Sub Contract Qty",
        size: 140,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(),
        muiEditTextFieldProps: { type: "number", required: true },
      },
      {
        accessorKey: "costPerGarment",
        header: "Cost / Garment",
        size: 130,
        Cell: ({ cell }) => cell.getValue<number>().toFixed(2),
        muiEditTextFieldProps: { type: "number", required: true },
      },
      {
        accessorKey: "currency",
        header: "Currency",
        size: 110,
        editVariant: "select",
        muiEditTextFieldProps: {
          select: true,
          required: true,
          SelectProps: selectMenuProps.MenuProps,
          children: currenciesList.map((currency) => (
            <MenuItem key={currency.code} value={currency.code}>
              {currency.code}
            </MenuItem>
          )),
        },
      },
      {
        accessorKey: "unit",
        header: "Unit",
        size: 100,
        editVariant: "select",
        muiEditTextFieldProps: {
          select: true,
          required: true,
          SelectProps: selectMenuProps.MenuProps,
          children: unitsList.map((unit) => (
            <MenuItem key={unit.id} value={unit.code}>
              {unit.code}
            </MenuItem>
          )),
        },
      },
      {
        accessorKey: "receivedQuantity",
        header: "Received Qty",
        size: 130,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(),
        muiEditTextFieldProps: { type: "number" },
      },
      {
        accessorKey: "balanceQuantity",
        header: "Balance",
        size: 110,
        enableEditing: false,
        Cell: ({ row }) =>
          (
            row.original.subQuantity - (row.original.receivedQuantity || 0)
          ).toLocaleString(),
      },
    ],
    [subContractorsList, currenciesList, unitsList],
  );

  const table = useApparelProTable<SubContractRow>({
    columns,
    data: rows,

    initialState: { density: "compact" },

    createDisplayMode: "row",
    editDisplayMode: "row",

    enableExpandAll: false,
    enableEditing: true,

    state: { isLoading },

    getRowId: (row) => row.subContractorCode || "new",

    localization: {
      noRecordsToDisplay:
        "No Sub Contract entries yet for this Style - click 'New Sub Contract Entry' to add one.",
    },

    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateSubContract,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleEditSubContract,

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
      <Button variant="contained" onClick={() => table.setCreatingRow(true)}>
        New Sub Contract Entry
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
        title="Delete Sub Contract Entry"
        message={`Are you sure you want to delete the Sub Contract entry for "${rowToDelete?.original.subContractorName || rowToDelete?.original.subContractorCode}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}
