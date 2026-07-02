import { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import type { OrderItemServiceModel } from "./material-consumption.types"; // Adjust this relative path if needed

// 1. FIXED: Update the props interface signature to accept the data array from the parent shell wrapper
interface MaterialMasterListProps {
  materialsList: OrderItemServiceModel[];
  isLoading: boolean;
  onSelectMaterial: (material: OrderItemServiceModel) => void;
}

export default function MaterialMasterList({
  materialsList,
  isLoading,
  onSelectMaterial,
}: MaterialMasterListProps) {
  // 2. Define the visible structural columns blueprint for MRT (Memoised for speed)
  const columns = useMemo<MRT_ColumnDef<OrderItemServiceModel>[]>(
    () => [
      {
        accessorKey: "stockCode",
        header: "Stock",
        size: 70,
        muiTableBodyCellProps: {
          sx: { fontFamily: "monospace", color: "#455a64" },
        },
      },
      {
        accessorKey: "itemCode",
        header: "Item",
        size: 90,
        muiTableBodyCellProps: {
          sx: { fontFamily: "monospace", color: "#1a237e", fontWeight: "bold" },
        },
      },
      {
        accessorKey: "description",
        header: "Material Name / Description",
        size: 200,
      },
    ],
    [],
  );

  // 3. Configure Material React Table engine settings matching your design pattern
  const table = useMaterialReactTable({
    columns,
    data: materialsList, // FIXED: Binds straight to the array prop passed down by the parent dashboard hook
    state: { isLoading }, // Directly shows the table spinner while the parent RTK Query is active
    enablePagination: false, // Maintain continuous high-speed vertical list viewing
    enableRowSelection: false,
    enableColumnActions: false,
    enableSorting: true,
    enableTopToolbar: true,
    enableBottomToolbar: false,
    initialState: { density: "compact" }, // Maximise space density for corporate operators

    // Custom row attribute click configuration to trigger Selection Change instantly
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => {
        // Execute the parent pass-up callback passing across the precise selected record row dictionary
        onSelectMaterial(row.original);
      },
      sx: {
        cursor: "pointer", // Give immediate spreadsheet hover cursor response
        "&:hover": {
          backgroundColor: "#e8eaf6 !important", // Dynamic row selection highlight
        },
      },
    }),
  });

  return <MaterialReactTable table={table} />;
}

// import React, { useMemo } from "react";

// import { Box, CircularProgress, Alert } from "@mui/material";

// import {
//   MaterialReactTable,
//   useMaterialReactTable,
//   type MRT_ColumnDef,
// } from "material-react-table";

// // 1. Import your strict structural API model data contract from your central services
// import { useGetAvailableMaterialsQuery } from "../../services/material-consumption.services";
// import type { OrderItemServiceModel } from "./material-consumption.types";

// interface MaterialMasterListProps {
//   // Callback function to pass the selected item row back up to the master wrapper
//   onSelectMaterial: (material: OrderItemServiceModel) => void;
// }

// export default function MaterialMasterList({
//   onSelectMaterial,
// }: MaterialMasterListProps) {
//   // 2. Declarative Fetch: Fire the live RTK-Query hook directly
//   const {
//     data: materialsData = [],
//     isLoading,
//     error,
//   } = useGetAvailableMaterialsQuery();

//   // 3. Define the visible structural columns blueprint for MRT (Memoised for speed)
//   const columns = useMemo<MRT_ColumnDef<OrderItemServiceModel>[]>(
//     () => [
//       {
//         accessorKey: "stockCode",
//         header: "Stock",
//         size: 70,
//         muiTableBodyCellProps: {
//           sx: { fontFamily: "monospace", color: "#455a64" },
//         },
//       },
//       {
//         accessorKey: "itemCode",
//         header: "Item",
//         size: 90,
//         muiTableBodyCellProps: {
//           sx: { fontFamily: "monospace", color: "#1a237e", fontWeight: "bold" },
//         },
//       },
//       {
//         accessorKey: "description",
//         header: "Material Name / Description",
//         size: 200,
//       },
//     ],
//     [],
//   );

//   // 4. Configure Material React Table engine settings matching your design pattern
//   const table = useMaterialReactTable({
//     columns,
//     data: materialsData, // Binds straight to the array returned by your C# controller
//     state: { isLoading },
//     enablePagination: false, // Maintain continuous high-speed vertical list viewing
//     enableRowSelection: false,
//     enableColumnActions: false,
//     enableSorting: true,
//     enableTopToolbar: true,
//     enableBottomToolbar: false,
//     initialState: { density: "compact" }, // Maximise space density for corporate operators

