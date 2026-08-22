import { useState, useMemo } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import type { PaginationData } from "../../../../interfaces/definitions";

import MachineTypeTable from "./machine-type-table.component";
import { useGetMachineTypes } from "../../../../tanstack-hooks/production-reference.hooks";

import { Box, ThemeProvider, Typography } from "@mui/material";
import type { MachineType } from "../../../../interfaces/production/MachineType";
import { asideMenuTitleTypographyTheme } from "../../../../themes/themes";

const MachineTypes = () => {
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

  const { data: pageData, isLoading, isError } = useGetMachineTypes(paginate);

  const allMachineTypes = pageData?.items || [];
  const machineTypesTotal = pageData?.totalItems || 0;

  const columns = useMemo<MRT_ColumnDef<MachineType>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Code",
        size: 100,
        enableEditing: (row) => !row?.original?.code,
      },
      {
        accessorKey: "description",
        header: "Description",
        size: 250,
      },
      {
        accessorKey: "isManual",
        header: "Manual",
        size: 100,
        editVariant: "select",
        editSelectOptions: [
          { label: "Yes", value: true as unknown as string },
          { label: "No", value: false as unknown as string },
        ],
        Cell: ({ cell }) => (cell.getValue<boolean>() ? "Yes" : "No"),
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col w-[60%] mx-auto justify-around mt-10">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Machine Type Reference</Typography>
        </ThemeProvider>
      </div>
      <Box>
        <MachineTypeTable
          columns={columns}
          data={allMachineTypes}
          itemsCount={machineTypesTotal}
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

export default MachineTypes;
