import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { DailyProductionTimeTicketEntry } from "../../interfaces/production/DailyProductionTimeTicket";

interface TicketScope {
  date: string;
  lineCode: string;
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
}

// Picks exactly the fields this endpoint's [FromQuery] model expects, rather
// than passing the whole `scope` object as `params` - TicketScope is narrow
// here, but a caller building this from the shared StyleScope picker output
// (which also carries buyerName/typeName) can satisfy this interface
// structurally while still smuggling those extra fields through at runtime,
// since TypeScript's excess-property check only fires on a fresh object
// literal, not on a variable passed through. Explicit picking here closes
// that off regardless of what a future caller passes.
const toQueryParams = (scope: TicketScope) => ({
  date: scope.date,
  lineCode: scope.lineCode,
  buyerCode: scope.buyerCode,
  order: scope.order,
  typeCode: scope.typeCode,
  styleCode: scope.styleCode,
});

const loadTicket = async (scope: TicketScope) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DAILY_PRODUCTION_TIME_TICKET.GET, {
    params: toQueryParams(scope),
  });
};

const bulkSaveTicket = async (
  scope: TicketScope,
  records: Pick<
    DailyProductionTimeTicketEntry,
    "employeeCode" | "operationCode" | "quantity" | "nonProductiveHourCode" | "nonProductiveHours" | "workHours"
  >[],
) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DAILY_PRODUCTION_TIME_TICKET.BULK_SAVE,
    records,
    { params: toQueryParams(scope) },
  );
};

export { loadTicket, bulkSaveTicket };
export type { TicketScope };
