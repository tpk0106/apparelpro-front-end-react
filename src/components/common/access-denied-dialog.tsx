import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import GlobalAccessDeniedNotifier from "../../auth/accessDeniedNotifier";

const DEFAULT_MESSAGE =
  "You do not have permission to perform this action. Contact your administrator if you believe this is incorrect.";

// Two-tone descending "denied" buzzer, synthesized via the Web Audio API so no
// external sound file needs to be bundled or hosted. Failures here (autoplay
// restrictions, unsupported browser) must never block the dialog itself from
// showing - sound is a nice-to-have, the visible dialog is the requirement.
const playAccessDeniedSound = () => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioContextClass();
    const playTone = (frequency: number, startTime: number, duration: number) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(frequency, startTime);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.15, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    const now = ctx.currentTime;
    playTone(440, now, 0.16);
    playTone(220, now + 0.18, 0.28);
    setTimeout(() => ctx.close(), 700);
  } catch {
    // Sound is best-effort only.
  }
};

export default function AccessDeniedDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);

  useEffect(() => {
    const unsubscribe = GlobalAccessDeniedNotifier.subscribe((notifiedMessage) => {
      setMessage(notifiedMessage || DEFAULT_MESSAGE);
      setIsOpen(true);
      playAccessDeniedSound();
    });
    return unsubscribe;
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  return (
    <Dialog
      open={isOpen}
      disableEscapeKeyDown
      onClose={(_event, reason) => {
        // User must click OK - ignore backdrop clicks and Escape.
        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
        handleClose();
      }}
      aria-labelledby="access-denied-dialog-title"
      slotProps={{
        paper: { sx: { border: "2px solid #F87171", backgroundColor: "#2A1518" } },
      }}
    >
      <DialogTitle
        id="access-denied-dialog-title"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          color: "#F87171",
          fontWeight: 800,
          letterSpacing: "0.08em",
        }}
      >
        <ReportProblemIcon sx={{ color: "#F87171", fontSize: 30 }} />
        ACCESS DENIED
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: "#F4F6F8" }}>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleClose}
          variant="contained"
          autoFocus
          sx={{
            backgroundColor: "#F87171",
            color: "#1f2328",
            fontWeight: 700,
            "&:hover": { backgroundColor: "#EF4444" },
          }}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}
