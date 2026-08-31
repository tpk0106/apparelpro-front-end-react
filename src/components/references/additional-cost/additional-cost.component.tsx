import { useState, useMemo } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import type { PaginationData } from "../../../interfaces/definitions";

import { useGetAdditionalCosts } from "../../../tanstack-hooks/custom-hooks";

import { Box, Typography } from "@mui/material";
import type { AdditionalCost } from "../../../interfaces/references/AdditionalCost";

import AdditionalCostTable from "./additional-cost-table.component";
import { DASHBOARD_COLORS } from "../../dashboard/dashboard-theme";

// The "SCOPED LOOK-AND-FEEL EXPERIMENT" that used to opt this screen and
// AdditionalCostTable out of the shared hook has been reverted (both now use
// useApparelProTable() / DASHBOARD_COLORS like every other reference screen).
// mockupColors is unused now that the breadcrumb below is gone - kept
// commented in case a future one-off need for these values comes up.
// const mockupColors = {
//   bg: "#0A0E14",
//   surface: "#141922",
//   border: "#232a36",
//   text: "#F4F6F8",
//   muted: "#8B93A1",
//   accent: "#93c5fd",
// };

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
        backgroundColor: DASHBOARD_COLORS.pageBg,
        p: 2,
        borderRadius: "12px",
        boxShadow: "0 10px 28px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.3)",
      }}
    >
      <Typography
        sx={{
          textAlign: "center",
          fontSize: "20px",
          fontWeight: 700,
          color: DASHBOARD_COLORS.accentStrong,
          textShadow: "0 2px 6px rgba(0,0,0,0.6), 0 1px 0 rgba(0,0,0,0.4)",
          mb: 0.5,
        }}
      >
        ADDITIONAL COST CATEGORIES
      </Typography>

      <Box
        sx={{
          backgroundColor: DASHBOARD_COLORS.cardBg,
          border: `1px solid ${DASHBOARD_COLORS.border}`,
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
