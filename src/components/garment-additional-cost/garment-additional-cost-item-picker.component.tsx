import { Box, Typography, CircularProgress } from "@mui/material";
import type {
  MaterialCatalogGroup,
  MaterialSelection,
} from "../material-consumption/material-consumption.types";
import { DASHBOARD_COLORS } from "../dashboard/dashboard-theme";
import { copperTextColor } from "../../themes/button-color-themes";

// Deliberately NOT MaterialMasterList (the MaterialReactTable-based picker Material
// Consumption uses) - that component is wired to the shared useApparelProTable() look.
// This is a plain styled list reusing the same catalog data/hook, so the visual stays
// isolated to this screen while the data-fetching stays fully shared.
interface ItemPickerProps {
  catalogGroups: MaterialCatalogGroup[];
  isLoading: boolean;
  selectedMaterial: MaterialSelection | null;
  onSelectMaterial: (material: MaterialSelection) => void;
}

export default function GarmentAdditionalCostItemPicker({
  catalogGroups,
  isLoading,
  selectedMaterial,
  onSelectMaterial,
}: ItemPickerProps) {
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        <CircularProgress size={28} sx={{ color: copperTextColor }} />
      </Box>
    );
  }

  if (catalogGroups.length === 0) {
    return (
      <Typography sx={{ color: DASHBOARD_COLORS.textSecondary, fontSize: "12.5px", p: 1 }}>
        No materials catalogued yet.
      </Typography>
    );
  }

  return (
    <Box sx={{ overflowY: "auto", maxHeight: "440px" }}>
      {catalogGroups.map((group) => (
        <Box key={group.stockCode} sx={{ mb: 1 }}>
          <Typography
            sx={{
              fontSize: "12px",
              color: DASHBOARD_COLORS.textSecondary,
              borderBottom: `1px solid ${DASHBOARD_COLORS.border}`,
              py: 0.5,
              px: 0.5,
              textTransform: "uppercase",
            }}
          >
            {group.description}
          </Typography>
          {group.items.map((item) => {
            const isSelected =
              selectedMaterial?.stockCode === group.stockCode &&
              selectedMaterial?.itemCode === item.itemCode;
            return (
              <Box
                key={item.itemCode}
                onClick={() =>
                  onSelectMaterial({
                    stockCode: group.stockCode,
                    itemCode: item.itemCode,
                    description: item.description,
                  })
                }
                sx={{
                  fontSize: "13px",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  margin: "3px 0",
                  cursor: "pointer",
                  color: isSelected ? copperTextColor : DASHBOARD_COLORS.textPrimary,
                  backgroundColor: isSelected
                    ? "rgba(201,128,61,0.15)"
                    : "transparent",
                  border: isSelected
                    ? `1px solid ${copperTextColor}`
                    : "1px solid transparent",
                  "&:hover": {
                    backgroundColor: isSelected
                      ? "rgba(201,128,61,0.15)"
                      : "rgba(255, 255, 255, 0.04)",
                  },
                }}
              >
                {item.itemCode} — {item.description}
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
}
