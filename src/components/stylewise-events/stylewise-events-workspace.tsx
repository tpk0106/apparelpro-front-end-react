import { useState } from "react";
import { Box, Paper, Typography, Alert } from "@mui/material";
import StylewiseEventsHeader from "./stylewise-events-header";
import StylewiseEventsGrid from "././stylewise-events-grid";
import { useGetStylewiseEventsChecklistQuery } from "../../services/stylewise-event.services";
import type { SelectedHeaderContext } from "../stylewise-events/stylewise-events.types";
import StylewiseEventsApprovalCard from "./stylewise-events-approval-card";

// Import your live query hook cleanly from your active Redux slice service
// import { useGetStylewiseEventsChecklistQuery } from "../../services/stylewiseEventApi";

export default function StylewiseEventsWorkspace() {
  // 1. Maintain a single unified scope state to track header verification parameters
  const [scopeContext, setScopeContext] =
    useState<SelectedHeaderContext | null>(null);

  // 2. Un-skips and streams active tracking records from the EventMasters table automatically

  // Re-fetch automatically fires and returns the response envelope when keys settle
  const { data: serverResponse, isFetching } =
    useGetStylewiseEventsChecklistQuery(
      {
        buyerCode: scopeContext?.buyerCode || 0,
        order: scopeContext?.order || "",
        typeCode: scopeContext?.typeCode || 0,
        styleCode: scopeContext?.styleCode || "",
      },
      { skip: !scopeContext },
    );
  // const { data: milestoneRows = [], isFetching } =
  //   useGetStylewiseEventsChecklistQuery(
  //     {
  //       buyerCode: scopeContext?.buyerCode || 0,
  //       order: scopeContext?.order || "",
  //       typeCode: scopeContext?.typeCode || 0,
  //       styleCode: scopeContext?.styleCode || "",
  //     },
  //     { skip: !scopeContext }, // Keeps the network line quiet until a style row context settles
  //   );

  // REMOVED: Old 'handleSaveInlineModification' and 'handleCreateCustomMilestone' blocks
  // to instantly fix the unused variable compiler crashes!

  // 2. LIVE CREDENTIAL EXTRACTOR LOOP: Pull the identity values directly out of browser memory keys
  const loggedInUserId = localStorage.getItem("userId") || "UNKNOWN_UID";
  const loggedInUserName = localStorage.getItem("user") || "Guest Operator";

  return (
    <Box sx={{ width: "100%", p: 1 }}>
      {/* Module Title Accent Header Bar */}
      <Typography
        variant="h5"
        sx={{ fontWeight: "bold", color: "#1a237e", mb: 2 }}
      >
        Style-Wise Production Critical Path Milestones
      </Typography>

      {/* 3. Mount the unified 4-column filter selection card panel */}
      <StylewiseEventsHeader onContextLock={(ctx) => setScopeContext(ctx)} />

      {/* 4. DYNAMIC WORKSPACE PANEL SWITCHER */}
      {scopeContext && serverResponse ? (
        <Paper elevation={3} sx={{ p: 3, borderTop: "4px solid #1a237e" }}>
          {/* 1. PASS REAL SERVER RECOGNITION FIELDS STRAIGHT DOWN */}
          <StylewiseEventsApprovalCard
            buyerCode={scopeContext.buyerCode}
            order={scopeContext.order}
            typeCode={scopeContext.typeCode}
            styleCode={scopeContext.styleCode}
            eventsData={serverResponse}
            currentUserId={loggedInUserId}
            currentUserName={loggedInUserName}
          />

          <Box
            sx={{
              mb: 2,
              mt: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: "bold",
                color: "#1a237e",
                textTransform: "uppercase",
              }}
            >
              Active Milestones Operations Spreadsheet Tracker
            </Typography>
          </Box>

          <StylewiseEventsGrid
            buyerCode={scopeContext.buyerCode}
            order={scopeContext.order}
            typeCode={scopeContext.typeCode}
            styleCode={scopeContext.styleCode}
            eventsData={serverResponse} // Passes the rows array safely
            isLoading={isFetching}
          />
        </Paper>
      ) : (
        /* Default Empty Fallback Informational Banner Container */
        <Alert
          severity="info"
          variant="outlined"
          sx={{
            mt: 2,
            fontWeight: "bold",
            borderLeft: "4px solid #0288d1",
            backgroundColor: "#fafafa",
          }}
        >
          Please select a valid Buyer, Purchase Order Contract, Garment Type,
          and Target Style profile in the header selector to map milestones.
        </Alert>
      )}
    </Box>
  );
}

