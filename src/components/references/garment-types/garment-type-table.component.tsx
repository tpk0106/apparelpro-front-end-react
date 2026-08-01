import { useState } from "react";
import {
  MaterialReactTable,
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

import {
  useCreateGarmentType,
  useDeleteGarmentType,
  useUpdateGarmentType,
} from "../../../data/custom-hooks/apparel-pro.repository.hooks";
import { useApparelProTable } from "../../../themes/useApparelProTable";
import ConfirmDialog from "../../common/confirm-dialog";

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

  const [, setValidationErrors] = useState<Record<string, string | undefined>>(
    {},
  );
  const [rowToDelete, setRowToDelete] = useState<MRT_Row<GarmentType> | null>(
    null,
  );
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
  const { mutateAsync: createGarmentType } = useCreateGarmentType(
    pagination,
    paginate,
  );

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
  const { mutateAsync: updateGarmentType } = useUpdateGarmentType(pagination);

  // call DELETE hook
  const { mutateAsync: deleteGarmentType, isPending: isDeletingGarmentType } =
    useDeleteGarmentType(pagination);
  //

  const openDeleteConfirmModal = (row: MRT_Row<GarmentType>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    await deleteGarmentType(rowToDelete.original.id);
    setRowToDelete(null);
  };

  const handleCancelDelete = () => {
    setRowToDelete(null);
  };

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

  const table = useApparelProTable<GarmentType>({
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

  return (
    <>
      <MaterialReactTable table={table} />
      <ConfirmDialog
        open={!!rowToDelete}
        title="Delete Garment Type"
        message={`Are you sure you want to delete "${rowToDelete?.original.typeName}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeletingGarmentType}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default GarmentTypeTable;
