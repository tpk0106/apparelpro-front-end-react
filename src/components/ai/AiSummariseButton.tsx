import { useState, useCallback } from 'react';
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Box,
  Chip,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SummarizeIcon from '@mui/icons-material/Summarize';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { useAiSummarise, useAiAnalyse } from '../../tanstack-hooks/ai/useAiSummarise';
import {
  copperGlossButtonSx,
  copperTextColor,
} from '../../themes/button-color-themes';

type AiMode = 'summarise' | 'analyse';

interface AiSummariseButtonProps {
  /** Entity type: "Style", "PurchaseOrder", "Supplier", etc. */
  entityType: string;
  /** Primary key or composite key identifying the entity */
  entityKey: string;
  /** Optional label shown on the tooltip */
  tooltipLabel?: string;
}

export default function AiSummariseButton({
  entityType,
  entityKey,
  tooltipLabel,
}: AiSummariseButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [mode, setMode] = useState<AiMode>('summarise');

  const summarise = useAiSummarise();
  const analyse = useAiAnalyse();

  // Derived state — pick the active mutation based on mode
  const activeMutation = mode === 'summarise' ? summarise : analyse;
  const isPending = activeMutation.isPending;
  const isError = activeMutation.isError;
  const error = activeMutation.error;

  // Get the response content regardless of mode
  const responseContent =
    mode === 'summarise'
      ? summarise.data?.summary
      : analyse.data?.analysis;

  const providerLabel =
    mode === 'summarise'
      ? summarise.data?.provider
      : analyse.data
        ? `${analyse.data.provider} · ${analyse.data.model} · ${analyse.data.totalTokens} tokens`
        : undefined;

  const handleOpen = useCallback(() => {
    setIsDialogOpen(true);
    setUserQuery('');
    setIsCopied(false);
    summarise.reset();
    analyse.reset();
  }, [summarise, analyse]);

  const handleClose = useCallback(() => {
    setIsDialogOpen(false);
    setUserQuery('');
    summarise.reset();
    analyse.reset();
  }, [summarise, analyse]);

  const handleModeChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, newMode: AiMode | null) => {
      if (newMode) {
        setMode(newMode);
        setIsCopied(false);
        // Clear the OTHER mutation's result so old data doesn't flash
        if (newMode === 'summarise') analyse.reset();
        else summarise.reset();
      }
    },
    [summarise, analyse],
  );

  const handleExecute = useCallback(() => {
    setIsCopied(false);
    const payload = {
      entityType,
      entityKey,
      userQuery: userQuery.trim() || undefined,
    };
    if (mode === 'summarise') summarise.mutate(payload);
    else analyse.mutate(payload);
  }, [mode, summarise, analyse, entityType, entityKey, userQuery]);

  const handleCopy = useCallback(async () => {
    if (responseContent) {
      await navigator.clipboard.writeText(responseContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, [responseContent]);

  return (
    <>
      <Tooltip title={tooltipLabel ?? `AI Insights · ${entityType}`}>
        <IconButton
          onClick={handleOpen}
          sx={{
            color: copperTextColor,
            '&:hover': {
              backgroundColor: 'rgba(201, 128, 61, 0.08)',
            },
          }}
        >
          <AutoAwesomeIcon />
        </IconButton>
      </Tooltip>

      <Dialog
        open={isDialogOpen}
        onClose={handleClose}
        maxWidth={mode === 'analyse' ? 'md' : 'sm'}
        fullWidth
        slotProps={{
          paper: {
            sx: {
              backgroundColor: '#141922',
              backgroundImage: 'none',
              border: `1px solid rgba(201, 128, 61, 0.2)`,
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: '#F4F6F8',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <AutoAwesomeIcon sx={{ color: copperTextColor, fontSize: 20 }} />
          <Typography variant="h6" component="span" sx={{ flex: 1, color: '#F3E9D6' }}>
            {mode === 'summarise' ? 'AI Summary' : 'AI Analysis'}
          </Typography>
          <Chip
            label={entityType}
            size="small"
            sx={{
              backgroundColor: 'rgba(201, 128, 61, 0.12)',
              color: copperTextColor,
              fontSize: '0.7rem',
            }}
          />
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {/* Mode toggle */}
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleModeChange}
            size="small"
            sx={{
              mb: 2,
              mt: 1,
              '& .MuiToggleButton-root': {
                color: '#8B93A1',
                borderColor: 'rgba(255,255,255,0.1)',
                textTransform: 'none',
                fontSize: '0.8rem',
                px: 2,
                '&.Mui-selected': {
                  color: '#F3E9D6',
                  backgroundColor: 'rgba(201, 128, 61, 0.18)',
                  borderColor: copperTextColor,
                  '&:hover': {
                    backgroundColor: 'rgba(201, 128, 61, 0.25)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.04)',
                },
              },
            }}
          >
            <ToggleButton value="summarise">
              <SummarizeIcon sx={{ fontSize: 16, mr: 0.5 }} />
              Summary
            </ToggleButton>
            <ToggleButton value="analyse">
              <AnalyticsIcon sx={{ fontSize: 16, mr: 0.5 }} />
              Deep Analysis
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Mode description */}
          <Typography
            variant="caption"
            sx={{ display: 'block', color: '#8B93A1', mb: 2 }}
          >
            {mode === 'summarise'
              ? 'Quick overview of key metrics and status — fast and low cost.'
              : 'In-depth analysis with cost breakdowns, risk flags, and actionable recommendations.'}
          </Typography>

          {/* Optional question input */}
          <TextField
            fullWidth
            size="small"
            placeholder={
              mode === 'summarise'
                ? 'Ask a specific question (optional)...'
                : 'Focus the analysis on... (optional)'
            }
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isPending) handleExecute();
            }}
            disabled={isPending}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#0D1117',
                color: '#F4F6F8',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                '&:hover fieldset': { borderColor: 'rgba(201, 128, 61, 0.3)' },
                '&.Mui-focused fieldset': { borderColor: copperTextColor },
              },
              '& .MuiInputBase-input::placeholder': {
                color: '#8B93A1',
                opacity: 1,
              },
            }}
          />

          {/* Loading state */}
          {isPending && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
                py: 4,
              }}
            >
              <CircularProgress size={32} sx={{ color: copperTextColor }} />
              <Typography variant="body2" sx={{ color: '#8B93A1' }}>
                {mode === 'summarise'
                  ? `Summarising ${entityType.toLowerCase()}...`
                  : `Analysing ${entityType.toLowerCase()} — this may take a moment...`}
              </Typography>
            </Box>
          )}

          {/* Error state */}
          {isError && (
            <Typography
              variant="body2"
              sx={{
                color: '#f87171',
                backgroundColor: 'rgba(248, 113, 113, 0.08)',
                borderRadius: 1,
                p: 1.5,
              }}
            >
              {error?.message ?? 'Something went wrong. Please try again.'}
            </Typography>
          )}

          {/* Result content */}
          {responseContent && !isPending && (
            <Box
              sx={{
                backgroundColor: '#0D1117',
                borderRadius: 1,
                p: 2,
                border: '1px solid rgba(255,255,255,0.06)',
                maxHeight: mode === 'analyse' ? '60vh' : '40vh',
                overflowY: 'auto',
                // Scrollbar styling
                '&::-webkit-scrollbar': { width: 6 },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'rgba(255,255,255,0.02)',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(201, 128, 61, 0.3)',
                  borderRadius: 3,
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: '#F4F6F8',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.7,
                }}
              >
                {responseContent}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 1.5,
                  pt: 1,
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <Typography variant="caption" sx={{ color: '#8B93A1' }}>
                  {providerLabel ?? ''}
                </Typography>
                <Tooltip title={isCopied ? 'Copied!' : 'Copy to clipboard'}>
                  <IconButton size="small" onClick={handleCopy} sx={{ color: '#8B93A1' }}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.06)', px: 3, py: 1.5 }}>
          <Button
            onClick={handleClose}
            sx={{
              color: '#8B93A1',
              border: '1px solid rgba(255,255,255,0.1)',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.2)',
                backgroundColor: 'rgba(255,255,255,0.04)',
              },
            }}
          >
            Close
          </Button>
          <Button
            onClick={handleExecute}
            disabled={isPending}
            variant="contained"
            startIcon={
              isPending ? (
                <CircularProgress size={16} sx={{ color: '#F3E9D6' }} />
              ) : mode === 'summarise' ? (
                <SummarizeIcon />
              ) : (
                <AnalyticsIcon />
              )
            }
            sx={{
              ...copperGlossButtonSx,
              '&.Mui-disabled': {
                ...copperGlossButtonSx,
                opacity: 0.5,
                color: '#F3E9D6',
              },
            }}
          >
            <span style={{ position: 'relative', zIndex: 1 }}>
              {responseContent
                ? 'Regenerate'
                : mode === 'summarise'
                  ? 'Summarise'
                  : 'Analyse'}
            </span>
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