// import React, { useState, useMemo, SyntheticEvent } from "react";
// import {
//   Box,
//   Card,
//   Paper,
//   Typography,
//   TextField,
//   Button,
//   Alert,
//   CircularProgress,
//   Tooltip,
//   IconButton,
// } from "@mui/material";
// import Autocomplete from "@mui/material/Autocomplete";
// import Grid from "@mui/material/Grid";
// import MaterialReactTable, {
//   useMaterialReactTable,
//   type MRT_ColumnDef,
// } from "material-react-table";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
// import AddCircleIcon from "@mui/icons-material/AddCircle";
// import SaveIcon from "@mui/icons-material/Save";

// // Import your live master cascades directly from your material consumption services slice
// import {
//   useGetBuyersPagedQuery,
//   useGetOrdersByBuyerQuery,
//   useGetAllGarmentTypesQuery,
//   useGetStylesByScopeQuery,
//   Buyer,
//   GarmentTypeServiceModel,
// } from "../../services/material-consumption.services";
// import { Style } from "../order-management/style.model";

// // Import your newly created critical path milestone query mutations and types
// import {
//   useGetStylewiseEventsChecklistQuery,
//   useUpdateStylewiseEventLineMutation,
//   useAddCustomStylewiseEventLineMutation,
//   useDeleteStylewiseEventLineMutation,
// } from "../../services/stylewiseEventApi";
// import { StylewiseEventRow } from "./stylewise-events.types";
// import StylewiseEventsGrid from "./stylewise-events-grid";
// import StylewiseEventsHeader from "./stylewise-events-header";

// export default function StylewiseEventsWorkspace() {
//   // 1. Core Structural Dropdown Cascades States
//   const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
//   const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
//   const [selectedType, setSelectedType] =
//     useState<GarmentTypeServiceModel | null>(null);
//   const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);

//   // Active Highlighted Editing Milestone State
//   const [editingRow, setEditingRow] = useState<StylewiseEventRow | null>(null);
//   const [schedDateInput, setSchedDateInput] = useState<string>("");
//   const [actDateInput, setActDateInput] = useState<string>("");
//   const [remarksInput, setRemarksInput] = useState<string>("");

//   // Custom Manual Milestone Addition States
//   const [customEventCode, setCustomEventCode] = useState<string>("");
//   const [customRemarks, setCustomRemarks] = useState<string>("");

//   // 2. Fetch Master Layout Dropdown Options Caches
//   const { data: buyerPageData, isLoading: isBuyersLoading } =
//     useGetBuyersPagedQuery({
//       pageIndex: 0,
//       pageSize: 999,
//       sortColumn: "name",
//       sortOrder: "asc",
//       filterColumn: null,
//       filterQuery: null,
//     });
//   const buyersList = useMemo<Buyer[]>(
//     () => buyerPageData?.items || [],
//     [buyerPageData],
//   );

//   const { data: ordersList = [], isLoading: isOrdersLoading } =
//     useGetOrdersByBuyerQuery(selectedBuyer?.buyerCode ?? 0, {
//       skip: !selectedBuyer,
//     });

//   const { data: globalTypesList = [], isLoading: isTypesLoading } =
//     useGetAllGarmentTypesQuery();

//   const { data: stylesList = [], isLoading: isStylesLoading } =
//     useGetStylesByScopeQuery(
//       {
//         buyerCode: selectedBuyer?.buyerCode ?? 0,
//         order: selectedOrder ?? "",
//         typeCode: selectedType?.id ?? 0,
//       },
//       { skip: !selectedBuyer || !selectedOrder || !selectedType },
//     );

//   // 3. Central Stylewise Milestone Ledger Query Connections
//   const hasValidScopeKeys =
//     selectedBuyer && selectedOrder && selectedType && selectedStyle;