//     // Custom row attribute click configuration to trigger Selection Change instantly
//     muiTableBodyRowProps: ({ row }) => ({
//       onClick: () => {
//         // Execute the parent pass-up callback passing across the precise selected record row dictionary
//         onSelectMaterial(row.original);
//       },
//       sx: {
//         cursor: "pointer", // Give immediate spreadsheet hover cursor response
//         "&:hover": {
//           backgroundColor: "#e8eaf6 !important", // Dynamic row selection highlight
//         },
//       },
//     }),
//   });

//   // --- Render Conditional States Layout ---
//   if (isLoading) {
//     return (
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           paddingTop: 4,
//           minHeight: "200px",
//         }}
//       >
//         <CircularProgress size={30} sx={{ mr: 2 }} />
//         <span>Syncing material definitions...</span>
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Alert severity="error" sx={{ mt: 2, fontWeight: "bold" }}>
//         Failed to load materials inventory list from SQL Server. Verify your
//         database connection strings.
//       </Alert>
//     );
//   }

//   return <MaterialReactTable table={table} />;
// }

// import { useEffect, useMemo, useState } from "react";
// import {
//   MaterialReactTable,
//   useMaterialReactTable,
//   type MRT_ColumnDef,
// } from "material-react-table";
// import { Box, CircularProgress, Alert } from "@mui/material";

// // Local structural typing interface matching your OrderItemServiceModel API layout contract
// export interface OrderItemLookupRow {
//   stockCode: string;
//   itemCode: string;
//   description: string;
// }

// interface MaterialMasterListProps {
//   // Callback function to communicate back to the parent shell that an item was clicked
//   onSelectMaterial: (material: OrderItemLookupRow) => void;
// }

// const MaterialMasterList = ({ onSelectMaterial }: MaterialMasterListProps) => {
//   const [data, setData] = useState<OrderItemLookupRow[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);

//   // 1. Fetch available baseline production materials from C# SQL Server API pipeline
//   useEffect(() => {
//     const fetchMaterialChecklist = async () => {
//       try {
//         setLoading(true);

//         // Target endpoint matching your exposed Web API controller route
//         const response = await fetch("/api/materialConsumption/items-lookup");

//         if (!response.ok) {
//           throw new Error(
//             `Server Error Code: ${response.status} - Unable to fetch material items.`,
//           );
//         }

//         const payloadData = await response.json();
//         setData(payloadData);
//         setErrorMessage(null);
//       } catch (error: any) {
//         console.error("API Fetch Failure inside MaterialMasterList:", error);
//         setErrorMessage(
//           error.message || "Failed to load materials inventory list.",
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMaterialChecklist();
//   }, []);

//   // 2. Define the visible structural columns blueprint for MRT (Memoised for speed)
//   const columns = useMemo<MRT_ColumnDef<OrderItemLookupRow>[]>(
//     () => [
//       {
//         accessorKey: "stockCode",
//         header: "Stock",
//         size: 70,
//         muiTableBodyCellProps: {
//           sx: { fontFamily: "monospace", color: "#455a64" },
//         },
//       },
//       {
//         accessorKey: "itemCode",
//         header: "Item",
//         size: 90,
//         muiTableBodyCellProps: {
//           sx: { fontFamily: "monospace", color: "#1a237e", fontWeight: "bold" },
//         },
//       },
//       {
//         accessorKey: "description",
//         header: "Material Name / Description",
//         size: 200,
//       },
//     ],
//     [],
//   );

//   // 3. Configure Material React Table engine settings matching your design pattern
//   const table = useMaterialReactTable({
//     columns,
//     data,
//     enablePagination: false, // Maintain continuous high-speed vertical list viewing
//     enableRowSelection: false,
//     enableColumnActions: false,
//     enableSorting: true,
//     enableTopToolbar: true,
//     enableBottomToolbar: false,
//     initialState: { density: "compact" }, // Maximise space density for corporate operators

//     // Custom row attribute click configuration to trigger Selection Change instantly
//     muiTableBodyRowProps: ({ row }) => ({
//       onClick: () => {
//         // Execute the parent pass-up callback passing across the precise selected record row dictionary
//         onSelectMaterial(row.original);
//       },
//       sx: {
//         cursor: "pointer", // Give immediate spreadsheet hover cursor response
//         "&:hover": {
//           backgroundColor: "#e8eaf6 !important", // Dynamic row selection highlight
//         },
//       },
//     }),
//   });

//   // --- Render Conditional States Layout ---
//   if (loading) {
//     return (
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           paddingTop: 4,
//           minHeight: "200px",
//         }}
//       >
//         <CircularProgress size={30} sx={{ mr: 2 }} />
//         <span>Syncing inventory definitions...</span>
//       </Box>
//     );
//   }

//   if (errorMessage) {
//     return (
//       <Alert severity="error" sx={{ mt: 2, fontWeight: "bold" }}>
//         {errorMessage}
//       </Alert>
//     );
//   }

//   return <MaterialReactTable table={table} />;
// };

// export default MaterialMasterList;
