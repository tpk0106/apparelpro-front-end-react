import { useEffect, useMemo, useState } from "react";
import { Box, ThemeProvider, Typography } from "@mui/material";
import StyleScopePicker, {
  type StyleScope,
} from "../style-scope/style-scope-picker.component";
import StyleComponentBreakdownTable from "./style-component-breakdown-table.component";
import { useGetComponentBreakdownByStyle } from "../../../tanstack-hooks/production-style-breakdown.hooks";
import type { StyleComponentBreakdown } from "../../../interfaces/production/StyleComponentBreakdown";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";

const StyleComponentBreakdownWorkspace = () => {
  const [scope, setScope] = useState<StyleScope | null>(null);
  const { data: savedRows, isLoading } = useGetComponentBreakdownByStyle(scope);

  const [rows, setRows] = useState<StyleComponentBreakdown[]>([]);

  useEffect(() => {
    setRows(savedRows ?? []);
  }, [savedRows]);

  const scopedRows = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        buyerCode: scope?.buyerCode ?? r.buyerCode,
        order: scope?.order ?? r.order,
        typeCode: scope?.typeCode ?? r.typeCode,
        styleCode: scope?.styleCode ?? r.styleCode,
      })),
    [rows, scope],
  );

  return (
    <div className="flex flex-col w-[80%] mx-auto justify-around mt-10">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Style wise Component Breakdown</Typography>
        </ThemeProvider>
      </div>

      <StyleScopePicker onScopeChange={setScope} />

      {scope && (
        <Box>
          <StyleComponentBreakdownTable
            scope={scope}
            rows={scopedRows}
            setRows={setRows}
            isLoading={isLoading}
          />
        </Box>
      )}
    </div>
  );
};

export default StyleComponentBreakdownWorkspace;
