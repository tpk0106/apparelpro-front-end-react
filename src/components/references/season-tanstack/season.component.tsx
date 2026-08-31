import { useState, useMemo } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import { Box, ThemeProvider, Typography } from "@mui/material";

import { type PaginationData } from "../../../interfaces/definitions";
import SeasonTable from "./season-table.component";
import { useGetSeasons } from "../../../tanstack-hooks/custom-hooks";
import type { Season } from "../../../interfaces/references/Season";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import { DASHBOARD_COLORS } from "../../dashboard/dashboard-theme";

const Seasons = () => {
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

  const { data: seasonPageData, isLoading, isError } = useGetSeasons(paginate);

  const allSeasons = seasonPageData?.items || [];
  const seasonsTotal = seasonPageData?.totalItems || 0;

  const columns = useMemo<MRT_ColumnDef<Season>[]>(
    () => [
      {
        accessorKey: "description",
        header: "Description",
        size: 400,
        enableEditing: true,
        enableSorting: false,

        Cell: ({ renderedCellValue }) => (
          <Box sx={{ display: "flex" }}>
            <span>{renderedCellValue?.toString().toUpperCase()}</span>
          </Box>
        ),

        muiEditTextFieldProps: ({ cell }) => ({
          type: "text",
          required: true,
          style: { textTransform: "uppercase" },
          error: !!validationErrors?.description,
          // Description is nvarchar(30) in the DB (SeasonConfig.cs HasMaxLength(30)).
          slotProps: { htmlInput: { maxLength: 30 } },

          onBlur: (event) => {
            const validationError = validationRequired(
              event.currentTarget.value,
            )
              ? "required"
              : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
          },
        }),
      },
      {
        accessorKey: "code",
        header: "Season Code",
        size: 100,
        enableEditing: true,
        enableSorting: false,

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
          // Code is nvarchar(10) in the DB (SeasonConfig.cs HasMaxLength(10)). The
          // backend ignores Code changes on update (SeasonController forces it back to
          // the original before mapping), same convention as Basis Code - no need to
          // disable this field client-side either.
          slotProps: { htmlInput: { maxLength: 10 } },

          onBlur: (event) => {
            const validationError = validationRequired(
              event.currentTarget.value,
            )
              ? "required"
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
    <div
      className="flex flex-col w-[50%] min-w-[700px] mx-auto justify-around mt-10"
      style={{
        backgroundColor: DASHBOARD_COLORS.pageBg,
        borderRadius: 16,
        padding: "1.5rem",
      }}
    >
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography
            sx={{
              color: DASHBOARD_COLORS.accentStrong,
              textShadow: "0 2px 6px rgba(0,0,0,0.6), 0 1px 0 rgba(0,0,0,0.4)",
            }}
          >
            SEASON
          </Typography>
        </ThemeProvider>
      </div>
      <SeasonTable
        columns={columns}
        data={allSeasons}
        itemsCount={seasonsTotal}
        pagination={pagination}
        paginate={paginate}
        setPagination={setPagination}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  );
};

export default Seasons;
