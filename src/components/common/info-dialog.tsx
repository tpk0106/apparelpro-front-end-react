import type { ReactNode } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoIcon from "@mui/icons-material/Info";

// Shared single-button notice modal - replaces native window.alert() popups,
// per project convention (see confirm-dialog.tsx for the two-button
// Confirm/Cancel sibling used for "are you sure?" prompts). Use this one for
// pure notices - validation errors, save failures, success confirmations -
// anything the user just needs to acknowledge, with nothing to confirm.
export interface InfoDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  severity?: "info" | "success" | "warning" | "error";
  buttonLabel?: string;
  onClose: () => void;
}

const SEVERITY_STYLES = {
  info: { color: "#60a5fa", Icon: InfoIcon },
  success: { color: "#4caf50", Icon: CheckCircleIcon },
  warning: { color: "#f57f17", Icon: WarningAmberIcon },
  error: { color: "#F87171", Icon: ErrorIcon },
} as const;

export default function InfoDialog({
  open,
  title,
  message,
  severity = "info",
  buttonLabel = "OK",
  onClose,
}: InfoDialogProps) {
  const { color, Icon } = SEVERITY_STYLES[severity];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="info-dialog-title"
      slotProps={{
        paper: { sx: { backgroundColor: "#141922" } },
      }}
    >
      <DialogTitle
        id="info-dialog-title"
        sx={{ display: "flex", alignItems: "center", gap: 1.5, color }}
      >
        <Icon sx={{ color }} />
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          sx={{ color: "#F4F6F8", whiteSpace: "pre-line" }}
        >
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          autoFocus
          sx={{ minWidth: 100 }}
        >
          {buttonLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
