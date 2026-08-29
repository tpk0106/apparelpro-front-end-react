import { useMemo } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import { format, parseISO } from "date-fns";

import NotePrintReportWorkspace from "../../common/note-print-report-workspace";
import NotePrintReportGrid from "../../common/note-print-report-grid";
import KpiTile from "../../../common/kpi-tile";
import {
  useDownloadGeneralPoPrintPdfMutation,
  useGetGeneralPoPrintDetailsQuery,
} from "../../../../tanstack-hooks/general-inventory/general-po-print-report.hooks";
import type {
  GeneralPoPrintReportDetails,
  GeneralPoPrintReportLine,
} from "./general-po-print-report.types";

export default function GeneralPoPrintReportWorkspace() {
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

  return (
    <NotePrintReportWorkspace<GeneralPoPrintReportDetails>
      title="Purchase Order (General Inventory) — Print"
      numberLabel="P/O No"
      useDetailsQuery={useGetGeneralPoPrintDetailsQuery}
      useDownloadMutation={useDownloadGeneralPoPrintPdfMutation}
      getNotFoundMessage={(n) => `P/O No '${n}' not found.`}
      renderKpiTiles={(details, isLoading) => (
        <>
          <KpiTile label="P/O No" value={details?.header.poNumber} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
          <KpiTile label="Supplier" value={details?.header.supplierName} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
          <KpiTile label="Currency" value={details?.header.currencyCode} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
          <KpiTile
            label="Date"
            value={details?.header?.orderDate ? format(parseISO(details.header.orderDate), "dd-MMM-yyyy") : undefined}
            loading={isLoading}
            size={{ xs: 12, sm: 6, md: 3, lg: 12 }}
          />
        </>
      )}
      renderGrid={(details, isLoading, isError) => (
        <NotePrintReportGrid columns={columns} data={details?.lines ?? []} isLoading={isLoading} isError={isError} />
      )}
    />
  );
}
