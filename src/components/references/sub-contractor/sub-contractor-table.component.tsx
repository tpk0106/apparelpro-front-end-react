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
  useCreateSubContractorMutation,
  useDeleteSubContractorMutation,
  useUpdateSubContractorMutation,
} from "../../../tanstack-hooks/custom-hooks";
import type { SubContractor } from "../../../interfaces/references/SubContractor";
import ConfirmDialog from "../../common/confirm-dialog";
import { useApparelProTable } from "../../../themes/useApparelProTable";

interface Props {
  columns: MRT_ColumnDef<SubContractor>[];
  data: SubContractor[];
  itemsCount: number;
  isError: boolean;
  isLoading: boolean;
  paginate: PaginationData;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
}

const SubContractorTable = ({
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

  const validationRequired = (value: string) => !value?.length;
  const validateSubContractor = ({ code, name }: SubContractor) => {
    return {
      code: validationRequired(code) ? "Code required" : "",
      name: validationRequired(name) ? "Name required" : "",
    };
  };

  const { mutateAsync: createSubContractor } =
    useCreateSubContractorMutation();
  const { mutateAsync: updateSubContractor } =
    useUpdateSubContractorMutation();
  const { mutateAsync: deleteSubContractor, isPending: isDeleting } =
    useDeleteSubContractorMutation();
  const [rowToDelete, setRowToDelete] =
    useState<MRT_Row<SubContractor> | null>(null);

  const handleCreateSubContractor: MRT_TableOptions<SubContractor>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateSubContractor(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      await createSubContractor(values);
      table.setCreatingRow(null);
    };

  const handleSaveSubContractor: MRT_TableOptions<SubContractor>["onEditingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateSubContractor(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      await updateSubContractor(values);
      table.setEditingRow(null);
    };

  // DELETE action - shared ConfirmDialog, no native window.confirm() (per project
  // convention; compare basis-table.component.tsx, which is the OLD pattern).
  const openDeleteConfirmModal = (row: MRT_Row<SubContractor>) => {
    setRowToDelete(row);
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    await deleteSubContractor({ code: rowToDelete.original.code });
    setRowToDelete(null);
  };

  const handleCancelDelete = () => {
    setRowToDelete(null);
  };

  const table = useApparelProTable<SubContractor>({
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
      pagination,
      showAlertBanner: isError,
    },

    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateSubContractor,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveSubContractor,

    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true);
        }}
      >
        New Sub Contractor
      </Button>
    ),

    renderRowActions: ({ row, table }) => (
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
        title="Delete Sub Contractor"
        message={`Are you sure you want to delete "${rowToDelete?.original.code} - ${rowToDelete?.original.name}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default SubContractorTable;
