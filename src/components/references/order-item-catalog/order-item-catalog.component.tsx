import { useState, useMemo } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import type { PaginationData } from "../../../interfaces/definitions";

import {
  useGetOrderItemCatalog,
  useGetStocks,
} from "../../../tanstack-hooks/custom-hooks";

import { Box, MenuItem, ThemeProvider, Typography } from "@mui/material";
import type { OrderItemCatalog } from "../../../interfaces/references/OrderItemCatalog";
import type { Stock } from "../../../interfaces/references/Stock";

import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import OrderItemCatalogTable from "./order-item-catalog-table.component";

// Order Items Catalog (od_itm master list) - the Stock/Item master that legacy
// enters via [F1] help (Stock via F1, Item Code typed and validated against this
// same catalog), e.g. OD_AITM1.PRG. This is the missing "maintain the catalog
// itself" screen for the same OrderItems table the Garment Type Item
// Requirements and Additional Cost per Garment pickers already read from.
// Global theme (useApparelProTable), same as Country / Garment Type / Order Item
// Feature / Stock Reference.
const OrderItemCatalogPage = () => {
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
    data: orderItemCatalogPageData,
    isLoading,
    isError,
  } = useGetOrderItemCatalog(paginate);

  const allOrderItemCatalog = orderItemCatalogPageData?.items || [];
  const orderItemCatalogTotal = orderItemCatalogPageData?.totalItems || 0;

  // Fetch every Stock Reference code for the Stock Code dropdown (large pageSize
  // to effectively get all - same pattern Order Item Feature uses for its
  // Feature 1-4 dropdowns).
  const { data: stockPageData } = useGetStocks({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "stockCode",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });

  const stocks = useMemo<Stock[]>(() => {
    return stockPageData?.items || [];
  }, [stockPageData?.items]);

  const stockSelectMenuProps = {
    MenuProps: {
      PaperProps: {
        sx: {
          backgroundColor: "#ffffff !important",
          "& .MuiMenuItem-root": {
            color: "#000000 !important",
          },
          "& .Mui-selected": {
            backgroundColor: "#e3f2fd !important",
            color: "#000000 !important",
          },
        },
      },
    },
  };

  const columns = useMemo<MRT_ColumnDef<OrderItemCatalog>[]>(
    () => [
      {
        accessorKey: "stockCode",
        header: "Stock Code",
        size: 200,
        enableSorting: false,
        editVariant: "select",
        // Locked once created - identity field, same convention as Order Item
        // Feature's composite key columns.
        enableEditing: (row) => !row.original.stockCode,
        Cell: ({ row }) => (
          <span>
            {row.original.stockCode
              ? `${row.original.stockCode} - ${row.original.stockDescription || ""}`
              : "-"}
          </span>
        ),
        muiEditTextFieldProps: {
          select: true,
          required: true,
          error: !!validationErrors?.stockCode,
          SelectProps: stockSelectMenuProps.MenuProps,
          children: stocks.map((stock) => (
            <MenuItem key={stock.stockCode} value={stock.stockCode}>
              {stock.stockCode} - {stock.description}
            </MenuItem>
          )),
        },
      },
      {
        accessorKey: "itemCode",
        header: "Item Code",
        size: 120,
        enableSorting: false,
        // Legacy (OD_AITM1.PRG) types the Item Code by hand after picking Stock,
        // then validates the pair - same here, free text rather than a second
        // dropdown, matching how legacy actually enters new catalog items.
        enableEditing: (row) => !row.original.itemCode,
        Cell: ({ renderedCellValue }) => (
          <Box sx={{ display: "flex" }}>
            <span>{renderedCellValue?.toString().toUpperCase()}</span>
          </Box>
        ),
        muiEditTextFieldProps: ({ cell }) => ({
          type: "text",
          required: true,
          error: !!validationErrors?.itemCode,
          style: { textTransform: "uppercase" },
          // StockItems.ItemCode is varchar(4) - matches the real 2-4 char codes
          // (01FB, 02ZI, 7NDL, etc.) already seeded in the catalog.
          // NOTE: MUI v9 removed the legacy `inputProps` shorthand from
          // TextField - it's silently ignored now. `slotProps.htmlInput` is the
          // current API that actually reaches the <input> element (same fix as
          // basis.component.tsx's Code field).
          slotProps: { htmlInput: { maxLength: 4 } },
          onBlur: (event) => {
            const validationError = validationRequired(
              event.currentTarget.value,
            )
              ? "Item Code required"
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
    [validationErrors, stocks],
  );

  return (
    <div className="flex flex-col w-[80%] mx-auto justify-around mt-10">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">ORDER ITEMS CATALOG</Typography>
        </ThemeProvider>
      </div>
      <OrderItemCatalogTable
        columns={columns}
        data={allOrderItemCatalog}
        itemsCount={orderItemCatalogTotal}
        pagination={pagination}
        paginate={paginate}
        setPagination={setPagination}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  );
};

export default OrderItemCatalogPage;
