import { useState, useMemo } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import type { PaginationData } from "../../../interfaces/definitions";

import { useGetAdditionalCosts } from "../../../tanstack-hooks/custom-hooks";

import { Box, Typography } from "@mui/material";
import type { AdditionalCost } from "../../../interfaces/references/AdditionalCost";

import AdditionalCostTable from "./additional-cost-table.component";

// SCOPED LOOK-AND-FEEL EXPERIMENT (2026-08-08, per user request): this screen and
// AdditionalCostTable intentionally do NOT use the shared asideMenuTitleTypographyTheme /
// useApparelProTable() hook that every other reference screen uses (compare
// order-item-feature.component.tsx, which this file was cloned from). Instead they carry
// their own local dark-card styling matching the "Additional Costs per Garment" mockup the
// user approved, so this experiment stays fully isolated to these two files - reverting to
// the standard look is just restoring this file and additional-cost-table.component.tsx to
// their pre-2026-08-08 versions, nothing shared was touched.
const mockupColors = {
  bg: "#0A0E14",
  surface: "#141922",
  border: "#232a36",
  text: "#F4F6F8",
  muted: "#8B93A1",
  accent: "#93c5fd",
};

const AdditionalCosts = () => {
  const [validationErrors, setValidationErrors] =
    useState<Record<string, string | undefined>>();

  const validationRequired = (value: string) => !value?.length;

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const paginate = useMemo<PaginationData>(
    () => ({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sortColumn: null,
      sortOrder: null,
      filterColumn: null,
      filterQuery: null,
    }),
    [pagination],
  );

  const {
    data: additionalCostPageData,
    isLoading,
    isError,
  } = useGetAdditionalCosts(paginate);

  const allAdditionalCosts = additionalCostPageData?.items || [];
  const additionalCostsTotal = additionalCostPageData?.totalItems || 0;

  const columns = useMemo<MRT_ColumnDef<AdditionalCost>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Code",
        size: 100,
        enableSorting: false,
        enableEditing: (row) => !row.original.code,
        Cell: ({ renderedCellValue }) => (
          <Box sx={{ display: "flex" }}>
            <span>{renderedCellValue?.toString().toUpperCase()}</span>
          </Box>
        ),
        muiEditTextFieldProps: ({ cell }) => ({
          type: "text",
          required: true,
          error: !!validationErrors?.code,
          style: { textTransform: "uppercase" },
          onBlur: (event) => {
            const validationError = validationRequired(
              event.currentTarget.value,
            )
              ? "Code required"
              : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
          },
        }),
      },
      {
        accessorKey: "description",
        header: "Description",
        size: 260,
        enableSorting: false,
        muiEditTextFieldProps: ({ cell }) => ({
          type: "text",
          required: true,
          error: !!validationErrors?.description,
          onBlur: (event) => {
            const validationError = validationRequired(
              event.currentTarget.value,
            )
              ? "Description required"
              : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
          },
        }),
      },
    ],
    [validationErrors],
  );

  return (
    <Box
      sx={{
        width: "80%",
        mx: "auto",
        mt: 5,
        backgroundColor: mockupColors.bg,
        p: 2,
        borderRadius: "12px",
      }}
    >
      <Typography
        sx={{
          textAlign: "center",
          fontSize: "20px",
          fontWeight: 700,
          color: mockupColors.accent,
          mb: 0.5,
        }}
      >
        ADDITIONAL COST CATEGORIES
      </Typography>
      <Typography
        sx={{
          textAlign: "center",
          color: mockupColors.muted,
          fontSize: "12px",
          mb: 2.5,
        }}
      >
        Order Management Reference &rsaquo; Additional Cost
      </Typography>

      <Box
        sx={{
          backgroundColor: mockupColors.surface,
          border: `1px solid ${mockupColors.border}`,
          borderRadius: "10px",
          p: 2,
        }}
      >
        <AdditionalCostTable
          columns={columns}
          data={allAdditionalCosts}
          itemsCount={additionalCostsTotal}
          pagination={pagination}
          paginate={paginate}
          setPagination={setPagination}
          isLoading={isLoading}
          isError={isError}
        />
      </Box>
    </Box>
  );
};

export default AdditionalCosts;
