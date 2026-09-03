import { useMemo } from "react";
import { Box, Card, Typography, LinearProgress, Paper } from "@mui/material";
import Grid from "@mui/material/Grid";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

// Import your unified network tracking service hook and interfaces cleanly
import { useGetStyleShippingSummaryQuery } from "../../services/order-management/part-shipment.service";
import { DASHBOARD_COLORS } from "../dashboard/dashboard-theme";
import { copperTextColor } from "../../themes/button-color-themes";

interface SummaryCardProps {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
}

export default function StyleShippingSummaryCard({
  buyerCode,
  order,
  typeCode,
  styleCode,
}: SummaryCardProps) {
  // 1. Direct Network Stream Integration
  const {
    data: summaryMetrics,
    isLoading,
    isError,
  } = useGetStyleShippingSummaryQuery(
    { buyerCode, order, typeCode, styleCode },
    { skip: buyerCode === 0 || !order || typeCode === 0 || !styleCode },
  );

  // 2. Safe Arithmetic Fallback Extractor Defaults
  const metrics = useMemo(() => {
    if (!summaryMetrics) {
      return {
        totalContractQuantity: 0,
        totalScheduledQuantity: 0,
        remainingUnscheduledBalance: 0,
        unit: "PCS",
      };
    }
    return summaryMetrics;
  }, [summaryMetrics]);

  // 3. Compute scheduling dispatch percentages safely to drive the visual progress tracker
  const trackingPercentage = useMemo(() => {
    if (metrics.totalContractQuantity <= 0) return 0;
    const computedPercentage =
      (metrics.totalScheduledQuantity / metrics.totalContractQuantity) * 100;
    return Math.min(Math.round(computedPercentage), 100); // Caps nicely at 100% boundary limit guards
  }, [metrics]);

  // Determine indicator colors dynamically according to total warehouse scheduling capacity limits
  const progressIndicatorColor = useMemo(() => {
    if (trackingPercentage >= 100) return "#2e7d32"; // Complete Booking (Safe Green Compliance)
    if (trackingPercentage >= 75) return "#ef6c00"; // High Allocation (Orange alert)
    return DASHBOARD_COLORS.accentStrong; // Initial Staging (base olive)
  }, [trackingPercentage]);

  if (isLoading) {
    return (
      <Card
        variant="outlined"
        sx={{
          p: 2,
          mb: 3,
          backgroundColor: DASHBOARD_COLORS.cardBg,
          borderColor: DASHBOARD_COLORS.border,
          textAlign: "center",
        }}
      >
        <Typography
          variant="body2"
          sx={{ color: DASHBOARD_COLORS.textSecondary }}
          className="animate-pulse uppercase font-semibold"
        >
          Calculating split shipment tracking capacities from SQL Server...
        </Typography>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card
        variant="outlined"
        sx={{ p: 2, mb: 3, backgroundColor: DASHBOARD_COLORS.cardBg, borderColor: "#fff59d" }}
      >
        <Typography variant="body2" color="error" sx={{ fontWeight: "bold" }}>
          ⚠️ Operational Warning: Failed to query rolling shipping caps from the
          relational database tables context.
        </Typography>
      </Card>
    );
  }

  return (
    <Box sx={{ width: "100%", mb: 3 }}>
      {/* Upper Status Grid Cluster Matrix Cards */}
      <Grid container spacing={2}>
        {/* Metric 1: Total Buyer Contract Quantity */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              gap: 2,
              backgroundColor: DASHBOARD_COLORS.cardBg,
              borderColor: DASHBOARD_COLORS.border,
              borderLeft: `5px solid ${copperTextColor}`,
            }}
          >
            <InventoryIcon sx={{ color: copperTextColor, fontSize: "32px" }} />
            <Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  color: DASHBOARD_COLORS.textSecondary,
                  display: "block",
                }}
              >
                Total Style Contract Target
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: DASHBOARD_COLORS.accentStrong,
                  fontFamily: "monospace",
                }}
              >
                {metrics.totalContractQuantity.toLocaleString()}{" "}
                <span style={{ fontSize: "14px" }}>{metrics.unit}</span>
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Metric 2: Total Scheduled Splitted Shipping Volume */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              gap: 2,
              backgroundColor: DASHBOARD_COLORS.cardBg,
              borderColor: DASHBOARD_COLORS.border,
              borderLeft: `5px solid ${progressIndicatorColor}`,
            }}
          >
            <LocalShippingIcon
              sx={{ color: progressIndicatorColor, fontSize: "32px" }}
            />
            <Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  color: DASHBOARD_COLORS.textSecondary,
                  display: "block",
                }}
              >
                Total Scheduled Quantity
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: progressIndicatorColor,
                  fontFamily: "monospace",
                }}
              >
                {metrics.totalScheduledQuantity.toLocaleString()}{" "}
                <span style={{ fontSize: "14px" }}>{metrics.unit}</span>
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Metric 3: Remaining Open Balance Left to Manifest */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              gap: 2,
              borderColor: DASHBOARD_COLORS.border,
              borderLeft: `5px solid ${copperTextColor}`,
              backgroundColor:
                metrics.remainingUnscheduledBalance <= 0
                  ? "rgba(159,174,94,0.18)"
                  : DASHBOARD_COLORS.cardBg,
            }}
          >
            <AssignmentTurnedInIcon
              sx={{ color: copperTextColor, fontSize: "32px" }}
            />
            <Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  color: DASHBOARD_COLORS.textSecondary,
                  display: "block",
                }}
              >
                Remaining Balance Unscheduled
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: DASHBOARD_COLORS.accentStrong,
                  fontFamily: "monospace",
                }}
              >
                {metrics.remainingUnscheduledBalance.toLocaleString()}{" "}
                <span style={{ fontSize: "14px" }}>{metrics.unit}</span>
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 4. VISUAL SCHEDULING DISPATCH PROGRESS CAPACITY TRACKER LINE BAR */}
      <Card
        variant="outlined"
        sx={{
          p: 2,
          mt: 2,
          backgroundColor: DASHBOARD_COLORS.cardBg,
          borderColor: DASHBOARD_COLORS.border,
        }}
      >
        <Box
          sx={{
            mb: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: "bold", color: DASHBOARD_COLORS.textSecondary }}
          >
            CUMULATIVE PRODUCTION SPLIT DISPATCH STATUS BOUNDARY LIMITS
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: "bold", color: progressIndicatorColor }}
          >
            {trackingPercentage}% ALLOCATED
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={trackingPercentage}
          sx={{
            height: 10,
            borderRadius: "4px",
            backgroundColor: "rgba(191,168,90,0.16)",
            "& .MuiLinearProgress-bar": {
              backgroundColor: progressIndicatorColor,
            },
          }}
        />
      </Card>
    </Box>
  );
}
