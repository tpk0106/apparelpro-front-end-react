import { useState } from "react";
import {
  useCreateBankAddressMutation,
  useDeleteBankAddressMutation,
  useUpdateBankAddressMutation,
} from "../../../tanstack-hooks/custom-hooks";

import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_Row,
  type MRT_TableOptions,
} from "material-react-table";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import {
  type CreateAddressAPIModel,
  type PaginationData,
} from "../../../interfaces/definitions";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import type { Address } from "../../../interfaces/references/Address";
import type {
  DeleteBankAddressPayload,
  UpdateBankAddressPayload,
} from "../../../tanstack-hooks/interfaces";
import { useApparelProTable } from "../../../themes/useApparelProTable";
import ConfirmDialog from "../../common/confirm-dialog";

interface Props {
  columns: MRT_ColumnDef<Address>[];
  data: Address[];
  itemsCount: number;
  isError: boolean;
  isLoading: boolean;
  paginate: PaginationData;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
  bankCode: string;
}

const BankAddressesTable = ({
  columns,
  data,
  itemsCount,
  isError,
  pagination,
  setPagination,
  bankCode,
}: Props) => {
  const [, setValidationErrors] = useState<Record<string, string | undefined>>(
    {},
  );

  const [addressId, setAddressId] = useState<string>("");
  const [rowToDelete, setRowToDelete] = useState<MRT_Row<Address> | null>(null);

  const validationRequired = (value: string) => !value?.length;
  const validationRequiredForAddressType = (value: number) => value > 0;
  const validateBankAddress = ({
    streetAddress,
    city,
    postCode,
    state,
    countryCode,
    addressType,
  }: Address) => {
    return {
      streetAddress: validationRequired(streetAddress || "")
        ? "Street Address required"
        : "",
      city: validationRequired(city || "") ? "City required" : "",
      postCode: validationRequired(postCode || "") ? "Postcode required" : "",
      state: validationRequired(state || "") ? "State required" : "",
      countryCode: validationRequired(countryCode || "")
        ? "Country for this Bank required"
        : "",
      addressType: !validationRequiredForAddressType(addressType)
        ? "Address Type required"
        : "",
    };
  };

  // 1. Consume mutations cleanly
  const { mutateAsync: createBankAddress } = useCreateBankAddressMutation();
  const { mutateAsync: handleUpdateBankAddress } =
    useUpdateBankAddressMutation();
  const { mutateAsync: deleteBankAddress, isPending: isDeletingBankAddress } =
    useDeleteBankAddressMutation();

  // 2. Your save hooks remain highly intuitive
  const handleCreateBankAddress: MRT_TableOptions<Address>["onCreatingRowSave"] =
    async ({ values, table }) => {
      values = { ...values, id: 0, bankCode: bankCode }; // update passed bankCode with final payload to save
      const newValidationErrors = validateBankAddress(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      // Fires mutationFn, runs network call, invalidates cache automatically on success!
      const createAddressAPIModel: CreateAddressAPIModel = {
        ...values,
        default: true,
      };
      await createBankAddress(createAddressAPIModel);
      table.setCreatingRow(null);
    };

  const handleSaveBankAddress: MRT_TableOptions<Address>["onEditingRowSave"] =
    async ({ values, table }) => {
      values = { ...values, id: 0 };
      const newValidationErrors = validateBankAddress(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      // Fires mutationFn, runs network call, invalidates cache automatically on success!
      const updateAddress: UpdateBankAddressPayload = {
        bankCode: bankCode,
        addressId: addressId,
        addressToUpdate: values,
      };
      await handleUpdateBankAddress(updateAddress);
      table.setEditingRow(null); //exit editing mode
    };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<Address>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    const deleteAddressPayload: DeleteBankAddressPayload = {
      id: rowToDelete.original.id,
      addressId: rowToDelete.original.addressId,
    };
    await deleteBankAddress(deleteAddressPayload);
    setRowToDelete(null);
  };

  const handleCancelDelete = () => {
    setRowToDelete(null);
  };

  //  CRUD Operations

  const table = useApparelProTable<Address>({
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
        addressId: false,
      },
    },

    // Display mode configuration
    createDisplayMode: "row",
    editDisplayMode: "row",

    enableExpandAll: false,

    // pagination
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
    onCreatingRowSave: handleCreateBankAddress,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveBankAddress,

    muiExpandButtonProps: ({ row, table }) => ({
      onClick: () => table.setExpanded({ [row.id]: !row.getIsExpanded() }),
    }),

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
        New Bank Address
      </Button>
    ),

    renderRowActions: ({ row }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title="Edit">
          <IconButton
            onClick={() => {
              table.setEditingRow(row);
              setAddressId(row.original.addressId);
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
  });

  return (
    <>
      <MaterialReactTable table={table} />
      <ConfirmDialog
        open={!!rowToDelete}
        title="Delete Address"
        message="Are you sure you want to delete this address?"
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeletingBankAddress}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default BankAddressesTable;
