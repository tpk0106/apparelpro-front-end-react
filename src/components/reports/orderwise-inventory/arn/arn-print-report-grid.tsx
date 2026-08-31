import { useMemo } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";

import type { ArnPrintReportLine } from "./arn-print-report.types";
import { useApparelProTable } from "../../../../themes/useApparelProTable";

interface Props {
  data: ArnPrintReportLine[];
  isLoading: boolean;
  isError: boolean;
}

export default function ArnPrintReportGrid({ data, isLoading, isError }: Props) {
  const numericCell = (value: number, digits = 2) =>
    value.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });

  const columns = useMemo<MRT_ColumnDef<ArnPrintReportLine>[]>(
    () => [
      { accessorKey: "itemCode", header: "Item Code", size: 180 },
      { accessorKey: "description", header: "Description", size: 220 },
      { accessorKey: "unit", header: "Unit", size: 60, enableSorting: false },
      {
        accessorKey: "quantity",
        header: "Qty Rcvd",
        size: 100,
        Cell: ({ cell }) => <span>{numericCell(cell.getValue<number>())}</span>,
      },
      {
        accessorKey: "unitPrice",
        header: "Unit Price",
        size: 100,
        Cell: ({ cell }) => <span>{numericCell(cell.getValue<number>(), 4)}</span>,
      },
      {
        accessorKey: "value",
        header: "Value",
        size: 110,
        Cell: ({ cell }) => <span>{numericCell(cell.getValue<number>())}</span>,
      },
      {
        accessorKey: "balanceToReceive",
        header: "Bal. to Receive",
        size: 120,
        Cell: ({ cell }) => <span>{numericCell(cell.getValue<number>())}</span>,
      },
      { accessorKey: "buyerCode", header: "Buyer", size: 80 },
      { accessorKey: "order", header: "Order", size: 100 },
    ],
    [],
  );

  const table = useApparelProTable<ArnPrintReportLine>({
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
