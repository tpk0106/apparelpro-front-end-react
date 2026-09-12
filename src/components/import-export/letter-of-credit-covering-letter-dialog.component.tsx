import { useEffect, useState } from "react";
import {
  Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, TextField, Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { DASHBOARD_COLORS } from "../dashboard/dashboard-theme";
import { useDropdownTheme } from "../../themes/useDropdownTheme";
import { primaryActionButtonSx, themedButtonLabelStyle, dateIconFieldSx, numberFieldNoSpinnerSx } from "../../themes/workspace-theme";
import {
  useGetLetterOfCreditCoveringLetter, useSaveLetterOfCreditCoveringLetter, useDeleteLetterOfCreditCoveringLetter,
} from "../../tanstack-hooks/import-export/letter-of-credit-covering-letter.hooks";
import ConfirmDialog from "../common/confirm-dialog";
import type { LetterOfCreditCoveringLetter } from "../../interfaces/import-export/ImportExport";

interface Props {
  bankCode: string | null;
  lcNo: string | null;
  onClose: () => void;
}

const emptyLetter = (bankCode: string, lcNo: string): LetterOfCreditCoveringLetter => ({
  bankCode, lcNo, letterDate: null, exportLcNo: "", value: "", item1: "", item2: "",
  box1Selected: false, box2Selected: false, attn1: "", box3Selected: false, attn2: "",
  box4Selected: false, sampleLcNo: "", box5Selected: false, box6Selected: false, box7Selected: false,
  percentage: null, box8Line1: "", box8Line2: "", box9Line1: "", box9Line2: "", box10Line1: "", box10Line2: "",
});

// Matches legacy IE_LCLT1.PRG - a fixed cover-letter template. Only offered
// for BOC/SCB per legacy (this component doesn't enforce that itself - the
// parent page only opens it for those banks).
const LetterOfCreditCoveringLetterDialog = ({ bankCode, lcNo, onClose }: Props) => {
  const { fieldSx } = useDropdownTheme();
  const open = !!bankCode && !!lcNo;

  const { data: existing, isFetching: isLoadingExisting } = useGetLetterOfCreditCoveringLetter(bankCode, lcNo);
  const saveMutation = useSaveLetterOfCreditCoveringLetter();
  const deleteMutation = useDeleteLetterOfCreditCoveringLetter();

  const [letter, setLetter] = useState<LetterOfCreditCoveringLetter>(emptyLetter(bankCode ?? "", lcNo ?? ""));
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (existing) setLetter(existing);
    else setLetter(emptyLetter(bankCode!, lcNo!));
  }, [existing, open, bankCode, lcNo]);

  const setField = <K extends keyof LetterOfCreditCoveringLetter>(field: K, value: LetterOfCreditCoveringLetter[K]) => {
    setLetter((p) => ({ ...p, [field]: value }));
  };

  const handleSave = () => {
    saveMutation.mutate(letter, {
      onSuccess: () => { toast.success("Covering letter saved."); onClose(); },
      onError: (error) => toast.error(error.message || "Failed to save covering letter."),
    });
  };

  const handleConfirmDelete = () => {
    if (!bankCode || !lcNo) return;
    deleteMutation.mutate({ bankCode, lcNo }, {
      onSuccess: () => { toast.success("Covering letter deleted."); setIsDeleteConfirmOpen(false); onClose(); },
      onError: (error) => toast.error(error.message || "Failed to delete covering letter."),
    });
  };

  const checkbox = (label: string, field: keyof LetterOfCreditCoveringLetter) => (
    <FormControlLabel
      control={
        <Checkbox
          checked={!!letter[field]}
          onChange={(e) => setField(field, e.target.checked as never)}
        />
      }
      label={label}
    />
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      slotProps={{ paper: { sx: { backgroundColor: DASHBOARD_COLORS.cardBg } } }}>
      <DialogTitle sx={{ color: DASHBOARD_COLORS.accentStrong }}>
        L/C Covering Letter - {bankCode?.trim()} / {lcNo}
      </DialogTitle>
      <DialogContent>
        {isLoadingExisting ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 4, justifyContent: "center" }}>
            <CircularProgress size={22} />
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Loading...</Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField type="date" label="Date" size="small"
                sx={{ ...(fieldSx as Record<string, unknown>), ...(dateIconFieldSx as Record<string, unknown>), width: 200 }}
                slotProps={{ inputLabel: { shrink: true } }}
                value={letter.letterDate?.split("T")[0] || ""} onChange={(e) => setField("letterDate", e.target.value || null)} />
              <TextField label="Exp. L/C No." size="small" sx={{ ...fieldSx, width: 220 }}
                value={letter.exportLcNo || ""} onChange={(e) => setField("exportLcNo", e.target.value)} />
              <TextField label="Value" size="small" sx={{ ...fieldSx, width: 200 }}
                value={letter.value || ""} onChange={(e) => setField("value", e.target.value)} />
              <TextField label="Item" size="small" sx={{ ...fieldSx, width: 180 }}
                value={letter.item1 || ""} onChange={(e) => setField("item1", e.target.value)} />
              <TextField label="Item" size="small" sx={{ ...fieldSx, width: 180 }}
                value={letter.item2 || ""} onChange={(e) => setField("item2", e.target.value)} />
            </Box>

            <Typography sx={{ fontWeight: 600, mt: 1 }}>Paragraphs</Typography>

            {checkbox("Box 1", "box1Selected")}

            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              {checkbox("Box 2 - DHL courier document despatch (Attn.)", "box2Selected")}
              <TextField label="Attn." size="small" sx={{ ...fieldSx, width: 220 }} disabled={!letter.box2Selected}
                value={letter.attn1 || ""} onChange={(e) => setField("attn1", e.target.value)} />
            </Box>

            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              {checkbox("Box 3 - Shipment sample by registered airmail (Attn.)", "box3Selected")}
              <TextField label="Attn." size="small" sx={{ ...fieldSx, width: 220 }} disabled={!letter.box3Selected}
                value={letter.attn2 || ""} onChange={(e) => setField("attn2", e.target.value)} />
            </Box>

            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              {checkbox("Box 4 - Sample marking (L/C No.)", "box4Selected")}
              <TextField label="Sample L/C No." size="small" sx={{ ...fieldSx, width: 220 }} disabled={!letter.box4Selected}
                value={letter.sampleLcNo || ""} onChange={(e) => setField("sampleLcNo", e.target.value)} />
            </Box>

            {checkbox("Box 5", "box5Selected")}
            {checkbox("Box 6", "box6Selected")}
            {checkbox("Box 7", "box7Selected")}

            <TextField label="Percentage" size="small" type="number" sx={{ ...fieldSx, ...numberFieldNoSpinnerSx, width: 160 }}
              value={letter.percentage ?? ""} onChange={(e) => setField("percentage", e.target.value === "" ? null : Number(e.target.value))} />

            <Typography sx={{ fontWeight: 600, mt: 1 }}>Free-Text Paragraphs</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <TextField label="Box 8 - Line 1" size="small" fullWidth sx={fieldSx}
                value={letter.box8Line1 || ""} onChange={(e) => setField("box8Line1", e.target.value)} />
              <TextField label="Box 8 - Line 2" size="small" fullWidth sx={fieldSx}
                value={letter.box8Line2 || ""} onChange={(e) => setField("box8Line2", e.target.value)} />
              <TextField label="Box 9 - Line 1" size="small" fullWidth sx={fieldSx}
                value={letter.box9Line1 || ""} onChange={(e) => setField("box9Line1", e.target.value)} />
              <TextField label="Box 9 - Line 2" size="small" fullWidth sx={fieldSx}
                value={letter.box9Line2 || ""} onChange={(e) => setField("box9Line2", e.target.value)} />
              <TextField label="Box 10 - Line 1" size="small" fullWidth sx={fieldSx}
                value={letter.box10Line1 || ""} onChange={(e) => setField("box10Line1", e.target.value)} />
              <TextField label="Box 10 - Line 2" size="small" fullWidth sx={fieldSx}
                value={letter.box10Line2 || ""} onChange={(e) => setField("box10Line2", e.target.value)} />
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
        <Button variant="contained" color="error" disabled={!existing || isLoadingExisting} onClick={() => setIsDeleteConfirmOpen(true)}>
          <span style={themedButtonLabelStyle}>Delete</span>
        </Button>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={onClose} variant="contained" sx={primaryActionButtonSx}>
            <span style={themedButtonLabelStyle}>Cancel</span>
          </Button>
          <Button onClick={handleSave} variant="contained" sx={primaryActionButtonSx} disabled={saveMutation.isPending || isLoadingExisting}>
            <span style={themedButtonLabelStyle}>Save Covering Letter</span>
          </Button>
        </Box>
      </DialogActions>

      <ConfirmDialog
        open={isDeleteConfirmOpen}
        title="Delete Covering Letter"
        message={`Delete the covering letter for ${bankCode?.trim()} / ${lcNo}? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </Dialog>
  );
};

export default LetterOfCreditCoveringLetterDialog;
