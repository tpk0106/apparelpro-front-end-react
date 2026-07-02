import { Box, Paper, Typography, Alert } from "@mui/material";

import StyleShippingSummaryCard from "./style-shipping-summary-card";
import PartShipmentsGrid from "./part-shipments-grid";

import { useGetPartShipmentsLedgerQuery } from "../../services/part-shipment.service";
import type { Style } from "../../interfaces/OrderManagement/Style";

interface WorkspaceProps {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  onResetSelection: () => void;
  selectedStyle: Style | null;
}

export default function PartShipmentsWorkspace({
  buyerCode,
  order,
  typeCode,
  styleCode,
  //   onResetSelection,
  //   selectedStyle,
}: WorkspaceProps) {
  // 2. Map your RTK-Query cache hooks to read variables DIRECTLY from props:
  const { data: shipmentsRows = [], isFetching } =
    useGetPartShipmentsLedgerQuery({ buyerCode, order, typeCode, styleCode });

  return (
    <Box sx={{ width: "100%", p: 1 }}>
      {/* Central Screen Layout Title Header */}
      <Typography
        variant="h5"
        sx={{ fontWeight: "bold", color: "#1a237e", mb: 2 }}
      >
        Scheduled Shipments & Part Deliveries Ledger
      </Typography>

      <Box>
        {/* 3. Mount the dynamic contract volume summary progress card */}

        <StyleShippingSummaryCard
          buyerCode={buyerCode}
          order={order}
          typeCode={typeCode}
          styleCode={styleCode}
        />

        <Paper
          elevation={3}
          sx={{ p: 3, mt: 2, borderTop: "4px solid #2e7d32" }}
        >
          <Box
            sx={{
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: "bold",
                color: "#2e7d32",
                textTransform: "uppercase",
              }}
            >
              Split Delivery Manifest Booking Sheet
            </Typography>
            <Typography
              variant="caption"
              sx={{
                backgroundColor: "#e8f5e9",
                p: 1,
                borderRadius: "4px",
                fontWeight: "bold",
                color: "#2e7d32",
              }}
            ></Typography>
          </Box>

          <PartShipmentsGrid
            buyerCode={buyerCode}
            order={order}
            typeCode={typeCode}
            styleCode={styleCode}
            shipmentsData={shipmentsRows}
            isLoading={isFetching}
          />
        </Paper>
      </Box>

      {!styleCode && (
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
          and Target Style profile inside the filters panel to initialize
          shipping allocation sheets.
        </Alert>
      )}
    </Box>
  );
}

// import { useState } from "react";
// import { Box, Paper, Typography, Alert } from "@mui/material";

// // Mount the components we built across our logistics architecture layers
// import StylewiseEventsHeader from "../stylewise-events/stylewise-events-header";
// import StyleShippingSummaryCard from "./style-shipping-summary-card";
// import PartShipmentsGrid from "./part-shipments-grid";

// // Import types contracts and centralized Redux network transport slices cleanly
// import type { SelectedHeaderContext } from "../stylewise-events/stylewise-events.types";
// import { useGetPartShipmentsLedgerQuery } from "../../services/part-shipment.service";

// export default function PartShipmentsWorkspace() {
//   // 1. Maintain a single unified scope state to track the active verified style parameters context
//   const [scopeContext, setScopeContext] =
//     useState<SelectedHeaderContext | null>(null);

//   // 2. Dynamic Fetch Interceptor Hook: Streams active delivery rows from the EventMasters table
//   // This automatically un-skips only when the operator locks in all 4 coordinates in the card above
//   const { data: shipmentsRows = [], isFetching } =
//     useGetPartShipmentsLedgerQuery(
//       {
//         buyerCode: scopeContext?.buyerCode || 0,
//         order: scopeContext?.order || "",
//         typeCode: scopeContext?.typeCode || 0,
//         styleCode: scopeContext?.styleCode || "",
//       },
//       { skip: !scopeContext }, // Keeps network channels totally quiet during idle form typing passes
//     );
//   return (
//     <Box sx={{ width: "100%", p: 1 }}>
//       {/* Central Screen Layout Title Header */}
//       <Typography
//         variant="h5"
//         sx={{ fontWeight: "bold", color: "#1a237e", mb: 2 }}
//       >
//         Scheduled Shipments & Part Deliveries Ledger
//       </Typography>

//       {/* 1. Mount the reusable 4-column dropdown selector header card */}
//       <StylewiseEventsHeader onContextLock={(ctx) => setScopeContext(ctx)} />

//       {/* 2. DYNAMIC LOGISTICS PANEL CONTAINER SWITCHER */}
//       {scopeContext ? (
//         <Box>
//           {/* 3. Mount the dynamic contract volume summary progress card */}
//           <StyleShippingSummaryCard
//             buyerCode={scopeContext.buyerCode}
//             order={scopeContext.order}
//             typeCode={scopeContext.typeCode}
//             styleCode={scopeContext.styleCode}
//           />

//           <Paper
//             elevation={3}
//             sx={{ p: 3, mt: 2, borderTop: "4px solid #2e7d32" }}
//           >
//             <Box
//               sx={{
//                 mb: 2,
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//               }}
//             >
//               <Typography
//                 variant="subtitle2"
//                 sx={{
//                   fontWeight: "bold",
//                   color: "#2e7d32",
//                   textTransform: "uppercase",
//                 }}
//               >
//                 Split Delivery Manifest Booking Sheet
//               </Typography>
//               <Typography
//                 variant="caption"
//                 sx={{
//                   backgroundColor: "#e8f5e9",
//                   p: 1,
//                   borderRadius: "4px",
//                   fontWeight: "bold",
//                   color: "#2e7d32",
//                 }}
//               >
//                 Active Scope: {scopeContext.styleCode}
//               </Typography>
//             </Box>

//             {/* 4. Mount the interactive 12-column Material React Table grid spreadsheet */}
//             <PartShipmentsGrid
//               buyerCode={scopeContext.buyerCode}
//               order={scopeContext.order}
//               typeCode={scopeContext.typeCode}
//               styleCode={scopeContext.styleCode}
//               shipmentsData={shipmentsRows}
//               isLoading={isFetching}
//             />
//           </Paper>
//         </Box>
//       ) : (
//         /* Default Initial Fallback Welcome Information Banner */
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
//           and Target Style profile inside the filters panel to initialize
//           shipping allocation sheets.
//         </Alert>
//       )}
//     </Box>
//   );
// }
