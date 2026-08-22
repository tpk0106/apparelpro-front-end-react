// TanStack Query hooks for Daily Production Time Ticket (PR_DPTT1.PRG).

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { toast } from "react-toastify";

import type { DailyProductionTimeTicket } from "../interfaces/production/DailyProductionTimeTicket";
import {
  loadTicket,
  bulkSaveTicket,
  type TicketScope,
} from "../services/production/daily-production-time-ticket.service";

const scopeKey = (scope: TicketScope | null) =>
  scope
    ? [scope.date, scope.lineCode, scope.buyerCode, scope.order, scope.typeCode, scope.styleCode]
    : [];

export const useGetDailyProductionTimeTicket = (scope: TicketScope | null) => {
  return useQuery<DailyProductionTimeTicket, Error>({
    queryKey: ["dailyProductionTimeTicket", ...scopeKey(scope)],
    queryFn: async () => {
      const response: AxiosResponse<DailyProductionTimeTicket> = await loadTicket(scope!);
      return response.data;
    },
    enabled: !!scope,
  });
};

export const useBulkSaveDailyProductionTimeTicketMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    DailyProductionTimeTicket,
    Error,
    { scope: TicketScope; records: DailyProductionTimeTicket["entries"] }
  >({
    mutationFn: async ({ scope, records }) => {
      const payload = records.map((r) => ({
        employeeCode: r.employeeCode,
        operationCode: r.operationCode,
        quantity: r.quantity,
        nonProductiveHourCode: r.nonProductiveHourCode,
        nonProductiveHours: r.nonProductiveHours,
        workHours: r.workHours,
      }));
      const response: AxiosResponse<DailyProductionTimeTicket> = await bulkSaveTicket(scope, payload);
      return response.data;
    },
    onSuccess: (_, { scope }) => {
      queryClient.invalidateQueries({ queryKey: ["dailyProductionTimeTicket", ...scopeKey(scope)] });
      toast.success("Daily production time ticket saved successfully");
    },
    onError: (error) => toast.error(`Save failed: ${error.message}`),
  });
};
