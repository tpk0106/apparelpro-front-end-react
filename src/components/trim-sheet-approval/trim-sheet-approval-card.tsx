import { useState } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Paper,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import LockIcon from "@mui/icons-material/Lock";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import ConfirmDialog from "../common/confirm-dialog";
import {
  useGetStyleApprovalDetailsQuery,
  useApproveTrimSheetMutation,
} from "../../tanstack-hooks/custom-hooks";
import type { TrimSheetApprovalScopeContext } from "./trim-sheet-approval.types";

interface TrimSheetApprovalCardProps {
  scope: TrimSheetApprovalScopeContext;
  currentUserId: string;
  currentUserName: string;
}

export default function TrimSheetApprovalCard({
  scope,
  currentUserId,
  currentUserName,
}: TrimSheetApprovalCardProps) {
  const { data: approvalDetails, isFetching: isLoadingDetails } =
    useGetStyleApprovalDetailsQuery(scope);
  const approveMutation = useApproveTrimSheetMutation();

  // Confirmation now goes through the shared ConfirmDialog rather than
  // window.confirm() - per project convention, no native browser
  // alert/confirm/prompt popups (see confirm-dialog.tsx and its usage in
  // consumption-ledger-grid.component.tsx for the established pattern).
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  // approvalDetails is null when the style has not yet been Trim-Sheet-approved
  // (a normal, expected state - see StyleApprovalController.GetDetails).
  const isApproved = !!approvalDetails;
  const approvedBy = approvalDetails?.estimateApprovalUserName || "N/A";
  const approvedDate = approvalDetails?.estimateApprovalDate
    ? String(approvalDetails.estimateApprovalDate).split("T")[0]
    : "N/A";

  const handleRequestApprove = () => {
    if (approveMutation.isPending || isApproved) return;
    setIsConfirmOpen(true);
  };

  const handleConfirmApprove = async () => {
    try {
      await approveMutation.mutateAsync({
        buyerCode: scope.buyerCode,
        order: scope.order,
        typeCode: scope.typeCode,
        styleCode: scope.styleCode,
        approvedByUserId: currentUserId,
        approvalDate: new Date().toISOString().split("T")[0],
      });
    } finally {
      setIsConfirmOpen(false);
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2.5,
        mb: 3,
        backgroundColor: isApproved ? "#e8f5e9" : "#fffde7",
        borderColor: isApproved ? "#a5d6a7" : "#ffe082",
        borderLeft: isApproved ? "6px solid #2e7d32" : "6px solid #f57f17",
        boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <Grid container sx={{ spacing: 2, alignItems: "center" }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1.5 }}>
            {isApproved ? (
              <VerifiedUserIcon sx={{ color: "#2e7d32", fontSize: "28px" }} />
            ) : (
              <LockIcon sx={{ color: "#f57f17", fontSize: "28px" }} />
            )}
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: "bold",
                color: isApproved ? "#1b5e20" : "#e65100",
              }}
            >
              {isApproved
                ? "TRIM SHEET APPROVED"
                : "TRIM SHEET PENDING APPROVAL"}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            {isApproved
              ? `This style's Trim Sheet was approved by [ ${approvedBy} ] on ${approvedDate}. Material Consumption entries for this style are now locked for standard users - only a Merchandising Manager, Merchandiser Manager, or Executive Director can still edit them. Supplier PO raising is now enabled for this style.`
              : `Review the style's material requirements before approving. Approving the Trim Sheet locks Material Consumption entry for standard users (edits after this point require a Merchandising Manager, Merchandiser Manager, or Executive Director) and enables Supplier PO raising for this style, matching the legacy Trim Sheet Approval routine.`}
          </Typography>

          <Box sx={{ mt: 1.5, display: "flex", gap: 3 }}>
            <Typography
              variant="caption"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontWeight: "bold",
                color: "text.secondary",
              }}
            >
              <VerifiedUserIcon sx={{ fontSize: "14px" }} /> Approver:{" "}
              {currentUserName.toUpperCase()} ({currentUserId})
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontWeight: "bold",
                color: "text.secondary",
              }}
            >
              <CalendarMonthIcon sx={{ fontSize: "14px" }} /> System Date:{" "}
              {new Date().toLocaleDateString("en-AU", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Typography>
          </Box>
        </Grid>

        <Grid
          size={{ xs: 12, md: 4 }}
          sx={{ textAlign: { xs: "left", md: "right" } }}
        >
          {isLoadingDetails ? (
            <CircularProgress size={24} />
          ) : isApproved ? (
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                backgroundColor: "#c8e6c9",
                borderColor: "#81c784",
                display: "inline-block",
                borderRadius: "4px",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: "bold",
                  color: "#1b5e20",
                  display: "block",
                  textAlign: "center",
                }}
              >
                ✓ TRIM SHEET APPROVED
              </Typography>
            </Paper>
          ) : (
            <Button
              variant="contained"
              color="warning"
              size="large"
              onClick={handleRequestApprove}
              disabled={approveMutation.isPending}
              startIcon={
                approveMutation.isPending ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <VerifiedUserIcon />
                )
              }
              sx={{
                backgroundColor: "#f57f17",
                "&.Mui-disabled": { backgroundColor: "#cca785" },
                "&:hover": { backgroundColor: "#e65100" },
                fontWeight: "bold",
                px: 3,
              }}
            >
              Approve Trim Sheet
            </Button>
          )}
        </Grid>
      </Grid>

      <ConfirmDialog
        open={isConfirmOpen}
        title="Approve Trim Sheet"
        message={
          <>
            Approve Trim Sheet for selected Style{" "}
            <strong>{scope.styleCode}</strong>? This will lock Material
            Consumption entry for standard users (only a Merchandising
            Manager, Merchandiser Manager, or Executive Director can edit
            afterwards) and enable Supplier PO raising for this style. This
            cannot be undone from this screen.
          </>
        }
        confirmLabel="Approve"
        confirmColor="warning"
        isConfirming={approveMutation.isPending}
        onConfirm={handleConfirmApprove}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </Card>
  );
}
