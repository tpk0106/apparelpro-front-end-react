import { useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import TrimSheetApprovalHeader from "./trim-sheet-approval-header";
import TrimSheetApprovalCard from "./trim-sheet-approval-card";
import type { TrimSheetApprovalScopeContext } from "./trim-sheet-approval.types";

export default function TrimSheetApprovalWorkspace() {
  const [scope, setScope] = useState<TrimSheetApprovalScopeContext | null>(
    null,
  );

  const loggedInUserId = localStorage.getItem("userId") || "UNKNOWN_UID";
  const loggedInUserName = localStorage.getItem("user") || "Guest Operator";

  return (
    <Box sx={{ width: "100%", p: 1 }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: "bold", color: "#1a237e", mb: 2 }}
      >
        Approve Trim Sheet
      </Typography>

      <TrimSheetApprovalHeader onScopeLock={(ctx) => setScope(ctx)} />

      {scope ? (
        <Paper elevation={3} sx={{ p: 3, borderTop: "4px solid #1a237e" }}>
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
          sx={{ p: 3, textAlign: "center", color: "text.secondary" }}
        >
          <Typography variant="body2">
            Select a Buyer, Purchase Order, Garment Type, and Style above to
            view or set its Trim Sheet Approval status.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