//   const { data: milestoneChecklist = [], isLoading: isChecklistLoading } =
//     useGetStylewiseEventsChecklistQuery(
//       {
//         buyerCode: selectedBuyer?.buyerCode || 0,
//         order: selectedOrder || "",
//         typeCode: selectedType?.id || 0,
//         styleCode: selectedStyle?.StyleCode || "",
//       },
//       { skip: !hasValidScopeKeys },
//     );

//   const [updateEventLine, { isLoading: isUpdatingLine }] =
//     useUpdateStylewiseEventLineMutation();
//   const [addCustomLine, { isLoading: isAddingCustom }] =
//     useAddCustomStylewiseEventLineMutation();
//   const [deleteEventLine] = useDeleteStylewiseEventLineMutation();

//   // --- EVENT HANDLERS & CALLBACK LOOPS ---

//   const handleSelectRowForEdit = (row: StylewiseEventRow) => {
//     setEditingRow(row);
//     setSchedDateInput(row.scheduledDate ? row.scheduledDate.split("T")[0] : "");
//     setActDateInput(row.actualDate ? row.actualDate.split("T")[0] : "");
//     setRemarksInput(row.remarks || "");
//   };

//   const handleSaveInlineModification = async () => {
//     if (!hasValidScopeKeys || !editingRow) return;
//     try {
//       await updateEventLine({
//         buyerCode: selectedBuyer.buyerCode,
//         order: selectedOrder,
//         typeCode: selectedType.id,
//         styleCode: selectedStyle.StyleCode,
//         eventCode: editingRow.eventCode,
//         scheduledDate: schedDateInput || null,
//         actualDate: actDateInput || null,
//         remarks: remarksInput.toUpperCase(),
//       }).unwrap();

//       alert("Milestone tracking metrics synchronized successfully!");
//       setEditingRow(null);
//     } catch (err: any) {
//       alert(err?.data?.Error || "Failed to update event line item.");
//     }
//   };

//   const handleCreateCustomMilestone = async () => {
//     if (!hasValidScopeKeys || !customEventCode) return;
//     try {
//       await addCustomLine({
//         buyerCode: selectedBuyer.buyerCode,
//         order: selectedOrder,
//         typeCode: selectedType.id,
//         styleCode: selectedStyle.StyleCode,
//         eventCode: customEventCode.toUpperCase().trim(),
//         scheduledDate: null,
//         actualDate: null,
//         remarks: customRemarks.toUpperCase().trim(),
//       }).unwrap();

//       alert("Custom milestone code appended cleanly into EventMasters!");
//       setCustomEventCode("");
//       setCustomRemarks("");
//     } catch (err: any) {
//       alert(err?.data?.Error || "Failed to append custom tracking row.");
//     }
//   };

//   const handleDeleteMilestoneRow = async (eventCode: string) => {
//     if (
//       !hasValidScopeKeys ||
//       !window.confirm(
//         `Are you sure you want to delete milestone event [${eventCode}]?`,
//       )
//     )
//       return;
//     try {
//       await deleteEventLine({
//         buyerCode: selectedBuyer.buyerCode,
//         order: selectedOrder,
//         typeCode: selectedType.id,
//         styleCode: selectedStyle.StyleCode,
//         eventCode,
//       }).unwrap();
//       alert("Milestone tracking row purged successfully.");
//     } catch (err: any) {
//       alert(
//         err?.data?.Error ||
//           "Deletion failed. Record may be locked under approval parameters.",
//       );
//     }
//   };

//   // --- MATERIAL REACT TABLE SPREADSHEET BLUEPRINT DEF ---

