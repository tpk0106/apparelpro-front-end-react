import { useMemo } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { format, parseISO } from "date-fns";

import type { GeneralPoPrintReportLine } from "./general-po-print-report.types";
import { useApparelProTable } from "../../../../themes/useApparelProTable";

interface Props {
  data: GeneralPoPrintReportLine[];
  isLoading: boolean;
  isError: boolean;
}

export default function GeneralPoPrintReportGrid({
  data,
  isLoading,
  isError,
}: Props) {
  const columns = useMemo<MRT_ColumnDef<GeneralPoPrintReportLine>[]>(
    () => [
      { accessorKey: "refNo", header: "Ref No", size: 100 },
      { accessorKey: "itemCode", header: "Item Code", size: 170 },
      { accessorKey: "description", header: "Description", size: 220 },
      { accessorKey: "unit", header: "Unit", size: 70, enableSorting: false },
      {
        accessorKey: "orderedQuantity",
        header: "Quantity",
        size: 110,
        Cell: ({ cell }) => (
          <span>
            {cell.getValue<number>().toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        ),
      },
      {
        accessorKey: "price",
        header: "U/Price",
        size: 100,
        Cell: ({ cell }) => (
          <span>
            {cell.getValue<number>().toLocaleString(undefined, {
              minimumFractionDigits: 4,
              maximumFractionDigits: 4,
            })}
          </span>
        ),
      },
      {
        accessorKey: "expectedDate",
        header: "Delivery",
        size: 110,
        Cell: ({ cell }) => {
          const value = cell.getValue<string | null>();
          return <span>{value ? format(parseISO(value), "dd-MMM-yyyy") : ""}</span>;
        },
      },
    ],
    [],
  );

  const table = useApparelProTable<GeneralPoPrintReportLine>({
    columns,
    data,
    initialState: { density: "compact" },
    enableEditing: false,
    enableColumnActions: false,
    enableRowActions: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enablePagination: false,
    enableSorting: false,
    state: {
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isLoading,
    },
  });

  return <MaterialReactTable table={table} />;
}
