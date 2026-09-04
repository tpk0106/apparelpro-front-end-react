import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Grid,
  ThemeProvider,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { toast } from "react-toastify";
import StyleScopePicker, {
  type StyleScope,
} from "../style-scope/style-scope-picker.component";
import OperationBreakdownGrid from "./operation-breakdown-grid.component";
import {
  useGetComponentBreakdownByStyle,
} from "../../../tanstack-hooks/production-style-breakdown.hooks";
import {
  useGetOperationBreakdownByStyle,
  useSeedOperationBreakdownFromTemplateMutation,
  useBulkSaveOperationBreakdownMutation,
} from "../../../tanstack-hooks/production-style-breakdown.hooks";
import type { StyleOperationBreakdown } from "../../../interfaces/production/StyleOperationBreakdown";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import { DASHBOARD_COLORS } from "../../dashboard/dashboard-theme";
import {
  workspaceHeadingSx,
  workspaceSectionLabelSx,
  primaryActionButtonSx,
  themedButtonLabelStyle,
} from "../../../themes/workspace-theme";

// Accordion-per-component is the current layout; noted as a likely candidate
// to revisit later (e.g. tabs, or a single flat grid grouped by component).
const StyleOperationBreakdownWorkspace = () => {
  const [scope, setScope] = useState<StyleScope | null>(null);

  const { data: components = [] } = useGetComponentBreakdownByStyle(scope);
  const { data: savedOperations } = useGetOperationBreakdownByStyle(scope);

  const [rowsByComponent, setRowsByComponent] = useState<
    Record<number, StyleOperationBreakdown[]>
  >({});
  const [loadedComponents, setLoadedComponents] = useState<Set<number>>(new Set());
  const [targetDailyOutput, setTargetDailyOutput] = useState<number | null>(null);

  useEffect(() => {
    setRowsByComponent({});
    setLoadedComponents(new Set());
    setTargetDailyOutput(null);
  }, [scope]);

  useEffect(() => {
    if (!savedOperations || savedOperations.length === 0) return;
    const grouped: Record<number, StyleOperationBreakdown[]> = {};
    const loaded = new Set<number>();
    for (const op of savedOperations) {
      grouped[op.componentSequence] = [...(grouped[op.componentSequence] ?? []), op];
      loaded.add(op.componentSequence);
    }
    setRowsByComponent(grouped);
    setLoadedComponents(loaded);
  }, [savedOperations]);

  const { mutateAsync: seedFromTemplate } = useSeedOperationBreakdownFromTemplateMutation();
  const { mutateAsync: bulkSave, isPending: isSaving } = useBulkSaveOperationBreakdownMutation();

  const handleAccordionExpand = async (
    componentSequence: number,
    componentCode: string,
    expanded: boolean,
  ) => {
    if (!expanded || !scope || loadedComponents.has(componentSequence)) return;

    setLoadedComponents((prev) => new Set(prev).add(componentSequence));
    const seeded = await seedFromTemplate({ scope, componentSequence, componentCode });
    setRowsByComponent((prev) => ({ ...prev, [componentSequence]: seeded }));
  };

  const handleRowsChange = (componentSequence: number, rows: StyleOperationBreakdown[]) => {
    setRowsByComponent((prev) => ({ ...prev, [componentSequence]: rows }));
  };

  const handleSaveAll = async () => {
    if (!scope) return;
    const allRows = Object.values(rowsByComponent).flat();
    if (allRows.length === 0) {
      toast.warning("Add at least one operation before saving.");
      return;
    }
    const result = await bulkSave({ scope, records: allRows });
    setTargetDailyOutput(result.targetDailyOutput);
    const grouped: Record<number, StyleOperationBreakdown[]> = {};
    for (const op of result.operations) {
      grouped[op.componentSequence] = [...(grouped[op.componentSequence] ?? []), op];
    }
    setRowsByComponent(grouped);
  };

  return (
    <div className="flex flex-col w-[85%] mx-auto justify-around mt-10 mb-12">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography sx={workspaceHeadingSx}>Style wise Operation Breakdown</Typography>
        </ThemeProvider>
      </div>

      <StyleScopePicker onScopeChange={setScope} />

      {scope && components.length === 0 && (
        <Typography color="error" sx={{ px: 2 }}>
          No components selected for this style yet - use Style wise Component Breakdown first.
        </Typography>
      )}

      {scope &&
        components.map((c) => (
          <Accordion
            key={c.componentSequence}
            onChange={(_, expanded) =>
              handleAccordionExpand(c.componentSequence, c.componentCode, expanded)
            }
            sx={{
              backgroundColor: DASHBOARD_COLORS.cardBg,
              color: DASHBOARD_COLORS.textPrimary,
              border: `1px solid ${DASHBOARD_COLORS.border}`,
              "&:before": { display: "none" },
              mb: 1,
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: DASHBOARD_COLORS.textPrimary }} />}
            >
              <Typography sx={workspaceSectionLabelSx}>
                {c.componentSequence}. {c.componentCode}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <OperationBreakdownGrid
                rows={rowsByComponent[c.componentSequence] ?? []}
                onRowsChange={(rows) => handleRowsChange(c.componentSequence, rows)}
                scope={scope}
                componentSequence={c.componentSequence}
                componentCode={c.componentCode}
              />
            </AccordionDetails>
          </Accordion>
        ))}

      {scope && components.length > 0 && (
        <Box sx={{ mt: 3 }}>
          {targetDailyOutput !== null && (
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box
                  sx={{
                    backgroundColor: DASHBOARD_COLORS.cardBg,
                    border: `1px solid ${DASHBOARD_COLORS.border}`,
                    borderRadius: 1,
                    p: 2,
                  }}
                >
                  <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary }}>
                    Target Daily Output
                  </Typography>
                  <Typography variant="h6" sx={{ color: DASHBOARD_COLORS.textPrimary }}>
                    {targetDailyOutput.toFixed(0)} pcs
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
          <Button variant="contained" onClick={handleSaveAll} disabled={isSaving} sx={primaryActionButtonSx}>
            <span style={themedButtonLabelStyle}>{isSaving ? "Saving..." : "Save and recalculate"}</span>
          </Button>
        </Box>
      )}
    </div>
  );
};

export default StyleOperationBreakdownWorkspace;
