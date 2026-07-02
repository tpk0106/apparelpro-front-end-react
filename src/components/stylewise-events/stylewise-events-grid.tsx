import { useMemo, useState } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import DeleteIcon from "@mui/icons-material/Delete";
import PostAddIcon from "@mui/icons-material/PostAdd";

// Import standard Redux Toolkit Query error type structures to eliminate generic 'any' blocks completely
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import type { StylewiseEventRow } from "./stylewise-events.types";
import {
  useUpdateStylewiseEventLineMutation,
  useDeleteStylewiseEventLineMutation,
  useAddCustomStylewiseEventLineMutation,
} from "../../services/stylewise-event.services";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";

interface GridProps {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  eventsData: StylewiseEventRow[];
  isLoading: boolean;
}

// Helper Type Guard to safely check and extract strings out of backend network errors without 'any' overrides
function extractErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
): string {
  if (!error) return "An unexpected network communication anomaly occurred.";
  if (
    "data" in error &&
    error.data &&
    typeof error.data === "object" &&
    "Error" in error.data
  ) {
    return String((error.data as { Error: string }).Error);
  }
  if ("message" in error && error.message) return error.message;
  return "Failed to complete transaction on the C# database server.";
}

export default function StylewiseEventsGrid({
  buyerCode,
  order,
  typeCode,
  styleCode,
  eventsData,
  isLoading,
}: GridProps) {
  const [updateLine] = useUpdateStylewiseEventLineMutation();
  const [deleteLine] = useDeleteStylewiseEventLineMutation();
  const [addCustomLine] = useAddCustomStylewiseEventLineMutation();

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [customEventCode, setCustomEventCode] = useState<string>("");
  const [customRemarks, setCustomRemarks] = useState<string>("");

  const handleCellEditSave = async (
    row: any,
    columnId: string,
    value: string | null,
  ) => {
    const original = row.original as StylewiseEventRow;

    const payload = {
      buyerCode,
      order,
      typeCode,
      styleCode,
      eventCode: original.eventCode,
      scheduledDate:
        columnId === "scheduledDate" ? value : original.scheduledDate,
      actualDate: columnId === "actualDate" ? value : original.actualDate,
      remarks: columnId === "remarks" ? value || "" : original.remarks || "",
    };

    try {
      const response = await updateLine(payload).unwrap();
      if (!response.success) alert(response.message);
    } catch (err) {
      // FIXED ERROR TYPE: Extract message cleanly using type-safe validation guards instead of 'any'
      alert(extractErrorMessage(err as FetchBaseQueryError | SerializedError));
    }
  };

  const handleDeleteMilestone = async (eventCode: string) => {
    if (
      !window.confirm(
        `Are you sure you want to purge event milestone [${eventCode}] from the tracking ledger?`,
      )
    )
      return;
    try {
      await deleteLine({
        buyerCode,
        order,
        typeCode,
        styleCode,
        eventCode,
      }).unwrap();
    } catch (err) {
      alert(extractErrorMessage(err as FetchBaseQueryError | SerializedError));
    }
  };

  const handleAddCustomMilestoneSubmit = async () => {
    if (!customEventCode.trim()) return;
    try {
      await addCustomLine({
        buyerCode,
        order,
        typeCode,
        styleCode,
        eventCode: customEventCode.trim().toUpperCase(),
        scheduledDate: null,
        actualDate: null,
        remarks: customRemarks.trim().toUpperCase(),
      }).unwrap();

      setOpenModal(false);
      setCustomEventCode("");
      setCustomRemarks("");
    } catch (err) {
      alert(extractErrorMessage(err as FetchBaseQueryError | SerializedError));
    }
  };

  const columns = useMemo<MRT_ColumnDef<StylewiseEventRow>[]>(
    () => [
      {
        accessorKey: "eventCode",
        header: "Event Code",
        size: 90,
        enableEditing: false,
        muiTableBodyCellProps: {
          sx: { fontFamily: "monospace", fontWeight: "bold", color: "#1a237e" },
        },
      },
      {
        accessorKey: "description",
        header: "Milestone Description",
        size: 200,
        enableEditing: false,
      },
      {
        accessorKey: "scheduledDate",
        header: "Scheduled Date",
        size: 130,
        Cell: ({ cell }) =>
          cell.getValue() ? String(cell.getValue()).split("T")[0] : "***",
        Edit: ({ cell, row }) => (
          <TextField
            type="date"
            size="small"
            variant="standard"
            defaultValue={
              cell.getValue() ? String(cell.getValue()).split("T")[0] : ""
            }
            onBlur={(e) =>
              handleCellEditSave(row, "scheduledDate", e.target.value || null)
            }
            slotProps={{ htmlInput: { style: { fontSize: "13px" } } }}
          />
        ),
      },
      {
        accessorKey: "actualDate",
        header: "Actual Floor Recv Date",
        size: 130,
        Cell: ({ cell }) =>
          cell.getValue() ? String(cell.getValue()).split("T")[0] : "***",
        Edit: ({ cell, row }) => (
          <TextField
            type="date"
            size="small"
            variant="standard"
            defaultValue={
              cell.getValue() ? String(cell.getValue()).split("T")[0] : ""
            }
            onBlur={(e) =>
              handleCellEditSave(row, "actualDate", e.target.value || null)
            }
            slotProps={{ htmlInput: { style: { fontSize: "13px" } } }}
          />
        ),
      },
      {
        accessorKey: "remarks",
        header: "Remarks / Operational Compliance Notes",
        size: 220,
        Edit: ({ cell, row }) => (
          <TextField
            size="small"
            variant="standard"
            fullWidth
            defaultValue={cell.getValue() || ""}
            onBlur={(e) =>
              handleCellEditSave(row, "remarks", e.target.value.toUpperCase())
            }
            slotProps={{
              htmlInput: {
                style: { fontSize: "13px", textTransform: "uppercase" },
              },
            }}
          />
        ),
      },
      {
        accessorKey: "milestoneStatus",
        header: "Tracking Status Badge",
        size: 150,
        enableEditing: false,
        Cell: ({ cell }) => {
          const status = cell.getValue<string>();
          let fontColor = "#2e7d32";
          if (status === "No Scheduled Date") fontColor = "#c62828";
          if (status === "Actual Date Pending") fontColor = "#ef6c00";
          return (
            <span style={{ fontWeight: "bold", color: fontColor }}>
              {status}
            </span>
          );
        },
      },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data: eventsData,
    state: { isLoading },
    enableEditing: true,
    editDisplayMode: "cell",
    enablePagination: false,
    enableRowActions: true,
    enableTopToolbar: true,
    initialState: { density: "compact" },
    renderRowActions: ({ row }) => (
      <Tooltip title="Purge custom milestone row from contract layout scope">
        <IconButton
          color="error"
          onClick={() => handleDeleteMilestone(row.original.eventCode)}
        >
          {/* FIXED ICON PROPERTIES: Switched from size='small' to correct fontSize='small' definition */}
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    ),

    renderTopToolbarCustomActions: () => (
      <Box
        component="div"
        sx={{
          display: "flex",
          gap: 1.5,
        }}
      >
        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<PostAddIcon />}
          onClick={() => setOpenModal(true)}
        >
          [Ins] Add Custom Tracking Milestone Row
        </Button>

        {/* NEW: PDF Print Report Trigger Button */}
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={() => {
            // FIXED: Switched from legacy process.env to Vite's type-safe import.meta.env mapping string!
            // Direct type-safe mapping from your master central configuration endpoints file!
            const baseApiUrl = APPARELPRO_ENDPOINTS.URLS.BASEURL;
            const normalizedBase = baseApiUrl.endsWith("/")
              ? baseApiUrl
              : `${baseApiUrl}/`;

            // const targetPrintUrl = `${normalizedBase}api/stylewise-reports/print-report?buyerCode=${buyerCode}&order=${encodeURIComponent(order)}&typeCode=${typeCode}&styleCode=${encodeURIComponent(styleCode)}`;
            const targetPrintUrl = `${normalizedBase}${APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.STYLE_WISE_EVENTS.GET_STYLE_WISE_EVENTS_REPORT}?buyerCode=${buyerCode}&order=${encodeURIComponent(order)}&typeCode=${typeCode}&styleCode=${encodeURIComponent(styleCode)}`;

            window.open(targetPrintUrl, "_blank");
          }}
        >
          [Print] Export Milestone Status Report
        </Button>
      </Box>
    ),
    // renderTopToolbarCustomActions: () => (
    //   <Button
    //     variant="outlined"
    //     color="primary"
    //     size="small"
    //     startIcon={<PostAddIcon />}
    //     onClick={() => setOpenModal(true)}
    //   >
    //     [Ins] Add Custom Tracking Milestone Row
    //   </Button>
    // ),
  });

  return (
    <Box>
      <MaterialReactTable table={table} />

      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{ fontWeight: "bold", color: "#1a237e", fontSize: "16px" }}
        >
          Append Custom Milestone
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Event Code ID"
              size="small"
              fullWidth
              value={customEventCode}
              onChange={(e) => setCustomEventCode(e.target.value)}
              slotProps={{
                htmlInput: { style: { textTransform: "uppercase" } },
              }}
            />
            <TextField
              label="Initial Remarks"
              size="small"
              fullWidth
              value={customRemarks}
              onChange={(e) => setCustomRemarks(e.target.value)}
              slotProps={{
                htmlInput: { style: { textTransform: "uppercase" } },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleAddCustomMilestoneSubmit}
            variant="contained"
            color="primary"
            disabled={!customEventCode.trim()}
          >
            Inject Row
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// import { useMemo, useState } from "react";
// import {
//   Box,
//   IconButton,
//   Tooltip,
//   TextField,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
// } from "@mui/material";
// import {
//   MaterialReactTable,
//   useMaterialReactTable,
//   type MRT_ColumnDef,
// } from "material-react-table";
// import DeleteIcon from "@mui/icons-material/Delete";
// // import AddCircleIcon from "@mui/icons-material/AddCircle";
// import PostAddIcon from "@mui/icons-material/PostAdd";

// import type { StylewiseEventRow } from "./stylewise-events.types";
// import {
//   useUpdateStylewiseEventLineMutation,
//   useDeleteStylewiseEventLineMutation,
//   useAddCustomStylewiseEventLineMutation,
// } from "../../services/stylewise-event.services";

// interface GridProps {
//   buyerCode: number;
//   order: string;
//   typeCode: number;
//   styleCode: string;
//   eventsData: StylewiseEventRow[];
//   isLoading: boolean;
// }

// export default function StylewiseEventsGrid({
//   buyerCode,
//   order,
//   typeCode,
//   styleCode,
//   eventsData,
//   isLoading,
// }: GridProps) {
//   // 1. Core State Triggers & API Mutations
//   const [updateLine] = useUpdateStylewiseEventLineMutation();
//   const [deleteLine] = useDeleteStylewiseEventLineMutation();
//   const [addCustomLine] = useAddCustomStylewiseEventLineMutation();

//   const [openModal, setOpenModal] = useState<boolean>(false);
//   const [customEventCode, setCustomEventCode] = useState<string>("");
//   const [customRemarks, setCustomRemarks] = useState<string>("");

//   // --- INTERACTION WORKFLOW MUTATION HANDLERS ---

//   const handleCellEditSave = async (
//     row: any,
//     columnId: string,
//     value: string | null,
//   ) => {
//     const original = row.original as StylewiseEventRow;

//     // Build payload preserving unchanged parameters cleanly
//     const payload = {
//       buyerCode,
//       order,
//       typeCode,
//       styleCode,
//       eventCode: original.eventCode,
//       scheduledDate:
//         columnId === "scheduledDate" ? value : original.scheduledDate,
//       actualDate: columnId === "actualDate" ? value : original.actualDate,
//       remarks: columnId === "remarks" ? value || "" : original.remarks || "",
//     };

//     try {
//       const response = await updateLine(payload).unwrap();
//       if (!response.success) alert(response.message);
//     } catch (err: any) {
//       // Dynamic compliance block interceptor popup display
//       alert(
//         err?.data?.error ||
//           "Failed to update milestone line item tracking variables.",
//       );
//     }
//   };

//   const handleDeleteMilestone = async (eventCode: string) => {
//     if (
//       !window.confirm(
//         `Are you sure you want to purge event milestone [${eventCode}] from the tracking ledger?`,
//       )
//     )
//       return;
//     try {
//       await deleteLine({
//         buyerCode,
//         order,
//         typeCode,
//         styleCode,
//         eventCode,
//       }).unwrap();
//     } catch (err: any) {
//       alert(
//         err?.data?.error ||
//           "Deletion Refused: Signed off tracking events cannot be dropped.",
//       );
//     }
//   };

//   const handleAddCustomMilestoneSubmit = async () => {
//     if (!customEventCode.trim()) return;
//     try {
//       await addCustomLine({
//         buyerCode,
//         order,
//         typeCode,
//         styleCode,
//         eventCode: customEventCode.trim().toUpperCase(),
//         scheduledDate: null,
//         actualDate: null,
//         remarks: customRemarks.trim().toUpperCase(),
//       }).unwrap();

//       setOpenModal(false);
//       setCustomEventCode("");
//       setCustomRemarks("");
//     } catch (err: any) {
//       alert(err?.data?.error || "Custom Insert Blocked.");
//     }
//   };

//   // --- MRT DYNAMIC SPREADSHEET BLUEPRINTS DEFINITIONS ---

//   const columns = useMemo<MRT_ColumnDef<StylewiseEventRow>[]>(
//     () => [
//       {
//         accessorKey: "eventCode",
//         header: "Event Code",
//         size: 90,
//         enableEditing: false,
//         muiTableBodyCellProps: {
//           sx: { fontFamily: "monospace", fontWeight: "bold", color: "#1a237e" },
//         },
//       },
//       {
//         accessorKey: "description",
//         header: "Milestone Milestone Description",
//         size: 200,
//         enableEditing: false,
//       },
//       {
//         accessorKey: "scheduledDate",
//         header: "Scheduled Date",
//         size: 130,
//         Cell: ({ cell }) =>
//           cell.getValue() ? String(cell.getValue()).split("T")[0] : "***",
//         Edit: ({ cell, row }) => (
//           <TextField
//             type="date"
//             size="small"
//             variant="standard"
//             defaultValue={
//               cell.getValue() ? String(cell.getValue()).split("T")[0] : ""
//             }
//             onBlur={(e) =>
//               handleCellEditSave(row, "scheduledDate", e.target.value || null)
//             }
//             slotProps={{ htmlInput: { style: { fontSize: "13px" } } }}
//           />
//         ),
//       },
//       {
//         accessorKey: "actualDate",
//         header: "Actual Floor Recv Date",
//         size: 130,
//         Cell: ({ cell }) =>
//           cell.getValue() ? String(cell.getValue()).split("T")[0] : "***",
//         Edit: ({ cell, row }) => (
//           <TextField
//             type="date"
//             size="small"
//             variant="standard"
//             defaultValue={
//               cell.getValue() ? String(cell.getValue()).split("T")[0] : ""
//             }
//             onBlur={(e) =>
//               handleCellEditSave(row, "actualDate", e.target.value || null)
//             }
//             slotProps={{ htmlInput: { style: { fontSize: "13px" } } }}
//           />
//         ),
//       },
//       {
//         accessorKey: "remarks",
//         header: "Remarks / Operational Compliance Notes",
//         size: 220,
//         Edit: ({ cell, row }) => (
//           <TextField
//             size="small"
//             variant="standard"
//             fullWidth
//             defaultValue={cell.getValue() || ""}
//             onBlur={(e) =>
//               handleCellEditSave(row, "remarks", e.target.value.toUpperCase())
//             }
//             slotProps={{
//               htmlInput: {
//                 style: { fontSize: "13px", textTransform: "uppercase" },
//               },
//             }}
//           />
//         ),
//       },
//       {
//         accessorKey: "milestoneStatus",
//         header: "Tracking Status Badge",
//         size: 150,
//         enableEditing: false,
//         Cell: ({ cell }) => {
//           const status = cell.getValue<string>();
//           let fontColor = "#2e7d32"; // ** OK ** (Green compliance)
//           if (status === "No Scheduled Date") fontColor = "#c62828"; // Red warning
//           if (status === "Actual Date Pending") fontColor = "#ef6c00"; // Orange alert
//           return (
//             <span style={{ fontWeight: "bold", color: fontColor }}>
//               {status}
//             </span>
//           );
//         },
//       },
//     ],
//     [buyerCode, order, typeCode, styleCode],
//   );

//   const table = useMaterialReactTable({
//     columns,
//     data: eventsData,
//     state: { isLoading },
//     enableEditing: true,
//     editDisplayMode: "cell", // Enforces lightning fast spreadsheet cell tab/click edit fields inline
//     enablePagination: false,
//     enableRowActions: true,
//     enableTopToolbar: true,
//     initialState: { density: "compact" },
//     renderRowActions: ({ row }) => (
//       <Tooltip title="Purge custom milestone row from contract layout scope">
//         <IconButton
//           color="error"
//           onClick={() => handleDeleteMilestone(row.original.eventCode)}
//         >
//           <DeleteIcon size="small" />
//         </IconButton>
//       </Tooltip>
//     ),
//     renderTopToolbarCustomActions: () => (
//       <Button
//         variant="outlined"
//         color="primary"
//         size="small"
//         startIcon={<PostAddIcon />}
//         onClick={() => setOpenModal(true)}
//       >
//         [Ins] Add Custom Tracking Milestone Row
//       </Button>
//     ),
//   });

//   return (
//     <Box>
//       <MaterialReactTable table={table} />

//       {/* Dynamic Pop-up Modal prompt matching Clipper [Ins] manual insertion key scripts */}
//       <Dialog
//         open={openModal}
//         onClose={() => setOpenModal(false)}
//         maxWidth="xs"
//         fullWidth
//       >
//         <DialogTitle
//           sx={{ fontWeight: "bold", color: "#1a237e", fontSize: "16px" }}
//         >
//           Append Custom Milestone
//         </DialogTitle>
//         <DialogContent dividers>
//           <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 1 }}>
//             <TextField
//               label="Event Code ID"
//               size="small"
//               fullWidth
//               value={customEventCode}
//               onChange={(e) => setCustomEventCode(e.target.value)}
//               slotProps={{
//                 htmlInput: { style: { textTransform: "uppercase" } },
//               }}
//             />
//             <TextField
//               label="Initial Remarks"
//               size="small"
//               fullWidth
//               value={customRemarks}
//               onChange={(e) => setCustomRemarks(e.target.value)}
//               slotProps={{
//                 htmlInput: { style: { textTransform: "uppercase" } },
//               }}
//             />
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenModal(false)} color="secondary">
//             Cancel
//           </Button>
//           <Button
//             onClick={handleAddCustomMilestoneSubmit}
//             variant="contained"
//             color="primary"
//             disabled={!customEventCode.trim()}
//           >
//             Inject Row
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }
