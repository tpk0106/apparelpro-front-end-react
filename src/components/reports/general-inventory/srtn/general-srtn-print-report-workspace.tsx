import { useMemo } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import { format, parseISO } from "date-fns";

import NotePrintReportWorkspace from "../../common/note-print-report-workspace";
import NotePrintReportGrid from "../../common/note-print-report-grid";
import KpiTile from "../../../common/kpi-tile";
import {
  useDownloadGeneralSrtnPrintPdfMutation,
  useGetGeneralSrtnPrintDetailsQuery,
} from "../../../../tanstack-hooks/general-inventory/general-srtn-print-report.hooks";
import type {
  GeneralSrtnPrintReportDetails,
  GeneralSrtnPrintReportLine,
} from "./general-srtn-print-report.types";

export default function GeneralSrtnPrintReportWorkspace() {
  const columns = useMemo<MRT_ColumnDef<GeneralSrtnPrintReportLine>[]>(
    () => [
      { accessorKey: "itemCode", header: "Item Code", size: 210 },
      { accessorKey: "description", header: "Description", size: 260 },
      { accessorKey: "unit", header: "Unit", size: 70, enableSorting: false },
      {
        accessorKey: "quantity",
        header: "Qty. Returned",
        size: 130,
        Cell: ({ cell }) => (
          <span>
            {cell.getValue<number>().toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <NotePrintReportWorkspace<GeneralSrtnPrintReportDetails>
      title="Supplier Return Note (General Inventory) — Print"
      numberLabel="SRN No"
      useDetailsQuery={useGetGeneralSrtnPrintDetailsQuery}
      useDownloadMutation={useDownloadGeneralSrtnPrintPdfMutation}
      getNotFoundMessage={(n) => `SRN No '${n}' not found.`}
      renderKpiTiles={(details, isLoading) => (
        <>
          <KpiTile label="SRN No" value={details?.header.srtnNumber} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
          <KpiTile label="From Stores" value={details?.header.storeDescription} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
          <KpiTile label="To Supplier" value={details?.header.supplierName} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
          <KpiTile label="Status" value={details?.header.stockType} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
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
