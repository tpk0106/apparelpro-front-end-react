import { useMemo } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";

import type { GrnPrintReportLine } from "./grn-print-report.types";
import { useApparelProTable } from "../../../../themes/useApparelProTable";

interface Props {
  data: GrnPrintReportLine[];
  isLoading: boolean;
  isError: boolean;
}

export default function GrnPrintReportGrid({
  data,
  isLoading,
  isError,
}: Props) {
  const columns = useMemo<MRT_ColumnDef<GrnPrintReportLine>[]>(
    () => [
      { accessorKey: "itemCode", header: "Item Code", size: 210 },
      { accessorKey: "description", header: "Description", size: 240 },
      { accessorKey: "unit", header: "Unit", size: 70, enableSorting: false },
      {
        accessorKey: "quantity",
        header: "Qty. Received",
        size: 140,
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
        accessorKey: "unitPrice",
        header: "Unit Price",
        size: 110,
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
        accessorKey: "value",
        header: "Value",
        size: 120,
        Cell: ({ row }) => (
          <span>
            {row.original.value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            {row.original.currency}
          </span>
        ),
      },
    ],
    [],
  );

  // Deliberately client-side, NOT server-paginated: this grid always renders the
  // complete, fixed set of lines belonging to one already-committed GRN document —
  // exactly what the PDF export prints. Paginating it here would let the on-screen
  // preview show a different subset of rows than the generated PDF, which defeats
  // the purpose of a print preview.
  const table = useApparelProTable<GrnPrintReportLine>({
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
