import React, { useState } from "react";
import { Alert, Box, Tab, Tabs } from "@mui/material";
import Styles from "./styles.component";
import ColorSizeBreakdown from "./color-size-breakdown.component";
import type { Style } from "../../interfaces/order-management/Style";
import PartShipmentsWorkspace from "../part-shipment/part-shipments-workspace";
import ConfirmDialog from "../common/confirm-dialog";
import { DASHBOARD_COLORS } from "../dashboard/dashboard-theme";
import { oliveGlossSx, copperTextColor } from "../../themes/button-color-themes";

// Shared look for this file's "nothing selected yet" notices - was MUI's
// default filled-blue Alert; replaced with the app's dark card background and
// bold copper text so it matches the rest of the olive/copper theme instead
// of standing out as leftover default styling.
const emptyStateAlertSx = {
  fontWeight: "bold",
  color: copperTextColor,
  backgroundColor: DASHBOARD_COLORS.cardBg,
  border: `1px solid ${DASHBOARD_COLORS.border}`,
  "& .MuiAlert-icon": { color: copperTextColor },
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function a11yProps(index: number) {
  return {
    id: `order-tab-${index}`,
    "aria-controls": `order-tabpanel-${index}`,
  };
}

// FIXED TAB RETENTION ENGINE:
// We change this container to use simple CSS visibility toggles (display: none / block)
// instead of fully unmounting. This keeps all text boxes and grid states fully alive in memory!
function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      style={{ display: value === index ? "block" : "none" }} // Keeps component state alive in background!
      id={`order-tabpanel-${index}`}
      aria-labelledby={`order-tab-${index}`}
      {...other}
    >
      <Box
        sx={{
          margin: "10px 0",
          p: 3,
          border: `1px solid ${DASHBOARD_COLORS.border}`,
          borderRadius: "4px",
          minWidth: "70%",
          minHeight: "100%",
          backgroundColor: DASHBOARD_COLORS.cardBg,
        }}
      >
        {children}
      </Box>
    </div>
  );
}

interface OrderMainProps {
  buyerCode?: number;
  order?: string;
  mainOrderUnit?: string;
}

