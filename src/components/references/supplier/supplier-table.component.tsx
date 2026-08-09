// Inside SupplierTable.tsx component body:
import { useState } from "react";
import {
  useCreateSupplierMutation,
  useDeleteSupplierMutation,
  useUpdateSupplierMutation,
} from "../../../tanstack-hooks/custom-hooks";
import type { Supplier } from "../../../interfaces/references/Supplier";
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
import BuyerAddresses from "../address-tanstack/buyer-address.component";
import { useApparelProTable } from "../../../themes/useApparelProTable";
import ConfirmDialog from "../../common/confirm-dialog";

interface Props {
  columns: MRT_ColumnDef<Supplier>[];
  data: Supplier[];
  itemsCount: number;
  isError: boolean;
  isLoading: boolean;
  paginate: PaginationData;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
}

const SupplierTable = ({
  columns,
  data,
  itemsCount,
  isError,
  pagination,
  setPagination,
}: Props) => {
  const [, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const [buyerCode, setBuyerCode] = useState<number>(0);
  const [rowToDelete, setRowToDelete] = useState<MRT_Row<Supplier> | null>(
    null,
  );
  const validationRequired = (value: string) => !value?.length;
  const validateBuyer = ({ name }: Supplier) => {
    console.log("validation :", validationRequired(name));
    return {
      name: validationRequired(name) ? "Supplier Name required" : "",
    };
  };

  // 1. Consume mutations cleanly
  const { mutateAsync: createSupplier } = useCreateSupplierMutation();
  const { mutateAsync: updateSupplier } = useUpdateSupplierMutation();
  const { mutateAsync: deleteSupplier, isPending: isDeletingSupplier } =
    useDeleteSupplierMutation();

  // 2. Your save hooks remain highly intuitive
  const handleCreateBuyer: MRT_TableOptions<Supplier>["onCreatingRowSave"] =
    async ({ values, table }) => {
      console.log("save");
      values = { ...values, id: 0 };
      const newValidationErrors = validateBuyer(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        console.log("validation err: ", newValidationErrors);
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      // Fires mutationFn, runs network call, invalidates cache automatically on success!
      await createSupplier(values);
      table.setCreatingRow(null);
    };

  const handleSaveBuyer: MRT_TableOptions<Supplier>["onEditingRowSave"] =
    async ({ values, table }) => {
      //  values = { ...values, id: 0 };
      console.log("buyer code", buyerCode);
      const newValidationErrors = validateBuyer(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      values = { ...values, buyerCode: buyerCode };
      console.log("buyer ", values);

      // Fires mutationFn, runs network call, invalidates cache automatically on success!
      await updateSupplier(values);
      table.setEditingRow(null);
    };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<Supplier>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    await deleteSupplier(rowToDelete.original.supplierCode);
    setRowToDelete(null);
  };

  const handleCancelDelete = () => {
    setRowToDelete(null);
  };

  //  CRUD Operations

  const table = useApparelProTable<Supplier>({
    columns,
    data: data,

    // 🚀 THE CRITICAL FIX: Explicitly bind your initial pagination keys here!
    initialState: {
      density: "compact",
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
      columnVisibility: {
        supplierCode: false,
      },
    },

    // Display mode configuration
    createDisplayMode: "row",
    editDisplayMode: "row",

    enableExpandAll: false,

    // pagination
    // Pagination configuration
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

    // 🚀 CHANGE THIS: Map directly to the incoming prop variables
    state: {
      pagination: pagination, // Uses the prop passed from Currencies.tsx
      showAlertBanner: isError,
    },

    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateBuyer,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveBuyer,

    muiTableBodyRowProps: ({ table }) => ({
      hover: !table.getState().editingRow,
      sx: {
        "& .MuiInputBase-input": {
          color: "#000000", // Forces input text color to black
          WebkitTextFillColor: "#000000", // Ensures compatibility with Safari
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
        New Supplier
      </Button>
    ),

    renderRowActions: ({ row }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title="Edit">
          <IconButton
            onClick={() => {
              table.setEditingRow(row);
              setBuyerCode(row.original.supplierCode);
            }}
          >
            <ModeEditOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
            <DeleteForeverOutlinedIcon className="flex w-full justify-start h-5 w1-5 border1-4 border1-yellow-300" />
          </IconButton>
        </Tooltip>
      </Box>
    ),

    //custom expand button rotation

    muiExpandButtonProps: ({ row, table }) => ({
      onClick: () => table.setExpanded({ [row.id]: !row.getIsExpanded() }), //only 1 detail panel open at a time

      sx: {
        transform: row.getIsExpanded() ? "rotate(180deg)" : "rotate(-90deg)",
        transition: "transform 0.2s",
      },
    }),

    //conditionally render detail panel

    renderDetailPanel: ({ row }) => {
      //   const addresses = row.original.addresses;
      //   const addressId = row.original.addressId;

      return (
        <>
          <Box
            sx={{
              // "& tr:nth-of-type(odd)": {
              //   backgroundColor: darken("#4B9CD3", 0),
              // },
              // "& tr:nth-of-type(even)": {
              //   backgroundColor: darken("#7CB9E8", 0),
              // },

              margin: "0",
              fontSize: "50%",
              width: "100%",
            }}
          >
            <BuyerAddresses buyerCode={row.original.supplierCode} />
          </Box>
        </>
      );
    },
  });

  return (
    <>
      <MaterialReactTable table={table} />
      <ConfirmDialog
        open={!!rowToDelete}
        title="Delete Supplier"
        message={`Are you sure you want to delete "${rowToDelete?.original.name}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeletingSupplier}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default SupplierTable;
