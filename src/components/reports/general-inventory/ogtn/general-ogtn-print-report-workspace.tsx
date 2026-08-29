import { useMemo } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import { format, parseISO } from "date-fns";

import NotePrintReportWorkspace from "../../common/note-print-report-workspace";
import NotePrintReportGrid from "../../common/note-print-report-grid";
import KpiTile from "../../../common/kpi-tile";
import {
  useDownloadOrderGtnPrintPdfMutation,
  useGetOrderGtnPrintDetailsQuery,
} from "../../../../tanstack-hooks/general-inventory/general-ogtn-print-report.hooks";
import { OrderGtnDirection } from "../../../../interfaces/general-inventory/general-ogtn.types";
import type {
  OrderGtnPrintReportDetails,
  OrderGtnPrintReportLine,
} from "./general-ogtn-print-report.types";

const DIRECTION_LABELS: Record<string, string> = {
  [OrderGtnDirection.GeneralToOrder]: "General Stores -> Buyer/Order",
  [OrderGtnDirection.OrderToGeneral]: "Buyer/Order -> General Stores",
};

export default function GeneralOgtnPrintReportWorkspace() {
  const columns = useMemo<MRT_ColumnDef<OrderGtnPrintReportLine>[]>(
    () => [
      { accessorKey: "storeCode", header: "Store", size: 90 },
      { accessorKey: "itemCode", header: "Item Code", size: 180 },
      { accessorKey: "description", header: "Description", size: 240 },
      { accessorKey: "unit", header: "Unit", size: 70, enableSorting: false },
      {
        accessorKey: "quantity",
        header: "Quantity",
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
    <NotePrintReportWorkspace<OrderGtnPrintReportDetails>
      title="Goods Transfer Note (Orders) — Print"
      numberLabel="OGTN No"
      useDetailsQuery={useGetOrderGtnPrintDetailsQuery}
      useDownloadMutation={useDownloadOrderGtnPrintPdfMutation}
      getNotFoundMessage={(n) => `OGTN No '${n}' not found.`}
      renderKpiTiles={(details, isLoading) => (
        <>
          <KpiTile label="OGTN No" value={details?.header.ogtnNumber} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
          <KpiTile
            label="Direction"
            value={details?.header?.direction ? DIRECTION_LABELS[details.header.direction] : undefined}
            loading={isLoading}
            size={{ xs: 12, sm: 6, md: 3, lg: 12 }}
          />
          <KpiTile label="Buyer" value={details?.header.buyerName} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
          <KpiTile label="Order" value={details?.header.order} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
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
