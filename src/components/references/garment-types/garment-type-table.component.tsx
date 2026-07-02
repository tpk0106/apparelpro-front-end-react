import { useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_Row,
  type MRT_TableOptions,
} from "material-react-table";

import { Box, Button, darken, IconButton, Tooltip } from "@mui/material";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";

import type { PaginationData } from "../../../interfaces/definitions";

import type { GarmentType } from "../../../interfaces/references/GarmentType";

// import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
// import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import HourglassFullOutlinedIcon from "@mui/icons-material/HourglassFullOutlined";
import {
  useCreateGarmentType,
  useDeleteGarmentType,
  useUpdateGarmentType,
} from "../../../data/custom-hooks/apparel-pro.repository.hooks";

interface Props {
  columns: MRT_ColumnDef<GarmentType>[];
  data: GarmentType[];
  setGarmentTypeComponentPaginationState: (
    pageIndex: number,
    pageSize: number,
  ) => void;
  itemsCount: number;
  isError: boolean;
  isLoading: boolean;
  paginate: PaginationData;
  pagination: MRT_PaginationState;
}

const GarmentTypeTable = ({
  columns,
  data,
  setGarmentTypeComponentPaginationState,
  itemsCount,
  isError,
  isLoading,
}: Props) => {
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const paginate: PaginationData = {
    pageIndex: 0,
    pageSize: 5,
    sortColumn: null,
    sortOrder: null,
    filterColumn: null,
    filterQuery: null,
  };

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const validationRequired = (value: string) => !value?.length;
  const validateGarmentType = ({ typeName }: GarmentType) => {
    return {
      name: validationRequired(typeName) ? "GarmentType Name required" : "",
    };
  };

  //  CRUD Operations

  //CREATE action

  const handleCreateGarmentTypes: MRT_TableOptions<GarmentType>["onCreatingRowSave"] =
    async ({ values, table }) => {
      values = {
        ...values,
        id: 0,
      };

      const newValidationErrors = validateGarmentType(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        // console.log("error........", newValidationErrors);
        return;
      }
      setValidationErrors({});
      await createGarmentType(values);
      table.setCreatingRow(null); //exit creating mode
    };

  //call CREATE hook
  const { mutateAsync: createGarmentType, isPending: isCreatingGarmentType } =
    useCreateGarmentType(pagination, paginate);

  // UPDATE action
  const handleSaveGarmentType: MRT_TableOptions<GarmentType>["onEditingRowSave"] =
    async ({ values, table, row }) => {
      const originalRow = row.original;
      values = {
        ...values,
        id: originalRow.id,
      };

      const newValidationErrors = validateGarmentType({ ...values });
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      await updateGarmentType(values);
      table.setEditingRow(null); //exit editing mode
    };

  //call UPDATE hook
  const { mutateAsync: updateGarmentType, isPending: isUpdatingCurrency } =
    useUpdateGarmentType(pagination);

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<GarmentType>) => {
    if (window.confirm("Are you sure you want to delete this Garment Type?")) {
      deleteGarmentType(row.original.id);
    }
  };

  // call DELETE hook
  const { mutateAsync: deleteGarmentType, isPending: isDeletingCurrency } =
    useDeleteGarmentType(pagination);
  //

  // Pagination
  const handlePaginationChange = (updater: unknown) => {
    setPagination((oldPagination) => {
      const newPagination =
        typeof updater === "function" ? updater(oldPagination) : updater;
      console.log("supplier table : ", newPagination);
      setGarmentTypeComponentPaginationState(
        newPagination.pageIndex,
        newPagination.pageSize,
      );
      return newPagination;
    });
  };
  // end of Pagination

  const table = useMaterialReactTable({
    columns,
    data: data,
    initialState: { density: "compact" },

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
    onPaginationChange: handlePaginationChange,

    enableEditing: true,

    // state
    state: { pagination, showAlertBanner: isError },

    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateGarmentTypes,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveGarmentType,

    muiExpandButtonProps: ({ row, table }) => ({
      onClick: () => table.setExpanded({ [row.id]: !row.getIsExpanded() }),
    }),

    muiTopToolbarProps: {
      sx: () => ({
        backgroundColor: "rgb(96 165 250)",
        boxShadow: "0px 0px 20px rgba(0,0,0,.5)",
      }),
    },

    // Cell styling
    muiTableHeadCellProps: {
      sx: (theme) => ({
        fontSize: (theme.palette.background.paper = "0.8rem"),
        fontWeight: "600",
        backgroundColor: "#fff",
        // color: "#42a5f5",
        color: "#000",
        boxShadow: "0 -5px 3px -3px black, 0 5px 3px -3px ",
      }),
    },

    // table body
    muiTableBodyProps: {
      sx: (theme) => ({
        fontSize: (theme.palette.background.paper = "0.5rem"),
      }),
    },

    muiTableBodyRowProps: ({ row, table }) => ({
      hover: !table.getState().editingRow,
      sx: {
        opacity:
          !table.getState().editingRow ||
          table.getState().editingRow?.id === row.id ||
          table.getState().creatingRow
            ? 1
            : 0.4,
        backgroundColor:
          Number(row?.id) % 2 === 0 ||
          table.getState().editingRow?.id === row.id
            ? darken("#4B9CD3", 0)
            : darken("#7CB9E8", 0),
        "&:hover td": {
          borderTop: "1px solid #fff",
          borderBottom: "1px solid #fff",
          color: "#4B9CD3",
          backgroundColor:
            table.getState().editingRow?.id === row.id ||
            table.getState().creatingRow
              ? "#fff"
              : "#000",
        },
      },
    }),

    muiTableFooterRowProps: {
      sx: () => ({
        backgroundColor: "rgb(96 165 250)",
        boxShadow: "0px 0px 20px rgba(0,0,0,.5)",
        boder: "5px solid red",
      }),
    },

    renderCaption: () => {
      return (isLoading && (
        <div className="text1-red-600 flex justify-center border1-2 border1-red-200 bg-red-50 w-[90%] m-auto h-auto align-middle rounded-md ">
          <div className="bg-gray-50 z-40 w-full h-full absolute top-5 left-10 opacity-90">
            <div className="w-[85%] h-[70%] border-2 border1-red-400 p-20  m-auto">
              <HourglassFullOutlinedIcon />
              {/* <PendingOutlinedIcon />
            <RefreshOutlinedIcon /> */}
            </div>
          </div>
        </div>
      )) ||
        (isUpdatingCurrency && (
          <div className="text-red-600 flex justify-center border-2 border-red-200 bg-red-50 w-[90%] m-auto h-auto align-middle rounded-md ">
            <div className="flex-col flex justify-center font-bold text-lg">
              <div>Updating Supplier.....</div>
            </div>
          </div>
        )) ||
        (isCreatingGarmentType && (
          <div className="text-red-600 flex justify-center border-2 border-red-200 bg-red-50 w-[90%] m-auto h-auto align-middle rounded-md ">
            <div className="flex-col flex justify-center font-bold text-lg">
              <div>Creating new Supplier....</div>
            </div>
          </div>
        )) ||
        (isDeletingCurrency && (
          <div className="text-red-600 flex justify-center border-2 border-red-200 bg-red-50 w-[90%] m-auto h-auto align-middle rounded-md ">
            <div className="flex-col flex justify-center">
              <div>Deleting Supplier.....</div>
            </div>
          </div>
        )) ||
        (validationErrors && validationErrors.typeName) ? (
        <div className="text-red-600 flex justify-center border-2 border-red-200 bg-red-50 w-[90%] m-auto h-auto align-middle rounded-md ">
          <div className="flex-col flex justify-center">
            <div>{validationErrors.typeName}</div>
          </div>
        </div>
      ) : (
        ""
      );
    },

    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true);
        }}
      >
        New GarmentType
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

  return <MaterialReactTable table={table} />;
};

export default GarmentTypeTable;