//   const columns = useMemo<MRT_ColumnDef<StylewiseEventRow>[]>(
//     () => [
//       {
//         accessorKey: "eventCode",
//         header: "Code",
//         size: 80,
//         muiTableBodyCellProps: {
//           sx: { fontFamily: "monospace", color: "#1a237e", fontWeight: "bold" },
//         },
//       },
//       {
//         accessorKey: "description",
//         header: "Critical Path Event Milestone Description",
//         size: 220,
//       },
//       {
//         accessorKey: "scheduledDate",
//         header: "Sch. Date",
//         size: 100,
//         Cell: ({ cell }) =>
//           cell.getValue()
//             ? new Date(cell.getValue<string>()).toLocaleDateString("en-GB")
//             : "***",
//       },
//       {
//         accessorKey: "actualDate",
//         header: "Act. Date",
//         size: 100,
//         Cell: ({ cell }) =>
//           cell.getValue()
//             ? new Date(cell.getValue<string>()).toLocaleDateString("en-GB")
//             : "***",
//       },
//       { accessorKey: "remarks", header: "Remarks / Progress Logs", size: 150 },
//       {
//         accessorKey: "milestoneStatus",
//         header: "Compliance Status",
//         size: 130,
//         Cell: ({ cell }) => {
//           const val = cell.getValue<string>();
//           let txtColor = "#2e7d32"; // green for ** OK **
//           if (val === "No Scheduled Date") txtColor = "#d32f2f"; // red
//           if (val === "Actual Date Pending") txtColor = "#f57c00"; // orange
//           return (
//             <span style={{ fontWeight: "bold", color: txtColor }}>{val}</span>
//           );
//         },
//       },
//     ],
//     [],
//   );

//   const table = useMaterialReactTable({
//     columns,
//     data: milestoneChecklist,
//     enablePagination: false,
//     enableRowActions: true,
//     enableTopToolbar: true,
//     initialState: { density: "compact" },
//     renderRowActions: ({ row }) => (
//       <Box display="flex" gap={0.5}>
//         <Tooltip title="Modify milestone scheduling dates">
//           <IconButton
//             color="primary"
//             onClick={() => handleSelectRowForEdit(row.original)}
//           >
//             <EditIcon size="small" />
//           </IconButton>
//         </Tooltip>
//         <Tooltip title="Delete tracking line from layout">
//           <IconButton
//             color="error"
//             onClick={() => handleDeleteMilestoneRow(row.original.eventCode)}
//           >
//             <DeleteIcon size="small" />
//           </IconButton>
//         </Tooltip>
//       </Box>
//     ),
//   });

//   return (
//     <Box sx={{ width: "100%", p: 1 }}>
//       {/* Module Title Accent Header Bar */}
//       <Typography
//         variant="h5"
//         sx={{ fontWeight: "bold", color: "#1a237e", mb: 2 }}
//       >
//         Style-Wise Production Critical Path Milestones
//       </Typography>

//       {/* 1. Mount the unified 4-column filter selection card panel */}
//       <StylewiseEventsHeader onContextLock={(ctx) => setScopeContext(ctx)} />

//       {/* 2. DYNAMIC WORKSPACE PANEL SWITCHER */}
//       {scopeContext ? (
//         <Paper elevation={3} sx={{ p: 3, borderTop: "4px solid #1a237e" }}>
//           <Box
//             display="flex"
//             justifyContent="space-between"
//             alignItems="center"
//             sx={{ mb: 2 }}
//           >
//             <Typography
//               variant="subtitle2"
//               sx={{
//                 fontWeight: "bold",
//                 color: "#1a237e",
//                 textTransform: "uppercase",
//               }}
//             >
//               Active Milestones Operations Spreadsheet Tracker
//             </Typography>

//             {/* Context Sub-Badge Descriptor Summary */}
//             <Typography
//               variant="caption"
//               sx={{
//                 backgroundColor: "#e8eaf6",
//                 p: 1,
//                 borderRadius: "4px",
//                 fontWeight: "bold",
//                 color: "#1a237e",
//               }}
//             >
//               Tracking Scope Code: {scopeContext.styleCode}
//             </Typography>
//           </Box>

//           {/* 3. Mount the editable Material React Table data cell sheet layer */}
//           <StylewiseEventsGrid
//             buyerCode={scopeContext.buyerCode}
//             order={scopeContext.order}
//             typeCode={scopeContext.typeCode}
//             styleCode={scopeContext.styleCode}
//             eventsData={milestoneRows}
//             isLoading={isFetching}
//           />
//         </Paper>
//       ) : (
//         /* Default Empty Fallback Informational Banner Container */
//         <Alert
//           severity="info"
//           variant="outlined"
//           sx={{
//             mt: 2,
//             fontWeight: "bold",
//             borderLeft: "4px solid #0288d1",
//             backgroundColor: "#fafafa",
//           }}
//         >
//           Please select a valid Buyer, Purchase Order Contract, Garment Type,
//           and Target Style profile in the header selector to map milestones.
//         </Alert>
//       )}
//     </Box>
//   );
// }