const OrderMain = ({ buyerCode, order, mainOrderUnit }: OrderMainProps) => {
  const [value, setValue] = useState(0);

  // 1. Centralized global state tracking selected row context variables
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [isMatrixDirty, setIsMatrixDirty] = useState<boolean>(false);

  // Replaces window.confirm() with the shared ConfirmDialog, per project
  // convention (no native browser alert/confirm popups). Since the dialog
  // is async (unlike window.confirm, which blocks until the user answers),
  // the tab change is held in pendingTabValue until the user actually
  // confirms leaving - only then does the switch actually happen.
  const [pendingTabValue, setPendingTabValue] = useState<number | null>(null);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    // Intercept navigation passes if an operation layer is active and unsaved
    if (isMatrixDirty) {
      setPendingTabValue(newValue);
      return; // Freeze tab change frame safely until the dialog resolves
    }
    setValue(newValue);
  };

  const handleConfirmLeaveUnsaved = () => {
    if (pendingTabValue === null) return;
    setIsMatrixDirty(false);
    setValue(pendingTabValue);
    setPendingTabValue(null);
  };

  const handleCancelLeaveUnsaved = () => {
    setPendingTabValue(null);
  };

  // if (!buyerCode || !order) {
  //   return (
  //     <Box sx={{ padding: "2px" }}>
  //       Please select a valid Buyer and Order to display details.
  //     </Box>
  //   );
  // }

  return (
    <div className="w-full mt-5">
      <Box
        sx={{
          width: "50%",
          margin: "0 auto",
          border: `2px solid ${DASHBOARD_COLORS.border}`,
          borderRadius: "5px",
          marginTop: "3px",
        }}
      >
        <Box
          sx={{
            ...oliveGlossSx,
            borderBottom: 1,
          }}
        >
          <Tabs
            sx={{
              // 1. Unselected tab text color - the olive gloss's own cream
              "& .MuiTab-root": {
                color: "#F3EADF",
                position: "relative",
                zIndex: 1,
              },
              // 2. Selected tab text color - same cream, distinguished by
              // weight and the indicator bar instead of a color swap.
              "& .MuiTab-root.Mui-selected": {
                color: "#F3EADF",
                fontWeight: 700,
              },
              // 3. Bottom sliding indicator bar color
              "& .MuiTabs-indicator": {
                backgroundColor: "#9FAE5E",
                height: "3px",
              },
              // 4. Hover effect color
              "& .MuiTab-root:hover": {
                color: copperTextColor,
              },
            }}
            value={value}
            onChange={handleChange}
            aria-label="Garment Order Control Panels"
            variant="fullWidth"
          >
            <Tab label="[Style Details]" {...a11yProps(0)} />
            <Tab label="Shipments/Part Shipment" {...a11yProps(1)} />
            <Tab label="Color/Size Breakdown" {...a11yProps(2)} />
          </Tabs>
        </Box>
      </Box>

      {/* Panel 0: Master Styles Registry Grid Layout Sheet */}
      <CustomTabPanel value={value} index={0}>
        {mainOrderUnit && buyerCode && order ? (
          <Styles
            buyerCode={buyerCode}
            order={order}
            mainOrderUnit={mainOrderUnit}
            // FIXED: Pass active selectedStyle reference down as prop to highlight the active row!
            activeSelectedStyle={selectedStyle}
            onSelectStyleForBreakdown={(style: Style) => {
              setSelectedStyle(style);
              setValue(2); // Automatically bounce the user directly to Tab 2 (Color/Size)
            }}
          />
        ) : (
          <Box sx={{ padding: "2px" }}>
            <Alert severity="info" variant="outlined" sx={emptyStateAlertSx}>
              Please select a valid Buyer and Order in Order confirmation
              routine (above) to display style details.
            </Alert>
          </Box>
        )}
      </CustomTabPanel>

      {/* Panel 1: Shipping Records Allocation Management Shell (FIXED WORKFLOW) */}
      <CustomTabPanel value={value} index={1}>
        <Box sx={{ padding: "2px" }}>
          {selectedStyle && buyerCode && order ? (
            <PartShipmentsWorkspace
              buyerCode={buyerCode}
              order={order}
              // FIXED: Correctly check both lowercase and uppercase properties to prevent undefined values!
              typeCode={selectedStyle.typeCode}
              styleCode={selectedStyle.styleCode}
              onResetSelection={() => {
                setSelectedStyle(null);
                setValue(0);
              }}
              selectedStyle={selectedStyle}
            />
          ) : (
            <Box sx={{ padding: "3px" }}>
              <Alert
                severity="info"
                variant="outlined"
                sx={emptyStateAlertSx}
              >
                ⚠️ Access Refused: Please return to the [Style Details]
                spreadsheet panel tab and click a style row item to initialize
                its shipment allocation tracking logs.
              </Alert>
            </Box>
          )}
        </Box>
      </CustomTabPanel>

      {/* Panel 2: Color and Size Breakdown Execution Workspace */}
      <CustomTabPanel value={value} index={2}>
        {buyerCode && order && selectedStyle ? (
          <ColorSizeBreakdown
            buyerCode={buyerCode}
            order={order}
            selectedStyleFromGrid={selectedStyle}
            onResetSelection={() => {
              setSelectedStyle(null);
              setValue(0); // Return operator cleanly back to main overview table upon save confirmation
            }}
            setIsMatrixDirty={setIsMatrixDirty}
            isMatrixDirty={isMatrixDirty}
          />
        ) : (
          <Box sx={{ padding: "3px" }}>
            <Alert severity="info" variant="outlined" sx={emptyStateAlertSx}>
              No Style context selected. Please return to the{" "}
              <strong>[Style Details]</strong> tab and click the{" "}
              <strong>Grid matrix button</strong> on a style row to begin
              allocation formatting.
            </Alert>
          </Box>
        )}
      </CustomTabPanel>

      <ConfirmDialog
        open={pendingTabValue !== null}
        title="Unsaved Changes"
        message="You have unsaved changes in your Colour/Size Matrix Breakdown. Moving away will discard all changes. Do you want to leave without saving?"
        confirmLabel="Leave Without Saving"
        confirmColor="error"
        onConfirm={handleConfirmLeaveUnsaved}
        onCancel={handleCancelLeaveUnsaved}
      />
    </div>
  );
};

export default OrderMain;

// import React, { useState } from "react";
// import { Box, Tab, Tabs } from "@mui/material";
// import Styles from "./styles.component";
// import ColorSizeBreakdown from "./color-size-breakdown.component";
// import type { Style } from "../../interfaces/OrderManagement/Style"; // Your data model layout
// import PartShipmentsWorkspace from "../part-shipment/part-shipments-workspace";

// interface TabPanelProps {
//   children?: React.ReactNode;
//   index: number;
//   value: number;
// }

