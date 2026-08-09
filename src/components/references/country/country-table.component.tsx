import { useState } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_Row,
  type MRT_TableOptions,
} from "material-react-table";

import { Box, Button, IconButton, Tooltip } from "@mui/material";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";

import type { PaginationData } from "../../../interfaces/definitions";

import type { Country } from "../../../interfaces/references/Country";

// import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
// import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import {
  useCreateCountry,
  useDeleteCountry,
  useUpdateCountry,
} from "../../../data/custom-hooks/apparel-pro.repository.hooks";
import { useApparelProTable } from "../../../themes/useApparelProTable";
import ConfirmDialog from "../../common/confirm-dialog";

interface Props {
  columns: MRT_ColumnDef<Country>[];
  data: Country[];
  itemsCount: number;
  isError: boolean;
  isLoading: boolean;
  paginate: PaginationData;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
}

const CountryTable = ({
  columns,
  data,
  itemsCount,
  isError,
  paginate,
  pagination,
  setPagination,
}: Props) => {
  const [, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const [rowToDelete, setRowToDelete] = useState<MRT_Row<Country> | null>(
    null,
  );

  const validationRequired = (value: string) => !value?.length;
  const validateCountry = ({ name, code }: Country) => {
    return {
      name: validationRequired(name) ? "Country Name required" : "",
      code: validationRequired(code) ? "Country Code required" : "",
      countryCode: validationRequired(code)
        ? "Country for this Country required"
        : "",
    };
  };

  //  CRUD Operations

  //CREATE action

  const handleCreateCountries: MRT_TableOptions<Country>["onCreatingRowSave"] =
    async ({ values, table }) => {
      values = {
        ...values,
        id: 0,
      };

      const newValidationErrors = validateCountry(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        console.log("error........", newValidationErrors);
        return;
      }
      setValidationErrors({});
      await createCountry(values);
      table.setCreatingRow(null); //exit creating mode
    };

  //call CREATE hook
  const { mutateAsync: createCountry } = useCreateCountry(paginate);

  // UPDATE action
  const handleSaveCurrency: MRT_TableOptions<Country>["onEditingRowSave"] =
    async ({ values, table, row }) => {
      const originalRow = row.original;
      values = {
        ...values,
        id: originalRow.id,
      };

      const newValidationErrors = validateCountry({ ...values });
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      await updateCountry(values);

      table.setEditingRow(null); //exit editing mode
    };

  //call UPDATE hook
  const { mutateAsync: updateCountry } = useUpdateCountry(pagination);

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<Country>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    await deleteCountry(rowToDelete.original.code);
    setRowToDelete(null);
  };

  const handleCancelDelete = () => {
    setRowToDelete(null);
  };

  // call DELETE hook
  const { mutateAsync: deleteCountry, isPending: isDeletingCountry } =
    useDeleteCountry(pagination);
  //

  const table = useApparelProTable<Country>({
    columns,
    data: data,

    // 🚀 THE CRITICAL FIX: Explicitly bind your initial pagination keys here!
    initialState: {
      density: "compact",
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    },

    // display mode
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
    // onPaginationChange: handlePaginationChange,
    onPaginationChange: setPagination,

    // 🚀 CHANGE THIS: Map directly to the incoming prop variables
    state: {
      pagination: pagination, // Uses the prop passed from Currencies.tsx
      showAlertBanner: isError,
    },

    enableEditing: true,

    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateCountries,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveCurrency,

    muiExpandButtonProps: ({ row, table }) => ({
      onClick: () => table.setExpanded({ [row.id]: !row.getIsExpanded() }),
    }),

    // muiTopToolbarProps: {
    //   sx: () => ({
    //     backgroundColor: "rgb(96 165 250)",
    //     boxShadow: "0px 0px 20px rgba(0,0,0,.5)",
    //   }),
    // },

    // Cell styling
    // muiTableHeadCellProps: {
    //   sx: (theme) => ({
    //     fontSize: (theme.palette.background.paper = "0.8rem"),
    //     fontWeight: "600",
    //     backgroundColor: "#fff",
    //     // color: "#42a5f5",
    //     color: "#000",
    //     boxShadow: "0 -5px 3px -3px black, 0 5px 3px -3px ",
    //   }),
    // },

    // // table body
    // muiTableBodyProps: {
    //   sx: (theme) => ({
    //     fontSize: (theme.palette.background.paper = "0.5rem"),
    //   }),
    // },

    muiTableBodyRowProps: ({ table }) => ({
      hover: !table.getState().editingRow,
      sx: {
        "& .MuiInputBase-input": {
          color: "#000000", // Forces input text color to black
          WebkitTextFillColor: "#000000", // Ensures compatibility with Safari
        },
      },
    }),

    // muiTableBodyRowProps: ({ row, table }) => ({
    //   hover: !table.getState().editingRow,
    //   sx: {
    //     opacity:
    //       !table.getState().editingRow ||
    //       table.getState().editingRow?.id === row.id ||
    //       table.getState().creatingRow
    //         ? 1
    //         : 0.4,
    //     backgroundColor:
    //       Number(row?.id) % 2 === 0 ||
    //       table.getState().editingRow?.id === row.id
    //         ? darken("#4B9CD3", 0)
    //         : darken("#7CB9E8", 0),
    //     "&:hover td": {
    //       borderTop: "1px solid #fff",
    //       borderBottom: "1px solid #fff",
    //       color: "#4B9CD3",
    //       // color:
    //       //   table.getState().editingRow?.id === row.id ||
    //       //   table.getState().creatingRow
    //       //     ? "#000"
    //       //     : "#fff",
    //       backgroundColor:
    //         table.getState().editingRow?.id === row.id ||
    //         table.getState().creatingRow
    //           ? "#fff"
    //           : "#000",
    //     },
    //   },
    // }),

    // muiTableFooterRowProps: {
    //   sx: () => ({
    //     backgroundColor: "rgb(96 165 250)",
    //     boxShadow: "0px 0px 20px rgba(0,0,0,.5)",
    //     boder: "5px solid red",
    //   }),
    // },

    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true);
        }}
      >
        New Country
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
        title="Delete Country"
        message={`Are you sure you want to delete "${rowToDelete?.original.name}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeletingCountry}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default CountryTable;
