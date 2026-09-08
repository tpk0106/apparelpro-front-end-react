import React, { useMemo, useState } from "react";
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

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { toast, type Id } from "react-toastify";
import { useApproveStyleEventsMutation } from "../../services/order-management/sylewise.events.service";

import type { StylewiseEventRow } from "./stylewise-events.types";
import { DASHBOARD_COLORS } from "../dashboard/dashboard-theme";
import { primaryActionButtonSx, themedButtonLabelStyle } from "../../themes/workspace-theme";
import ConfirmDialog from "../common/confirm-dialog";

interface ApprovalCardProps {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  eventsData: StylewiseEventRow[];
  currentUserId: string;
  currentUserName: string;
}

function extractErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
): string {
  if (!error) return "An unexpected network communication exception occurred.";
  if ("status" in error) {
    if (error.status === 403)
      return "🛑 ACCESS DENIED: You do not possess the required executive 'Merchandising Manager' privileges.";
    if (error.status === 401)
      return "🛑 SESSION EXPIRED: Please sign-in again.";
  }
  if ("data" in error && error.data && typeof error.data === "object") {
    const dataObj = error.data as Record<string, any>;
    const serverMessage =
      dataObj.Error || dataObj.error || dataObj.Message || dataObj.message;
    if (serverMessage) return String(serverMessage);
  }
  if ("message" in error && error.message) return error.message;
  return "Failed to complete executive authorization transaction on the server.";
}

export default function StylewiseEventsApprovalCard({
  buyerCode,
  order,
  typeCode,
  styleCode,
  eventsData,
  currentUserId,
  currentUserName,
}: ApprovalCardProps) {
  const [submitApproval, { isLoading: isSubmitting }] =
    useApproveStyleEventsMutation();
  const [isProcessingLock, setIsProcessingLock] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  // 1. FIXED TYPE-SAFE DERIVED APPROVAL STATE: Clean of any toast, alert, or logging function calls!
  const approvalState = useMemo(() => {
    if (!eventsData || eventsData.length === 0) {
      return { isApproved: false, approvedBy: "N/A", approvedDate: "N/A" };
    }

    const firstRow = eventsData[0]; // Access the first milestone row element cleanly
    const approverId = firstRow?.approvedByUserId || "";
    const isSignedOff = approverId.trim() !== "";

    return {
      isApproved: isSignedOff,
      approvedBy: isSignedOff ? approverId : "N/A",
      approvedDate:
        isSignedOff && firstRow?.approvedDate
          ? String(firstRow.approvedDate).split("T")[0]
          : "N/A",
    };
  }, [eventsData]);

  // 2. SELF-CONTAINED SECURE CLICK HANDLER: opens the confirm dialog; the
  // actual submission (with its toast loading bar) runs in performApproval,
  // invoked only from the dialog's onConfirm.
  const handleExecuteApproval = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isProcessingLock || isSubmitting || approvalState.isApproved) return;

    setIsConfirmOpen(true);
  };

  const performApproval = async () => {
    setIsProcessingLock(true);

    // The ONLY place a toast loading bar is allowed to spawn in this entire module!
    const toastId: Id = toast.loading(
      "Processing executive signature, please wait...",
    );

    try {
      await submitApproval({
        buyerCode,
        order,
        typeCode,
        styleCode,
        approvedByUserId: currentUserId,
        approvalDate: new Date().toISOString().split("T")[0],
      }).unwrap();

      toast.update(toastId, {
        render: `✓ Milestone timeline for Style [${styleCode}] successfully locked by executive authority.`,
        type: "success",
        isLoading: false,
        autoClose: 4000,
        closeButton: true,
      });
    } catch (err) {
      const errorMessage = extractErrorMessage(
        err as FetchBaseQueryError | SerializedError,
      );

      toast.update(toastId, {
        render: errorMessage,
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });
    } finally {
      setIsProcessingLock(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2.5,
        mb: 3,
        backgroundColor: approvalState.isApproved ? "#e8f5e9" : "#fffde7",
        borderColor: approvalState.isApproved ? "#a5d6a7" : "#ffe082",
        borderLeft: approvalState.isApproved
          ? "6px solid #2e7d32"
          : "6px solid #f57f17",
        boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <Grid
        container
        sx={{
          spacing: 2,
          alignItems: "center",
        }}
      >
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1.5 }}>
            {approvalState.isApproved ? (
              <VerifiedUserIcon sx={{ color: "#2e7d32", fontSize: "28px" }} />
            ) : (
              <LockIcon sx={{ color: "#f57f17", fontSize: "28px" }} />
            )}
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: "bold",
                color: approvalState.isApproved ? "#1b5e20" : "#e65100",
              }}
            >
              {approvalState.isApproved
                ? "EXECUTIVE CRITICAL PATH SIGN-OFF COMMITTED"
                : "PENDING CRITICAL PATH APPROVAL RELEASE"}
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ color: DASHBOARD_COLORS.textSecondary }}>
            {approvalState.isApproved
              ? `This operational schedule matrix was officially verified and locked by Operator ID [ ${approvalState.approvedBy} ] on ${approvalState.approvedDate}. Custom milestones and target modification routes are frozen.`
              : `Review all tracking targets carefully. Approving this profile will secure the schedule baseline and toggle compliance guard blocks active across factory floor data entry masks.`}
          </Typography>

          <Box sx={{ mt: 1.5, display: "flex", gap: 3 }}>
            <Typography
              variant="caption"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontWeight: "bold",
                color: DASHBOARD_COLORS.textSecondary,
              }}
            >
              <VerifiedUserIcon sx={{ fontSize: "14px" }} /> Auditor:{" "}
              {currentUserName.toUpperCase()} ({currentUserId})
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontWeight: "bold",
                color: DASHBOARD_COLORS.textSecondary,
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
          {approvalState.isApproved ? (
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
                ✓ VERIFIED & APPROVED
              </Typography>
            </Paper>
          ) : (
            <Button
              variant="contained"
              size="large"
              onClick={(e) => handleExecuteApproval(e)}
              disabled={isProcessingLock || isSubmitting}
              startIcon={
                isProcessingLock || isSubmitting ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <VerifiedUserIcon />
                )
              }
              sx={{ ...primaryActionButtonSx, fontWeight: "bold", px: 3 }}
            >
              <span style={themedButtonLabelStyle}>Authorize Event Sign-Off</span>
            </Button>
          )}
        </Grid>
      </Grid>

      <ConfirmDialog
        open={isConfirmOpen}
        title="Authorize Event Sign-Off"
        message={`Approve Critical Path Milestone Events for Style "${styleCode}"? This action will freeze all scheduled milestone targets and restrict operational data alterations. Proceed with executive sign-off?`}
        confirmLabel="Approve"
        confirmColor="primary"
        isConfirming={isProcessingLock || isSubmitting}
        onConfirm={performApproval}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </Card>
  );
}
