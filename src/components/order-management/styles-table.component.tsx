import React, { useMemo } from "react";
import {
  useCreateStyleMutation,
  useDeleteStyleMutation,
  useUpdateStyleMutation,
} from "../../tanstack-hooks/custom-hooks";

import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_Row,
  type MRT_TableOptions,
} from "material-react-table";
import { Box, Button, darken, IconButton, Tooltip } from "@mui/material";
import type { PaginationData } from "../../interfaces/definitions";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";

import type { Style } from "../../interfaces/OrderManagement/Style";
// import { isAfter, isValid, parseISO } from "date-fns";
import type {
  DeleteStylePayload,
  UpdateStylePayload,
} from "../../tanstack-hooks/interfaces";

import GridOnIcon from "@mui/icons-material/GridOn"; // Clear spreadsheet matrix layout icon

interface Props {
  columns: MRT_ColumnDef<Style>[];
  data: Style[];
  itemsCount: number;
  isError: boolean;
  isLoading: boolean;
  paginate: PaginationData;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
  buyerCode: number;
  order: string;
  mainOrderUnit: string;
  setUnit?: React.Dispatch<React.SetStateAction<string>>;
  setTotal?: React.Dispatch<React.SetStateAction<number>>;
  // ✅ ADD THESE TWO TO YOUR INCOMING PROPS DESTRUCTURING:
  validationErrors: Record<string, string | undefined>;
  setValidationErrors: React.Dispatch<
    React.SetStateAction<Record<string, string | undefined>>
  >;
  onSelectStyleForBreakdown: (style: Style) => void;
  activeSelectedStyle: Style | null;
}

