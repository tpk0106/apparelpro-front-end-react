import { useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import TrimSheetApprovalHeader from "./trim-sheet-approval-header";
import TrimSheetApprovalCard from "./trim-sheet-approval-card";
import type { TrimSheetApprovalScopeContext } from "./trim-sheet-approval.types";
import { DASHBOARD_COLORS } from "../../dashboard/dashboard-theme";
import { workspaceHeadingSx } from "../../../themes/workspace-theme";
import { copperTextColor } from "../../../themes/button-color-themes";

export default function TrimSheetApprovalWorkspace() {
  const [scope, setScope] = useState<TrimSheetApprovalScopeContext | null>(
    null,
  );

  const loggedInUserId = localStorage.getItem("userId") || "UNKNOWN_UID";
  const loggedInUserName = localStorage.getItem("user") || "Guest Operator";

  return (
    <Box sx={{ width: "100%", py: 1, px: 3, backgroundColor: DASHBOARD_COLORS.pageBg }}>
      <Typography
        variant="h5"
        sx={{ ...workspaceHeadingSx, textTransform: "uppercase", mb: 2 }}
      >
        Approve Trim Sheet
      </Typography>

      <TrimSheetApprovalHeader onScopeLock={(ctx) => setScope(ctx)} />

      {scope ? (
        <Paper
          elevation={3}
          sx={{
            p: 3,
            backgroundColor: DASHBOARD_COLORS.cardBg,
            border: `1px solid ${DASHBOARD_COLORS.border}`,
            borderTop: `4px solid ${copperTextColor}`,
          }}
        >
          <TrimSheetApprovalCard
            scope={scope}
            currentUserId={loggedInUserId}
            currentUserName={loggedInUserName}
          />
        </Paper>
      ) : (
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            p: 3,
            textAlign: "center",
            color: DASHBOARD_COLORS.accentStrong,
            backgroundColor: DASHBOARD_COLORS.cardBg,
            borderColor: DASHBOARD_COLORS.border,
            fontWeight: "bold",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            Select a Buyer, Purchase Order, Garment Type, and Style above to
            view or set its Trim Sheet Approval status.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
