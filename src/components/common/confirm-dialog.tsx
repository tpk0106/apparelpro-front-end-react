import type { ReactNode } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";

// Shared confirmation modal - replaces native window.confirm()/alert() popups
// across the app, per project convention (see access-denied-dialog.tsx for the
// sibling pattern used for non-dismissible notices). Any screen that needs a
// "are you sure?" prompt (delete, cancel, post/commit, etc.) should render one
// of these instead of building its own Dialog, so the look/feel and behavior
// (Escape/backdrop handling, disabled-while-busy buttons, dark theme colors)
// stays consistent everywhere rather than being re-implemented per screen.
export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  // Matches MUI Button `color` - use "error" for destructive actions (delete),
  // "primary" for neutral confirmations (post/commit), etc.
  confirmColor?: "primary" | "error" | "warning" | "success" | "secondary";
  // While true: shows a spinner on the confirm button and disables both
  // buttons and Escape/backdrop dismissal, so a user can't close the dialog
  // mid-request or double-fire the action.
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmColor = "primary",
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={(_event, reason) => {
        if (isConfirming) return;
        if (reason === "backdropClick" || reason === "escapeKeyDown") {
          onCancel();
          return;
        }
        onCancel();
      }}
      aria-labelledby="confirm-dialog-title"
      slotProps={{
        paper: { sx: { backgroundColor: "#141922" } },
      }}
    >
      <DialogTitle id="confirm-dialog-title" sx={{ color: "#F4F6F8" }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: "#F4F6F8" }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        {/* "secondary" isn't themed in apparelProDarkTheme, so it was falling
            back to MUI's default (pink/purple) instead of this app's blue
            accent. Use the same outlined-primary treatment as other Cancel
            actions in the app, with a matching minWidth so this button reads
            as the same size/weight as the Confirm/Delete action next to it. */}
        <Button
          onClick={onCancel}
          variant="outlined"
          color="primary"
          disabled={isConfirming}
          sx={{ minWidth: 100 }}
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={confirmColor}
          autoFocus
          disabled={isConfirming}
          sx={{ minWidth: 100 }}
          startIcon={
            isConfirming ? (
              <CircularProgress size={16} color="inherit" />
            ) : undefined
          }
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
