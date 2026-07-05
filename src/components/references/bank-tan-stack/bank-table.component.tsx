// Inside BankTable.tsx component body:

import { useState } from "react";
import {
  useCreateBankMutation,
  useDeleteBankMutation,
  useUpdateBankMutation,
} from "../../../tanstack-hooks/custom-hooks";

import {
  MaterialReactTable,
  // useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_Row,
  type MRT_TableOptions,
} from "material-react-table";
import { Box, Button, darken, IconButton, Tooltip } from "@mui/material";
import type { PaginationData } from "../../../interfaces/definitions";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import type { Bank } from "../../../interfaces/references/Bank";
import { useApparelProTable } from "../../../themes/useApparelProTable";

//import { darken, lighten } from '@mui/material/styles';

interface Props {
  columns: MRT_ColumnDef<Bank>[];
  data: Bank[];
  itemsCount: number;
  isError: boolean;
  isLoading: boolean;
  paginate: PaginationData;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
}

const BankTable = ({
  columns,
  data,
  itemsCount,
  isError,
  isLoading,
  // paginate,
  pagination,
  setPagination,
}: Props) => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const validationRequired = (value: string) => !value?.length;
  const validateCurrency = ({ name, bankCode, currencyCode }: Bank) => {
    console.log("validation :", validationRequired(name));
    return {
      name: validationRequired(name) ? "Bank Name required" : "",
      code: validationRequired(bankCode) ? "Bank Code required" : "",
      countryCode: validationRequired(currencyCode)
        ? "Bank for this Bank required"
        : "",
    };
  };

  // 1. Consume mutations cleanly
  const { mutateAsync: createBank, isPending: isCreatingBank } =
    useCreateBankMutation();
  const { mutateAsync: updateBank, isPending: isUpdatingBank } =
    useUpdateBankMutation();
  const { mutateAsync: deleteBank, isPending: isDeletingBank } =
    useDeleteBankMutation();

  // 2. Your save hooks remain highly intuitive
  const handleCreateCurrency: MRT_TableOptions<Bank>["onCreatingRowSave"] =
    async ({ values, table }) => {
      console.log("save");
      values = { ...values, id: 0 };
      const newValidationErrors = validateCurrency(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        console.log("validation err: ", newValidationErrors);
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      // Fires mutationFn, runs network call, invalidates cache automatically on success!
      await createBank(values);
      table.setCreatingRow(null);
    };

  const handleSaveCurrency: MRT_TableOptions<Bank>["onEditingRowSave"] =
    async ({ values, table }) => {
      values = { ...values, id: 0 };
      const newValidationErrors = validateCurrency(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});

      // Fires mutationFn, runs network call, invalidates cache automatically on success!
      await updateBank(values);
      table.setCreatingRow(null);
    };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<Bank>) => {
    if (window.confirm("Are you sure you want to delete this Bank?")) {
      deleteBank(row.original.bankCode);
    }
  };

  //  CRUD Operations

  const table = useApparelProTable<Bank>({
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
    onCreatingRowSave: handleCreateCurrency,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveCurrency,

    muiExpandButtonProps: ({ row, table }) => ({
      onClick: () => table.setExpanded({ [row.id]: !row.getIsExpanded() }),
    }),

    // // 1. Top Toolbar Workspace Header
    // muiTopToolbarProps: {
    //   sx: {
    //     backgroundColor: "#141922", // Surface/Card background color choice
    //     backgroundImage: "none",
    //     borderBottom: "1px solid rgba(139, 147, 161, 0.15)", // Light muted border accent edge
    //     paddingY: "8px",
    //   },
    // },

    // // 2. Table Headers (Enforcing structural grid typography rules)
    // muiTableHeadCellProps: {
    //   sx: {
    //     fontFamily: '"Space Grotesk", sans-serif', // UI labels layout font
    //     fontSize: "0.85rem",
    //     fontWeight: "600",
    //     letterSpacing: "0.03em",
    //     textTransform: "uppercase",
    //     backgroundColor: "#141922",
    //     color: "#F4F6F8", // Primary crisp text color rule
    //     borderBottom: "2px solid rgba(99, 102, 241, 0.3)", // Indigo primary glow signature under headers
    //     paddingY: "14px",
    //   },
    // },

    // // 3. Table Data Body Workspace Panel
    // muiTableBodyProps: {
    //   sx: {
    //     backgroundColor: "#0A0E14", // Core Primary background depth
    //   },
    // },

    // // 4. Custom Dense Tabular Rows & Editing States
    // muiTableBodyRowProps: ({ row, table }) => {
    //   const isEditing = table.getState().editingRow?.id === row.id;
    //   const isRowEven = Number(row?.id) % 2 === 0;

    //   return {
    //     hover: !table.getState().editingRow,
    //     sx: {
    //       // Enforce strict focus isolation opacity mapping rules
    //       opacity:
    //         !table.getState().editingRow ||
    //         isEditing ||
    //         table.getState().creatingRow
    //           ? 1
    //           : 0.35,
    //       transition: "all 0.15s ease-in-out",

    //       // Zebra striping using deep variant shifts
    //       backgroundColor: isEditing
    //         ? "rgba(99, 102, 241, 0.12)"
    //         : isRowEven
    //           ? "#0A0E14"
    //           : "#10141C",

    //       // Typography settings inside row cell targets
    //       "& td": {
    //         fontFamily: '"Inter", sans-serif',
    //         fontSize: "0.75rem",
    //         color: "#8B93A1", // Default cell data text color (Muted)
    //         borderBottom: "1px solid rgba(139, 147, 161, 0.08)",
    //         paddingY: "10px",
    //       },

    //       // Prevent column metrics jitter during loading values or number parsing
    //       '& td[data-numeric="true"], & td:has(span[class*="numeric"])': {
    //         fontFamily: '"JetBrains Mono", monospace',
    //         letterSpacing: "-0.02em",
    //       },

    //       // Modern operational row hovering transformations
    //       "&:hover": {
    //         backgroundColor: isEditing
    //           ? "rgba(99, 102, 241, 0.16)"
    //           : "#141922 !important",
    //         "& td": {
    //           color: "#F4F6F8", // Glow active text items on interaction ranges
    //         },
    //       },
    //     },
    //   };
    // },

    // // 5. Table Bottom Operational Summary Aggregator Footer
    // muiTableFooterRowProps: {
    //   sx: {
    //     backgroundColor: "#141922",
    //     borderTop: "1px solid rgba(139, 147, 161, 0.2)",
    //     boxShadow: "0px -4px 20px rgba(0, 0, 0, 0.4)",
    //     "& td": {
    //       fontFamily: '"Space Grotesk", sans-serif',
    //       fontWeight: "600",
    //       color: "#6366F1", // Highlight calculated totals using your primary Indigo accent
    //     },
    //   },
    // },

    // muiTopToolbarProps: {
    //   sx: () => ({
    //     backgroundColor: "#60a5fa",
    //     boxShadow: "0px 0px 20px rgba(0,0,0,.5)",
    //   }),
    // },

    // Cell styling
    // muiTableHeadCellProps: {
    //   sx: {
    //     fontSize: "0.8rem",
    //     fontWeight: "600",
    //     backgroundColor: "#fff",
    //     // color: "#42a5f5",
    //     color: "#000",
    //     boxShadow: "0 -5px 3px -3px black, 0 5px 3px -3px ",
    //   },
    // },

    // // table body
    // muiTableBodyProps: {
    //   sx: {
    //     fontSize: "0.5rem",
    //   },
    // },

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
    //       backgroundColor:
    //         table.getState().editingRow?.id === row.id ||
    //         table.getState().creatingRow
    //           ? "#fff"
    //           : "#000",
    //     },
    //   },
    // }),

    // muiTableBodyRowProps: ({ row, table }) => {
    //   const isEditing = table.getState().editingRow?.id === row.id;
    //   const isCreating = table.getState().creatingRow;
    //   const anyRowEditing = !!table.getState().editingRow;
    //   const isRowEven = Number(row?.id) % 2 === 0;

    //   return {
    //     hover: !anyRowEditing,
    //     sx: {
    //       // 1. Maintain strict focus isolation opacity mapping rules
    //       opacity: !anyRowEditing || isEditing || isCreating ? 1 : 0.4,
    //       transition: "all 0.15s ease-in-out",

    //       // 2. Active Editing Row VS Standard Alternating Blue Layers
    //       backgroundColor: isEditing
    //         ? "#FFFFFF !important" // Forces white canvas background during active edits
    //         : isRowEven
    //           ? "#4B9CD3 !important" // Target air force blue
    //           : "#7CB9E8 !important", // Target aero light blue

    //       // 3. Keep cell typography legible across varying dark and light states
    //       "& td": {
    //         color: isEditing ? "#000000 !important" : "#000000 !important",
    //         borderColor: "rgba(0, 0, 0, 0.1) !important",
    //       },

    //       // 4. Force action icons context to lock onto premium purple
    //       "& .MuiSvgIcon-root, & .MuiIconButton-root": {
    //         color: "#A855F7 !important",
    //       },

    //       // 5. Clean, high-contrast hover interactions
    //       "&:hover td": {
    //         borderTop: "1px solid #FFFFFF !important",
    //         borderBottom: "1px solid #FFFFFF !important",
    //         color: "#4B9CD3 !important",
    //         backgroundColor:
    //           isEditing || isCreating
    //             ? "#FFFFFF !important"
    //             : "#000000 !important",
    //         // Force hover icons to remain beautifully visible inside the dark background range
    //         "& .MuiSvgIcon-root, & .MuiIconButton-root": {
    //           color:
    //             isEditing || isCreating
    //               ? "#4169E1 !important"
    //               : "#4169E1 !important",
    //         },
    //       },
    //     },
    //   };
    // },

    // muiTableFooterRowProps: {
    //   sx: () => ({
    //     backgroundColor: "rgb(96 165 250)",
    //     boxShadow: "0px 0px 20px rgba(0,0,0,.5)",
    //     boder: "5px solid red",
    //   }),
    // },

    renderCaption: () => {
      return (isLoading && (
        <div className="text1-red-600 flex justify-center border1-2 border1-red-200 bg-red-50 w-[90%] m-auto h-auto align-middle rounded-md ">
          <div className="bg-gray-50 z-40 w-full h-full absolute top-5 left-10 opacity-90">
            <div className="w-[85%] h-[70%] border-2 border1-red-400 p-20  m-auto">
              {/* <HourglassFullOutlinedIcon /> */}
              {/* <PendingOutlinedIcon />
            <RefreshOutlinedIcon /> */}
            </div>
          </div>
        </div>
      )) ||
        (isUpdatingBank && (
          <div className="text-red-600 flex justify-center border-2 border-red-200 bg-red-50 w-[90%] m-auto h-auto align-middle rounded-md ">
            <div className="flex-col flex justify-center font-bold text-lg">
              <div>Updating Supplier.....</div>
            </div>
          </div>
        )) ||
        (isCreatingBank && (
          <div className="text-red-600 flex justify-center border-2 border-red-200 bg-red-50 w-[90%] m-auto h-auto align-middle rounded-md ">
            <div className="flex-col flex justify-center font-bold text-lg">
              <div>Creating new Supplier....</div>
            </div>
          </div>
        )) ||
        (isDeletingBank && (
          <div className="text-red-600 flex justify-center border-2 border-red-200 bg-red-50 w-[90%] m-auto h-auto align-middle rounded-md ">
            <div className="flex-col flex justify-center">
              <div>Deleting Supplier.....</div>
            </div>
          </div>
        )) ||
        validationErrors ? (
        <div className="text-red-600 flex justify-center border1-2 border1-red-200 bg1-red-300 w-[90%] m-auto h-auto align-middle rounded1-md ">
          <div className="flex-col flex justify-center">
            <div>
              {validationErrors.name
                ? validationErrors.name
                : validationErrors.code
                  ? validationErrors.code
                  : validationErrors?.countryCode}
            </div>
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
        New Bank
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

export default BankTable;
