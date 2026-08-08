import { useState, useMemo } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import type { PaginationData } from "../../../interfaces/definitions";

import {
  useGetOrderItemFeatures,
  useGetItemFeatures,
} from "../../../tanstack-hooks/custom-hooks";

import { Box, MenuItem, ThemeProvider, Typography } from "@mui/material";
import type { OrderItemFeature } from "../../../interfaces/references/OrderItemFeature";
import type { ItemFeature } from "../../../interfaces/references/ItemFeature";

import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import OrderItemFeatureTable from "./order-item-feature-table.component";

const OrderItemFeatures = () => {
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
    data: orderItemFeaturePageData,
    isLoading,
    isError,
  } = useGetOrderItemFeatures(paginate);

  // Fetch Item Features for the Feature 1-4 dropdown menus (large pageSize to effectively get all)
  const { data: itemFeaturePageData } = useGetItemFeatures({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "featureCode",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });

  const allOrderItemFeatures = orderItemFeaturePageData?.items || [];
  const orderItemFeaturesTotal = orderItemFeaturePageData?.totalItems || 0;

  const itemFeatures = useMemo<ItemFeature[]>(() => {
    return itemFeaturePageData?.items || [];
  }, [itemFeaturePageData?.items]);

  const renderFeatureOptions = () =>
    itemFeatures.map((itemFeature) => (
      <MenuItem key={itemFeature.featureCode} value={itemFeature.featureCode}>
        <Typography variant="body2" sx={{ color: "#000000" }}>
          <strong>{itemFeature.featureCode}</strong> - {itemFeature.description}
        </Typography>
      </MenuItem>
    ));

  const featureSelectMenuProps = {
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

  const columns = useMemo<MRT_ColumnDef<OrderItemFeature>[]>(
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
        accessorKey: "itemCode",
        header: "Item Code",
        size: 100,
        enableSorting: false,
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
        accessorKey: "feature1Type",
        header: "Feature 1",
        size: 180,
        enableSorting: false,
        editVariant: "select",
        Cell: ({ row }) => (
          <span>{row.original.feature1Name || row.original.feature1Type || "-"}</span>
        ),
        muiEditTextFieldProps: {
          select: true,
          SelectProps: featureSelectMenuProps,
          children: renderFeatureOptions(),
        },
      },
      {
        accessorKey: "feature2Type",
        header: "Feature 2",
        size: 180,
        enableSorting: false,
        editVariant: "select",
        Cell: ({ row }) => (
          <span>{row.original.feature2Name || row.original.feature2Type || "-"}</span>
        ),
        muiEditTextFieldProps: {
          select: true,
          SelectProps: featureSelectMenuProps,
          children: renderFeatureOptions(),
        },
      },
      {
        accessorKey: "feature3Type",
        header: "Feature 3",
        size: 180,
        enableSorting: false,
        editVariant: "select",
        Cell: ({ row }) => (
          <span>{row.original.feature3Name || row.original.feature3Type || "-"}</span>
        ),
        muiEditTextFieldProps: {
          select: true,
          SelectProps: featureSelectMenuProps,
          children: renderFeatureOptions(),
        },
      },
      {
        accessorKey: "feature4Type",
        header: "Feature 4",
        size: 180,
        enableSorting: false,
        editVariant: "select",
        Cell: ({ row }) => (
          <span>{row.original.feature4Name || row.original.feature4Type || "-"}</span>
        ),
        muiEditTextFieldProps: {
          select: true,
          SelectProps: featureSelectMenuProps,
          children: renderFeatureOptions(),
        },
      },
      {
        accessorKey: "costPerUnit",
        header: "Cost Per Unit",
        size: 120,
        enableSorting: false,
        muiEditTextFieldProps: {
          type: "number",
        },
      },
    ],
    [validationErrors, itemFeatures],
  );

  return (
    <div className="flex flex-col w-[80%] mx-auto justify-around mt-10">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">ORDER ITEM FEATURES</Typography>
        </ThemeProvider>
      </div>
      <OrderItemFeatureTable
        columns={columns}
        data={allOrderItemFeatures}
        itemsCount={orderItemFeaturesTotal}
        pagination={pagination}
        paginate={paginate}
        setPagination={setPagination}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  );
};

export default OrderItemFeatures;
