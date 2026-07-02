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
import { useApproveStyleEventsMutation } from "../../services/sylewise.events.service";

import type { StylewiseEventRow } from "./stylewise-events.types";

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

  // 2. SELF-CONTAINED SECURE CLICK HANDLER: Toast loading runs STRICTLY inside here on user click
  const handleExecuteApproval = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (isProcessingLock || isSubmitting || approvalState.isApproved) return;

    const confirmationPrompt = `Approve Critical Path Milestone Events for Style [${styleCode}]?\n\nThis action will freeze all scheduled milestone targets and restrict operational data alterations. Proceed with executive sign-off?`;

    if (!window.confirm(confirmationPrompt)) return;

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

          <Typography variant="body2" color="text.secondary">
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
                color: "text.secondary",
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
              color="warning"
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
              sx={{
                backgroundColor: "#f57f17",
                "&.Mui-disabled": { backgroundColor: "#cca785" },
                "&:hover": { backgroundColor: "#e65100" },
                fontWeight: "bold",
                px: 3,
              }}
            >
              Authorize Event Sign-Off
            </Button>
          )}
        </Grid>
      </Grid>
    </Card>
  );
}
