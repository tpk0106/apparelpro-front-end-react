import { useState } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_Row,
  type MRT_TableOptions,
} from "material-react-table";
import ConfirmDialog from "../../common/confirm-dialog";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";

import {
  useCreateSeasonMutation,
  useDeleteSeasonMutation,
  useUpdateSeasonMutation,
} from "../../../tanstack-hooks/custom-hooks";

import type { PaginationData } from "../../../interfaces/definitions";
import type { Season } from "../../../interfaces/references/Season";
import { useApparelProTable } from "../../../themes/useApparelProTable";

import type {
  DeleteSeasonPayload,
  UpdateSeasonPayload,
} from "../../../tanstack-hooks/interfaces";

interface Props {
  columns: MRT_ColumnDef<Season>[];
  data: Season[];
  itemsCount: number;
  isError: boolean;
  isLoading: boolean;
  paginate: PaginationData;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
}

const SeasonTable = ({
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

  const [rowToDelete, setRowToDelete] = useState<MRT_Row<Season> | null>(null);

  const validationRequired = (value: string) => !value?.length;
  const validateSeason = ({ code, description }: Season) => {
    return {
      description: validationRequired(description) ? "Description required" : "",
      code: validationRequired(code) ? "Season Code required" : "",
    };
  };

  const { mutateAsync: createSeason } = useCreateSeasonMutation();
  const { mutateAsync: updateEditSeason } = useUpdateSeasonMutation();
  const { mutateAsync: deleteSeason, isPending: isDeletingSeason } =
    useDeleteSeasonMutation();

  const handleCreateSeason: MRT_TableOptions<Season>["onCreatingRowSave"] =
    async ({ values, table }) => {
      values = { ...values, id: 0 };
      const newValidationErrors = validateSeason(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      await createSeason(values);
      table.setCreatingRow(null);
    };

  const handleSaveSeason: MRT_TableOptions<Season>["onEditingRowSave"] = async ({
    values,
    table,
  }) => {
    values = { ...values, id: 0 };
    const newValidationErrors = validateSeason(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});

    const updateSeasonPayload: UpdateSeasonPayload = {
      seasonToUpdate: { ...values },
      code: values.code,
    };
    await updateEditSeason(updateSeasonPayload);
    table.setEditingRow(null);
  };

  const openDeleteConfirmModal = (row: MRT_Row<Season>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    const deleteSeasonPayload: DeleteSeasonPayload = {
      code: rowToDelete.original.code,
    };
    await deleteSeason(deleteSeasonPayload);
    setRowToDelete(null);
  };

  const handleCancelDelete = () => {
    setRowToDelete(null);
  };

  const table = useApparelProTable<Season>({
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
    onCreatingRowSave: handleCreateSeason,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveSeason,

    muiExpandButtonProps: ({ row, table }) => ({
      onClick: () => table.setExpanded({ [row.id]: !row.getIsExpanded() }),
    }),

    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true);
        }}
      >
        New Season
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
        title="Delete Season"
        message={`Are you sure you want to delete "${rowToDelete?.original.code}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeletingSeason}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default SeasonTable;
