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
  useCreatePortDestinationMutation,
  useDeletePortDestinationMutation,
  useUpdatePortDestinationMutation,
} from "../../../tanstack-hooks/custom-hooks";
import { useApparelProTable } from "../../../themes/useApparelProTable";
import type { PortDestination } from "../../../interfaces/references/PortDestination";
import ConfirmDialog from "../../common/confirm-dialog";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
} from "../../../themes/workspace-theme";

interface Props {
  columns: MRT_ColumnDef<PortDestination>[];
  data: PortDestination[];
  itemsCount: number;
  isError: boolean;
  isLoading: boolean;
  paginate: PaginationData;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
}

const PortDestinationTable = ({
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
  const validatePortDestination = ({ countryCode, code, destinationName }: PortDestination) => {
    return {
      countryCode: validationRequired(countryCode) ? "Country required" : "",
      code: validationRequired(code) ? "Code required" : "",
      destinationName: validationRequired(destinationName)
        ? "Destination Name required"
        : "",
    };
  };

  const { mutateAsync: createPortDestination } =
    useCreatePortDestinationMutation();
  const { mutateAsync: updatePortDestination } =
    useUpdatePortDestinationMutation();
  const { mutateAsync: deletePortDestination, isPending: isDeleting } =
    useDeletePortDestinationMutation();
  const [rowToDelete, setRowToDelete] =
    useState<MRT_Row<PortDestination> | null>(null);

  const handleCreatePortDestination: MRT_TableOptions<PortDestination>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validatePortDestination(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      await createPortDestination(values);
      table.setCreatingRow(null);
    };

  const handleSavePortDestination: MRT_TableOptions<PortDestination>["onEditingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validatePortDestination(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      await updatePortDestination(values);
      table.setEditingRow(null);
    };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<PortDestination>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    await deletePortDestination({
      code: rowToDelete.original.code,
      countryCode: rowToDelete.original.countryCode,
    });
    setRowToDelete(null);
  };

  const handleCancelDelete = () => {
    setRowToDelete(null);
  };

  const table = useApparelProTable<PortDestination>({
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
    onCreatingRowSave: handleCreatePortDestination,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSavePortDestination,

    muiExpandButtonProps: ({ row, table }) => ({
      onClick: () => table.setExpanded({ [row.id]: !row.getIsExpanded() }),
    }),

    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        sx={primaryActionButtonSx}
        onClick={() => {
          table.setCreatingRow(true);
        }}
      >
        <span style={themedButtonLabelStyle}>New Destination / Port</span>
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
        title="Delete Destination / Port"
        message={`Are you sure you want to delete "${rowToDelete?.original.code} / ${rowToDelete?.original.countryCode}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default PortDestinationTable;
