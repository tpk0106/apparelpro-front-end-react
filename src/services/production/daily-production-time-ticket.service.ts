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

const loadTicket = async (scope: TicketScope) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DAILY_PRODUCTION_TIME_TICKET.GET, {
    params: scope,
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
    { params: scope },
  );
};

export { loadTicket, bulkSaveTicket };
export type { TicketScope };
