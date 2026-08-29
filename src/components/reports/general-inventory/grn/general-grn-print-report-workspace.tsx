import { useMemo } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import { format, parseISO } from "date-fns";

import NotePrintReportWorkspace from "../../common/note-print-report-workspace";
import NotePrintReportGrid from "../../common/note-print-report-grid";
import KpiTile from "../../../common/kpi-tile";
import {
  useDownloadGeneralGrnPrintPdfMutation,
  useGetGeneralGrnPrintDetailsQuery,
} from "../../../../tanstack-hooks/general-inventory/general-grn-print-report.hooks";
import type {
  GeneralGrnPrintReportDetails,
  GeneralGrnPrintReportLine,
} from "./general-grn-print-report.types";

export default function GeneralGrnPrintReportWorkspace() {
  const columns = useMemo<MRT_ColumnDef<GeneralGrnPrintReportLine>[]>(
    () => [
      { accessorKey: "storeCode", header: "Store", size: 80 },
      { accessorKey: "itemCode", header: "Item Code", size: 210 },
      { accessorKey: "description", header: "Description", size: 260 },
      { accessorKey: "unit", header: "Unit", size: 70, enableSorting: false },
      {
        accessorKey: "quantity",
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
        header: "Price",
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
    ],
    [],
  );

  return (
    <NotePrintReportWorkspace<GeneralGrnPrintReportDetails>
      title="Goods Received Note (General Inventory) — Print"
      numberLabel="GRN No"
      useDetailsQuery={useGetGeneralGrnPrintDetailsQuery}
      useDownloadMutation={useDownloadGeneralGrnPrintPdfMutation}
      getNotFoundMessage={(n) => `GRN No '${n}' not found.`}
      renderKpiTiles={(details, isLoading) => (
        <>
          <KpiTile label="GRN No" value={details?.header.grnNumber} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
          <KpiTile label="P/O No" value={details?.header.poNumber} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
          <KpiTile label="Supplier" value={details?.header.supplierCode} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
          <KpiTile label="Currency" value={details?.header.currencyCode} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
          <KpiTile
            label="Date"
            value={details?.header?.transactionDate && format(parseISO(details.header.transactionDate), "dd-MMM-yyyy")}
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