const StyleTable = ({
  columns,
  data,
  itemsCount,
  isError,
  pagination,
  setPagination,
  // mainOrderUnit,
  buyerCode,
  order,
  // ✅ ADD THESE TWO TO YOUR INCOMING PROPS DESTRUCTURING:
  // validationErrors,
  setValidationErrors,
  onSelectStyleForBreakdown,
  activeSelectedStyle,
}: Props) => {
  // 1. Ensure validationErrors is initialized cleanly as an empty object
  // const [validationErrors, setValidationErrors] = useState<
  //   Record<string, string | undefined>
  // >({});

  // const validationRequired = (value: any) =>
  //   !value || !String(value).trim().length;
  // const validationRequiredForUnitPrice = (value: any) =>
  //   !value || Number(value) <= 0;
  // const validationRequiredForQuantity = (value: any) =>
  //   !value || Number(value) <= 0;
  // const validationRequiredForGarmentType = (value: any) =>
  //   !value || Number(value) <= 0;

  // // 2. Clear, explicit validation mapping matching accessorKeys perfectly
  // const validateStyle = (values: any) => {
  //   return {
  //     typeCode: validationRequiredForGarmentType(values.typeCode)
  //       ? "Type required"
  //       : undefined,
  //     styleCode: validationRequired(values.styleCode)
  //       ? "Style required"
  //       : undefined,
  //     unit: validationRequired(values.unit) ? "Unit required" : undefined,
  //     quantity: validationRequiredForQuantity(values.quantity)
  //       ? "Quantity must be > 0"
  //       : undefined,
  //     unitPrice: validationRequiredForUnitPrice(values.unitPrice)
  //       ? "Unit Price must be > 0"
  //       : undefined,
  //   };
  // };

  // 1. Explicitly typed helper utility checkers
  const validationRequired = (value: string | null | undefined): boolean =>
    !value || !value.trim().length;

  const validationRequiredForUnitPrice = (
    value: number | null | undefined,
  ): boolean =>
    value === null ||
    value === undefined ||
    isNaN(Number(value)) ||
    Number(value) <= 0;

  const validationRequiredForQuantity = (
    value: number | null | undefined,
  ): boolean =>
    value === null ||
    value === undefined ||
    isNaN(Number(value)) ||
    Number(value) <= 0;

  const validationRequiredForGarmentType = (
    value: number | null | undefined,
  ): boolean =>
    value === null ||
    value === undefined ||
    isNaN(Number(value)) ||
    Number(value) <= 0;

  // 2. Clear, type-safe validation schema mapper using your existing Style interface
  const validateStyle = (values: Partial<Style>) => {
    return {
      typeCode: validationRequiredForGarmentType(values.typeCode)
        ? "Type required"
        : undefined,
      styleCode: validationRequired(values.styleCode)
        ? "Style required"
        : undefined,
      unit: validationRequired(values.unit) ? "Unit required" : undefined,
      quantity: validationRequiredForQuantity(values.quantity)
        ? "Quantity must be > 0"
        : undefined,
      unitPrice: validationRequiredForUnitPrice(values.unitPrice)
        ? "Unit Price must be > 0"
        : undefined,
    };
  };

  const { mutateAsync: createStyle } = useCreateStyleMutation();
  const { mutateAsync: updateStyle } = useUpdateStyleMutation();

  const { mutateAsync: deleteStyle } = useDeleteStyleMutation();

  // 🚀 CREATE ROW SAVE HANDLER
  const handleCreateStyle: MRT_TableOptions<Style>["onCreatingRowSave"] =
    async ({ values, table }) => {
      console.log("Create Save Clicked. Values payload:", values);

      const newValidationErrors = validateStyle(values);

      // Check if any error strings exist in our cleanly mapped keys
      if (
        Object.values(newValidationErrors).some((error) => error !== undefined)
      ) {
        setValidationErrors(newValidationErrors);
        return; // 🛑 Stops submission and triggers layout re-render
      }

      try {
        setValidationErrors({});
        const payload = {
          ...values,
          id: 0,
          buyerCode: buyerCode,
          order: order,
          approvedDate: null,
          productionEndDate: null,
          estimateApprovalDate: null,
        };

        console.log("create.", payload);
        await createStyle(payload);
        table.setCreatingRow(null); // Exit row creation mode cleanly
        console.log("Successfully created new style row record.");
      } catch (error) {
        console.error("Backend creation mutation failed:", error);
      }
    };

  // 🚀 EDIT ROW SAVE HANDLER
  const handleSaveStyle: MRT_TableOptions<Style>["onEditingRowSave"] = async ({
    values,
    table,
    row,
  }) => {
    console.log("Edit Save Clicked. Updated values:", values);

    const newValidationErrors = validateStyle(values);
    if (
      Object.values(newValidationErrors).some((error) => error !== undefined)
    ) {
      console.warn(
        "Validation failed! Halting save operation:",
        newValidationErrors,
      );
      setValidationErrors(newValidationErrors);
      return;
    }

    try {
      setValidationErrors({});
      // Keep the existing primary database key ID intact
      const payload = { ...values, id: row.original.id };

      const updateStylePayload: UpdateStylePayload = {
        styleCode: payload.styleCode,
        styleToUpdate: payload,
      };

      await updateStyle(updateStylePayload);
      table.setEditingRow(null); // Exit row editing mode cleanly
      console.log("Successfully updated style row record.");
    } catch (error) {
      console.error("Backend update mutation failed:", error);
    }
  };

  // DELETE action
  const openDeleteConfirmModal = async (row: MRT_Row<Style>) => {
    if (window.confirm("Are you sure you want to delete this Style?")) {
      // Pass the row id or target code safely to your hook execution block
      const deleteStylePayload: DeleteStylePayload = {
        styleCode: row.original.styleCode,
      };
      await deleteStyle(deleteStylePayload);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: data,

    // 1. ADD THIS STATE BLOCK: Force Material React Table to track your selection natively!
    // state: {
    //   pagination: pagination,
    //   showAlertBanner: isError,
    //   // Dynamically flags the row index as selected if it matches the parent's active scope code
    //   rowSelection: useMemo(() => {
    //     if (!activeSelectedStyle?.styleCode) return {};

    //     // Find the index of the row matching our active style code string
    //     const matchingIndex = data.findIndex(
    //       (item: any) =>
    //         String(item?.styleCode).trim().toUpperCase() ===
    //         String(activeSelectedStyle.styleCode).trim().toUpperCase(),
    //     );

    //     // Return a keyed selection map (e.g., { "0": true }) to force the grid to select it natively
    //     return matchingIndex !== -1 ? { [String(matchingIndex)]: true } : {};
    //   }, [data, activeSelectedStyle]),
    // },

    // 🚀 THE CRITICAL FIX: Explicitly bind your initial pagination keys here!
    initialState: {
      density: "compact",
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    },

    // 🚀 UPDATED STATE CONFIGURATION:
    state: {
      pagination: pagination,
      showAlertBanner: isError,
    },

    // Display mode configuration
    createDisplayMode: "row",
    editDisplayMode: "row",

    enableExpandAll: false,

    // Pagination configuration
    rowCount: itemsCount,
    manualPagination: true,
    paginationDisplayMode: "pages",
    muiPaginationProps: {
      color: "secondary",
      // rowsPerPageOptions:,
      shape: "rounded",
      variant: "outlined",
    },
    onPaginationChange: setPagination,

    enableEditing: true,
    enableRowActions: true,

    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateStyle,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveStyle,

    muiExpandButtonProps: ({ row, table }) => ({
      onClick: () => table.setExpanded({ [row.id]: !row.getIsExpanded() }),
    }),

    muiTopToolbarProps: {
      sx: () => ({
        backgroundColor: "rgb(96 165 250)",
        boxShadow: "0px 0px 20px rgba(0,0,0,.5)",
      }),
    },

    // Head Cell styling
    muiTableHeadCellProps: {
      sx: {
        fontSize: "0.8rem",
        fontWeight: "600",
        backgroundColor: "#fff",
        color: "#000",
        boxShadow: "0 -5px 3px -3px black, 0 5px 3px -3px ",
      },
    },

    // Table body text base sizes
    muiTableBodyRowProps: ({ row, table }) => {
      const currentStyleRow = row.original as Style;

      // 1. Strict, case-insensitive string comparison using your confirmed JSON property 'styleCode'
      const isCurrentlyActiveRow =
        activeSelectedStyle !== null &&
        activeSelectedStyle !== undefined &&
        String(activeSelectedStyle.styleCode).trim().toUpperCase() ===
          String(currentStyleRow.styleCode).trim().toUpperCase();

      const isEvenRow = row.index % 2 === 0;
      const isEditingThisRow = table.getState().editingRow?.id === row.id;

      return {
        hover: !table.getState().editingRow,
        sx: {
          opacity:
            !table.getState().editingRow ||
            isEditingThisRow ||
            table.getState().creatingRow
              ? 1
              : 0.4,

          // 🚀 THE FINISHING TOUCH: Soft corporate blue highlight if selected, otherwise standard zebra striping!
          backgroundColor: isCurrentlyActiveRow
            ? "#e8eaf6 !important"
            : isEvenRow || isEditingThisRow
              ? "#4B9CD3 !important"
              : "#7CB9E8 !important",

          // Draw an elegant deep indigo left anchor border to make the highlighted selection stand out!
          borderLeft: isCurrentlyActiveRow
            ? "6px solid #1a237e !important"
            : "none",

          "& td": {
            // Apply bold text weights and navy coloring across all columns on the highlighted selection row
            fontWeight: isCurrentlyActiveRow ? "bold !important" : "inherit",
            color: isCurrentlyActiveRow ? "#1a237e !important" : "inherit",
          },

          "&:hover td": {
            borderTop: "1px solid #fff",
            borderBottom: "1px solid #fff",
            color: "#4B9CD3",
            backgroundColor: isCurrentlyActiveRow
              ? "#e8eaf6 !important"
              : isEditingThisRow || table.getState().creatingRow
                ? "#fff"
                : "#000",
          },
        },
      };
    },

    // muiTableBodyRowProps: ({ row, table }) => {
    //   const currentStyleRow = row.original as Style;

    //   // 1. Extract the active style code value accounting safely for either camelCase or PascalCase properties
    //   const activeCode =
    //     activeSelectedStyle?.styleCode ||
    //     (activeSelectedStyle as unknown as { StyleCode?: string })?.StyleCode;
    //   const currentRowCode =
    //     currentStyleRow?.styleCode ||
    //     (currentStyleRow as unknown as { StyleCode?: string })?.StyleCode;

    //   // 2. THE PERMANENT FIX: Normalise both codes to uppercase strings to ensure a perfect match,
    //   // bringing back your corporate blue row background highlight instantly!
    //   const isCurrentlyActiveRow =
    //     activeCode !== undefined &&
    //     currentRowCode !== undefined &&
    //     activeCode.trim().toUpperCase() === currentRowCode.trim().toUpperCase();

    //   return {
    //     hover: !table.getState().editingRow,
    //     sx: {
    //       opacity:
    //         !table.getState().editingRow ||
    //         table.getState().editingRow?.id === row.id ||
    //         table.getState().creatingRow
    //           ? 1
    //           : 0.4,

    //       backgroundColor: isCurrentlyActiveRow
    //         ? "#e8eaf6 !important"
    //         : Number(row?.id) % 2 === 0 ||
    //             table.getState().editingRow?.id === row.id
    //           ? darken("#4B9CD3", 0)
    //           : darken("#7CB9E8", 0),

    //       borderLeft: isCurrentlyActiveRow
    //         ? "5px solid #1a237e !important"
    //         : "none",

    //       "& td": {
    //         fontWeight: isCurrentlyActiveRow ? "bold !important" : "inherit",
    //       },

    //       "&:hover td": {
    //         borderTop: "1px solid #fff",
    //         borderBottom: "1px solid #fff",
    //         color: "#4B9CD3",
    //         backgroundColor: isCurrentlyActiveRow
    //           ? "#e8eaf6 !important"
    //           : table.getState().editingRow?.id === row.id ||
    //               table.getState().creatingRow
    //             ? "#fff"
    //             : "#000",
    //       },
    //     },
    //   };
    // },
    // muiTableBodyRowProps: ({ row, table }) => {
    //   const currentStyleRow = row.original as Style;

    //   // THE DEFINITIVE FIX: Uses optional chaining (?.) to handle null values safely on mount,
    //   // completely removing the "undefined (reading 'styleCode')" crash and the "as any" text!
    //   const isCurrentlyActiveRow =
    //     activeSelectedStyle?.styleCode === currentStyleRow?.styleCode;

    //   return {
    //     hover: !table.getState().editingRow,
    //     sx: {
    //       opacity:
    //         !table.getState().editingRow ||
    //         table.getState().editingRow?.id === row.id ||
    //         table.getState().creatingRow
    //           ? 1
    //           : 0.4,

    //       // Apply your corporate blue highlight if selected, otherwise use standard zebra striping
    //       backgroundColor: isCurrentlyActiveRow
    //         ? "#e8eaf6 !important"
    //         : Number(row?.id) % 2 === 0 ||
    //             table.getState().editingRow?.id === row.id
    //           ? darken("#4B9CD3", 0)
    //           : darken("#7CB9E8", 0),

    //       borderLeft: isCurrentlyActiveRow
    //         ? "5px solid #1a237e !important"
    //         : "none",

    //       "& td": {
    //         fontWeight: isCurrentlyActiveRow ? "bold !important" : "inherit",
    //       },

    //       "&:hover td": {
    //         borderTop: "1px solid #fff",
    //         borderBottom: "1px solid #fff",
    //         color: "#4B9CD3",
    //         backgroundColor: isCurrentlyActiveRow
    //           ? "#e8eaf6 !important"
    //           : table.getState().editingRow?.id === row.id ||
    //               table.getState().creatingRow
    //             ? "#fff"
    //             : "#000",
    //       },
    //     },
    //   };
    // },

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
        New Style
      </Button>
    ),

    // --------------------------------------------------------------------------------------
    // 🛠️ FIXED ACTION PANEL ROW BUTTON CLOSURES (DESTRUCTURED BOTH row AND table CLEANLY!)
    // --------------------------------------------------------------------------------------
    renderRowActions: ({ row, table }) => (
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
        <Tooltip title="Configure Colour & Size Matrix Allocation Breakdown">
          <IconButton
            color="primary"
            onClick={() => {
              const selectedStyleRow = row.original;
              console.log(
                "Loading Breakdown context for:",
                selectedStyleRow.styleCode,
              );

              // Fire the callback function to lift the row state up to OrderMain cleanly!
              onSelectStyleForBreakdown(selectedStyleRow);
            }}
          >
            <GridOnIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  });

  //  CRUD Operations

  // const table = useMaterialReactTable({
  //   columns,
  //   data: data,

  //   // 🚀 THE CRITICAL FIX: Explicitly bind your initial pagination keys here!
  //   initialState: {
  //     density: "compact",
  //     pagination: {
  //       pageIndex: pagination.pageIndex,
  //       pageSize: pagination.pageSize,
  //     },
  //   },

  //   // 🚀 UPDATED STATE CONFIGURATION:
  //   state: {
  //     pagination: pagination,
  //     showAlertBanner: isError,
  //   },

  //   // Display mode configuration
  //   createDisplayMode: "row",
  //   editDisplayMode: "row",

  //   enableExpandAll: false,

  //   // pagination
  //   // Pagination configuration
  //   rowCount: itemsCount,
  //   manualPagination: true,
  //   paginationDisplayMode: "pages",
  //   muiPaginationProps: {
  //     color: "secondary",
  //     rowsPerPageOptions: [5, 10, 20],
  //     shape: "rounded",
  //     variant: "outlined",
  //   },
  //   onPaginationChange: setPagination,

  //   enableEditing: true,
  //   enableRowActions: true,

  //   onCreatingRowCancel: () => setValidationErrors({}),
  //   onCreatingRowSave: handleCreateStyle,
  //   onEditingRowCancel: () => setValidationErrors({}),
  //   onEditingRowSave: handleSaveStyle,

  //   muiExpandButtonProps: ({ row, table }) => ({
  //     onClick: () => table.setExpanded({ [row.id]: !row.getIsExpanded() }),
  //   }),

  //   muiTopToolbarProps: {
  //     sx: () => ({
  //       backgroundColor: "rgb(96 165 250)",
  //       boxShadow: "0px 0px 20px rgba(0,0,0,.5)",
  //     }),
  //   },

  //   // Cell styling
  //   muiTableHeadCellProps: {
  //     sx: {
  //       fontSize: "0.8rem",
  //       fontWeight: "600",
  //       backgroundColor: "#fff",
  //       // color: "#42a5f5",
  //       color: "#000",
  //       boxShadow: "0 -5px 3px -3px black, 0 5px 3px -3px ",
  //     },
  //   },

  //   // table body
  //   muiTableBodyProps: {
  //     sx: {
  //       fontSize: "0.5rem",
  //     },
  //   },

  //   muiTableBodyRowProps: ({ row, table }) => ({

  //     hover: !table.getState().editingRow,
  //     sx: {
  //       opacity:
  //         !table.getState().editingRow ||
  //         table.getState().editingRow?.id === row.id ||
  //         table.getState().creatingRow
  //           ? 1
  //           : 0.4,
  //       backgroundColor:
  //         Number(row?.id) % 2 === 0 ||
  //         table.getState().editingRow?.id === row.id
  //           ? darken("#4B9CD3", 0)
  //           : darken("#7CB9E8", 0),
  //       "&:hover td": {
  //         borderTop: "1px solid #fff",
  //         borderBottom: "1px solid #fff",
  //         color: "#4B9CD3",
  //         backgroundColor:
  //           table.getState().editingRow?.id === row.id ||
  //           table.getState().creatingRow
  //             ? "#fff"
  //             : "#000",
  //       },
  //     },
  //   }),

  //   muiTableFooterRowProps: {
  //     sx: () => ({
  //       backgroundColor: "rgb(96 165 250)",
  //       boxShadow: "0px 0px 20px rgba(0,0,0,.5)",
  //       boder: "5px solid red",
  //     }),
  //   },

  //   renderTopToolbarCustomActions: ({ table }) => (
  //     <Button
  //       variant="contained"
  //       onClick={() => {
  //         table.setCreatingRow(true);
  //       }}
  //     >
  //       New Style
  //     </Button>
  //   ),

  //   renderRowActions: ({ row }) => (
  //     <Box sx={{ display: "flex", gap: "1rem" }}>
  //       <Tooltip title="Edit">
  //         <IconButton onClick={() => table.setEditingRow(row)}>
  //           <ModeEditOutlinedIcon />
  //         </IconButton>
  //       </Tooltip>
  //       <Tooltip title="Delete">
  //         <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
  //           <DeleteForeverOutlinedIcon className="flex w-full justify-start h-5 w1-5 border1-4 border1-yellow-300" />
  //         </IconButton>
  //       </Tooltip>
  //       <Tooltip title="Configure Colour & Size Matrix Allocation Breakdown">
  //         <IconButton
  //           color="primary"
  //           onClick={() => {
  //             const selectedStyleRow = row.original; // Captures your C# model properties directly

  //             // Execute your application's state setter to load Tab 2
  //             // passing across buyerCode, order, typeCode, and styleCode
  //             console.log(
  //               "Loading Breakdown context for:",
  //               selectedStyleRow.styleCode,
  //             );

  //             // Trigger your parent workspace tab state change function to switch indices
  //             // e.g., setActiveTab(2);

  //             // 2. Fire the callback function to lift the row state up to OrderMain
  //             onSelectStyleForBreakdown(selectedStyleRow);
  //           }}
  //         >
  //           <GridOnIcon />
  //         </IconButton>
  //       </Tooltip>
  //     </Box>
  //   ),
  // });

  return <MaterialReactTable table={table} />;
};

export default StyleTable;
