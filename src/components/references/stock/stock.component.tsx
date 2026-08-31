import { useState, useMemo } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import type { PaginationData } from "../../../interfaces/definitions";

import { useGetStocks } from "../../../tanstack-hooks/custom-hooks";

import { Box, ThemeProvider, Typography } from "@mui/material";
import type { Stock } from "../../../interfaces/references/Stock";

import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import StockTable from "./stock-table.component";
import { DASHBOARD_COLORS } from "../../dashboard/dashboard-theme";

// Reference Files > C. Inventory Control > A. Stock Reference (OD_STK1.PRG / OD_STK2.PRG)
// in legacy (RF_MENU.PRG) - the master Stock category list (01 RAW MATERIAL, 02
// ACCESSORIES, etc.) that the Order Items catalog and Garment Type Item
// Requirements pickers key off of. Global theme (useApparelProTable), same as
// Country / Garment Type / Order Item Feature.
const StockReference = () => {
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

  const { data: stockPageData, isLoading, isError } = useGetStocks(paginate);

  const allStocks = stockPageData?.items || [];
  const stocksTotal = stockPageData?.totalItems || 0;

  const columns = useMemo<MRT_ColumnDef<Stock>[]>(
    () => [
      {
        accessorKey: "stockCode",
        header: "Stock Code",
        size: 100,
        enableSorting: false,
        enableEditing: (row) => !row.original.stockCode,
        Cell: ({ renderedCellValue }) => (
          <Box sx={{ display: "flex" }}>
            <span>{renderedCellValue?.toString().toUpperCase()}</span>
          </Box>
        ),
        muiEditTextFieldProps: ({ cell }) => ({
          type: "text",
          required: true,
          error: !!validationErrors?.stockCode,
          style: { textTransform: "uppercase" },
          onBlur: (event) => {
            const validationError = validationRequired(
              event.currentTarget.value,
            )
              ? "Stock Code required"
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
    <div
      className="flex flex-col w-[80%] mx-auto justify-around mt-10"
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
            STOCK REFERENCE CODES
          </Typography>
        </ThemeProvider>
      </div>
      <StockTable
        columns={columns}
        data={allStocks}
        itemsCount={stocksTotal}
        pagination={pagination}
        paginate={paginate}
        setPagination={setPagination}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  );
};

export default StockReference;
