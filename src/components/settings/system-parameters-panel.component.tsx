import { useMemo } from "react";
import {
  Box,
  Typography,
  Switch,
  TextField,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import {
  useGetSystemParametersQuery,
  useUpdateSystemParameterMutation,
} from "../../tanstack-hooks/custom-hooks";
import type { SystemParameter } from "../../interfaces/system-configuration/SystemParameter";
import { isAdministrator } from "../../auth/jwt.util";

// Converts a PascalCase parameter key (e.g. "AllowOrderQuantityOverride") into a
// readable label ("Allow Order Quantity Override") without needing a separate
// DisplayName column on the backend.
function formatParameterKeyAsLabel(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
}

// DataType = "Select" parameters store their choices as comma-separated
// "label:value" pairs, e.g. "10 rows:10,25 rows:25,50 rows:50".
function parseSelectOptions(
  options: string | null,
): { label: string; value: string }[] {
  if (!options) return [];
  return options
    .split(",")
    .map((pair) => pair.split(":"))
    .filter((parts) => parts.length === 2)
    .map(([label, value]) => ({ label: label.trim(), value: value.trim() }));
}

// A small, fixed palette for DataType = "Color" parameters - a swatch picker
// rather than a raw <input type="color">, consistent with the approved design.
const COLOR_SWATCHES = ["#60a5fa", "#34d399", "#f472b6", "#fbbf24", "#a78bfa"];

interface ParameterRowProps {
  parameter: SystemParameter;
  isAdmin: boolean;
  isSaving: boolean;
  onSave: (parameterKey: string, value: string) => void;
}

const ParameterRow = ({
  parameter,
  isAdmin,
  isSaving,
  onSave,
}: ParameterRowProps) => {
  const disabled = !isAdmin || isSaving;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 3,
        py: 2.25,
        px: 2.5,
        borderBottom: "1px solid rgba(139, 147, 161, 0.15)",
        "&:last-of-type": { borderBottom: "none" },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: "13.5px", fontWeight: 500 }}>
          {formatParameterKeyAsLabel(parameter.parameterKey)}
        </Typography>
        {parameter.description && (
          <Typography
            sx={{
              fontSize: "12px",
              color: "text.secondary",
              mt: 0.5,
              maxWidth: 520,
              lineHeight: 1.5,
            }}
          >
            {parameter.description}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 1,
          pt: 0.25,
        }}
      >
        {parameter.dataType === "Boolean" && (
          <Switch
            checked={parameter.value === "true"}
            disabled={disabled}
            onChange={(event) =>
              onSave(
                parameter.parameterKey,
                event.target.checked ? "true" : "false",
              )
            }
          />
        )}

        {parameter.dataType === "Color" && (
          <Box sx={{ display: "flex", gap: 1 }}>
            {COLOR_SWATCHES.map((swatch) => (
              <Box
                key={swatch}
                onClick={() =>
                  !disabled && onSave(parameter.parameterKey, swatch)
                }
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: "8px",
                  backgroundColor: swatch,
                  cursor: disabled ? "not-allowed" : "pointer",
                  border:
                    parameter.value === swatch
                      ? "2px solid #fff"
                      : "2px solid transparent",
                  opacity: disabled ? 0.5 : 1,
                }}
              />
            ))}
          </Box>
        )}

        {parameter.dataType === "Number" && (
          <TextField
            type="number"
            size="small"
            defaultValue={parameter.value}
            disabled={disabled}
            onBlur={(event) => {
              if (event.target.value !== parameter.value) {
                onSave(parameter.parameterKey, event.target.value);
              }
            }}
            sx={{ width: 100 }}
            slotProps={{ htmlInput: { style: { textAlign: "right" } } }}
          />
        )}

        {parameter.dataType === "Select" && (
          <TextField
            select
            size="small"
            value={parameter.value}
            disabled={disabled}
            onChange={(event) =>
              onSave(parameter.parameterKey, event.target.value)
            }
            sx={{ minWidth: 160 }}
          >
            {parseSelectOptions(parameter.options).map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        )}

        {parameter.dataType === "Text" && (
          <TextField
            size="small"
            defaultValue={parameter.value}
            disabled={disabled}
            onBlur={(event) => {
              if (event.target.value !== parameter.value) {
                onSave(parameter.parameterKey, event.target.value);
              }
            }}
            sx={{ minWidth: 200 }}
          />
        )}

        {isSaving && <CircularProgress size={16} />}
      </Box>
    </Box>
  );
};

const SystemParametersPanel = () => {
  const isAdmin = isAdministrator();
  const {
    data: parameters,
    isLoading,
    isError,
  } = useGetSystemParametersQuery();
  const updateMutation = useUpdateSystemParameterMutation();

  const parametersByCategory = useMemo(() => {
    const grouped = new Map<string, SystemParameter[]>();
    (parameters ?? []).forEach((parameter) => {
      const bucket = grouped.get(parameter.category) ?? [];
      bucket.push(parameter);
      grouped.set(parameter.category, bucket);
    });
    return grouped;
  }, [parameters]);

  const handleSave = (parameterKey: string, value: string) => {
    updateMutation.mutate({ parameterKey, value });
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          System Parameters
        </Typography>
        <Typography sx={{ fontSize: "13px", color: "text.secondary", mt: 0.5 }}>
          Global configuration for order validation and system behaviour.
          Changes apply immediately across all users.
        </Typography>
      </Box>

      {!isAdmin && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 3,
            py: 1.25,
            px: 2,
            borderRadius: "10px",
            backgroundColor: "rgba(251, 191, 36, 0.12)",
            border: "1px solid rgba(251, 191, 36, 0.3)",
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 18, color: "#fbbf24" }} />
          <Typography sx={{ fontSize: "12.5px", color: "#fde68a" }}>
            Read-only — only an Administrator can change these settings.
          </Typography>
        </Box>
      )}

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {isError && (
        <Typography sx={{ color: "#f87171", fontSize: "13px" }}>
          Could not load System Parameters. Please try again.
        </Typography>
      )}

      {Array.from(parametersByCategory.entries()).map(
        ([category, categoryParameters]) => (
          <Box
            key={category}
            sx={{
              mb: 2.5,
              borderRadius: "14px",
              border: "1px solid rgba(139, 147, 161, 0.15)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                py: 1.75,
                px: 2.5,
                borderBottom: "1px solid rgba(139, 147, 161, 0.15)",
                backgroundColor: "rgba(96, 165, 250, 0.06)",
              }}
            >
              <Typography sx={{ fontSize: "13.5px", fontWeight: 600 }}>
                {category}
              </Typography>
            </Box>

            {categoryParameters.map((parameter) => (
              <ParameterRow
                key={parameter.parameterKey}
                parameter={parameter}
                isAdmin={isAdmin}
                onSave={handleSave}
                isSaving={
                  updateMutation.isPending &&
                  updateMutation.variables?.parameterKey ===
                    parameter.parameterKey
                }
              />
            ))}
          </Box>
        ),
      )}
    </Box>
  );
};

export default SystemParametersPanel;