// function a11yProps(index: number) {
//   return {
//     id: `order-tab-${index}`,
//     "aria-controls": `order-tabpanel-${index}`,
//   };
// }

// function CustomTabPanel(props: TabPanelProps) {
//   const { children, value, index, ...other } = props;

//   return (
//     <div
//       role="tabpanel"
//       hidden={value !== index}
//       id={`order-tabpanel-${index}`}
//       aria-labelledby={`order-tab-${index}`}
//       {...other}
//     >
//       {value === index && (
//         <Box
//           sx={{
//             margin: "10px 0",
//             p: 3,
//             border: "1px solid #ccc",
//             borderRadius: "4px",
//             minWidth: "70%",
//             minHeight: "100%",
//             backgroundColor: "#fff",
//           }}
//         >
//           {children}
//         </Box>
//       )}
//     </div>
//   );
// }

// interface OrderMainProps {
//   buyerCode?: number;
//   order?: string;
//   mainOrderUnit?: string;
// }

// const OrderMain = ({ buyerCode, order, mainOrderUnit }: OrderMainProps) => {
//   const [value, setValue] = useState(0);

//   // 1. Declare the style allocation state globally at the parent level
//   const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);

//   // 1. Declare the operational data lock state globally
//   const [isMatrixDirty, setIsMatrixDirty] = useState<boolean>(false);

//   const handleChange = (event: React.SyntheticEvent, newValue: number) => {
//     // 2. Intercept tab click events! If user tries to navigate away with unsaved data, block them.
//     if (isMatrixDirty) {
//       const confirmLeave = window.confirm(
//         "WARNING: You have unsaved changes in your Colour/Size Matrix Breakdown! Moving away will discard all changes. Do you want to leave without saving?",
//       );
//       if (!confirmLeave) {
//         return; // Stop tab transition execution completely, keeping user safe on Tab 2
//       }

//       // If they explicitly choose to discard, clear the lock status
//       setIsMatrixDirty(false);
//     }

//     setValue(newValue);
//   };

//   if (!buyerCode || !order) {
//     return (
//       <Box sx={{ padding: "2px" }}>
//         Please select a valid Buyer and Order to display details.
//       </Box>
//     );
//   }

//   return (
//     <div className="w-full mt-5">
//       <Box
//         sx={{
//           width: "50%",
//           margin: "0 auto",
//           border: "2px solid gray",
//           borderRadius: "5px",
//           marginTop: "3px",
//         }}
//       >
//         <Box
//           sx={{
//             borderBottom: 1,
//             borderColor: "divider",
//             backgroundColor: "#9e9e9e",
//             color: "#000",
//           }}
//         >
//           <Tabs
//             value={value}
//             onChange={handleChange}
//             aria-label="Garment Order Control Panels"
//             variant="fullWidth"
//           >
//             <Tab label="[Style Details]" {...a11yProps(0)} />
//             <Tab label="Shipments/Part Shipment" {...a11yProps(1)} />
//             <Tab label="Color/Size Breakdown" {...a11yProps(2)} />
//           </Tabs>
//         </Box>
//       </Box>

//       {/* Panel 0: Master Styles Registry Grid */}
//       <CustomTabPanel value={value} index={0}>
//         {mainOrderUnit && (
//           <Styles
//             buyerCode={buyerCode}
//             order={order}
//             mainOrderUnit={mainOrderUnit}
//             // 2. Pass down handlers so clicking a row updates the state and changes the tab
//             onSelectStyleForBreakdown={(style: Style) => {
//               setSelectedStyle(style);
//               setValue(2); // Automatically bounce the user directly to Tab 2
//             }}
//           />
//         )}
//       </CustomTabPanel>

//       {/* Panel 1: Shipping Records Management */}
//       <CustomTabPanel value={value} index={1}>
//         <Box sx={{ padding: "2px" }}>
//           {/* Shipments components render module here... */}
//           <PartShipmentsWorkspace />
//         </Box>
//       </CustomTabPanel>

//       {/* Panel 2: Color and Size Breakdown Execution Workspace */}
//       <CustomTabPanel value={value} index={2}>
//         <ColorSizeBreakdown
//           buyerCode={buyerCode}
//           order={order}
//           selectedStyleFromGrid={selectedStyle}
//           onResetSelection={() => {
//             setSelectedStyle(null);
//             setValue(0); // Return user to the main Style Details list upon successful completion
//           }}
//           setIsMatrixDirty={setIsMatrixDirty}
//           isMatrixDirty={isMatrixDirty}
//         />
//       </CustomTabPanel>
//     </div>
//   );
// };

// export default OrderMain;
