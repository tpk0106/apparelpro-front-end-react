import { useState, useMemo } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import type { PaginationData } from "../../../../interfaces/definitions";

import GarmentComponentTable from "./garment-component-table.component";
import { useGetGarmentComponents } from "../../../../tanstack-hooks/production-reference.hooks";

import { Box, ThemeProvider, Typography } from "@mui/material";
import type { GarmentComponent } from "../../../../interfaces/production/GarmentComponent";
import { asideMenuTitleTypographyTheme } from "../../../../themes/themes";

const GarmentComponents = () => {
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
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

  const { data: pageData, isLoading, isError } =
    useGetGarmentComponents(paginate);

  const allComponents = pageData?.items || [];
  const componentsTotal = pageData?.totalItems || 0;

  const columns = useMemo<MRT_ColumnDef<GarmentComponent>[]>(
    () => [
      {
        accessorKey: "componentCode",
        header: "Code",
        size: 100,
        enableEditing: (row) => !row?.original?.componentCode,
      },
      {
        accessorKey: "description",
        header: "Component",
        size: 250,
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col w-[60%] mx-auto justify-around mt-10">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Component Reference</Typography>
        </ThemeProvider>
      </div>
      <Box>
        <GarmentComponentTable
          columns={columns}
          data={allComponents}
          itemsCount={componentsTotal}
          pagination={pagination}
          paginate={paginate}
          setPagination={setPagination}
          isLoading={isLoading}
          isError={isError}
        />
      </Box>
    </div>
  );
};

export default GarmentComponents;
