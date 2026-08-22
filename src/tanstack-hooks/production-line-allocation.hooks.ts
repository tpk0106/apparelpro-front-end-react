// TanStack Query hooks for Holiday (Calendar), Production Line Allocation
// (PR_ESTM1.PRG) and Estimated Production Line Allocation (PR_ESTL1.PRG).

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { toast } from "react-toastify";

import type { PaginationData } from "../interfaces/definitions";
import type { PaginationAPIModel } from "../interfaces/references/ApiResult";

import type { Holiday } from "../interfaces/production/Holiday";
import { loadHolidays, createNewHoliday, deleteHoliday } from "../services/production/holiday.service";

import type {
  ProductionLineAllocation,
  ManualAllocateProductionLine,
  AutomaticAllocateProductionLine,
  ProductionLineAllocationResult,
} from "../interfaces/production/ProductionLineAllocation";
import {
  loadAllocationsByShipment,
  manualAllocate as manualAllocateProductionLine,
  automaticAllocate as automaticAllocateProductionLine,
  deleteAllocation as deleteProductionLineAllocation,
} from "../services/production/production-line-allocation.service";

import type {
  EstimatedProductionLineAllocation,
  ManualAllocateEstimatedProductionLine,
  AutomaticAllocateEstimatedProductionLine,
  EstimatedProductionLineAllocationResult,
} from "../interfaces/production/EstimatedProductionLineAllocation";
import {
  loadAllocation as loadEstimatedAllocation,
  manualAllocate as manualAllocateEstimatedProductionLine,
  automaticAllocate as automaticAllocateEstimatedProductionLine,
  deleteAllocation as deleteEstimatedProductionLineAllocation,
} from "../services/production/estimated-production-line-allocation.service";

// ---------------------------------------------------------------------------
// Holiday (Calendar)
// ---------------------------------------------------------------------------

export const useGetHolidays = (paginate: PaginationData) => {
  return useQuery<PaginationAPIModel<Holiday>, Error>({
    queryKey: ["holidays", paginate.pageIndex, paginate.pageSize],
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<Holiday>> = await loadHolidays(paginate);
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateHolidayMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, Holiday>({
    mutationFn: async (newHoliday: Holiday) => {
      await createNewHoliday(newHoliday);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      toast.success("Holiday added successfully");
    },
    onError: (error) => toast.error(`Create failed: ${error.message}`),
  });
};

export const useDeleteHolidayMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (date: string) => {
      await deleteHoliday(date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      toast.success("Holiday deleted successfully");
    },
    onError: (error) => toast.error(`Delete failed: ${error.message}`),
  });
};

// ---------------------------------------------------------------------------
// Production Line Allocation (per shipment)
// ---------------------------------------------------------------------------

interface ShipmentScope {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  shipmentOrder: string;
}

export const useGetProductionLineAllocationsByShipment = (scope: ShipmentScope | null) => {
  return useQuery<ProductionLineAllocation[], Error>({
    queryKey: [
      "productionLineAllocations",
      scope?.buyerCode,
      scope?.order,
      scope?.typeCode,
      scope?.styleCode,
      scope?.shipmentOrder,
    ],
    queryFn: async () => {
      const response: AxiosResponse<ProductionLineAllocation[]> = await loadAllocationsByShipment(
        scope!.buyerCode,
        scope!.order,
        scope!.typeCode,
        scope!.styleCode,
        scope!.shipmentOrder,
      );
      return response.data;
    },
    enabled: !!scope,
  });
};

export const useManualAllocateProductionLineMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<ProductionLineAllocation, Error, ManualAllocateProductionLine>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<ProductionLineAllocation> = await manualAllocateProductionLine(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productionLineAllocations"] });
      toast.success("Production line allocated successfully");
    },
    onError: (error) => toast.error(`Allocation failed: ${error.message}`),
  });
};

export const useAutomaticAllocateProductionLineMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<ProductionLineAllocationResult, Error, AutomaticAllocateProductionLine>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<ProductionLineAllocationResult> =
        await automaticAllocateProductionLine(payload);
      return response.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["productionLineAllocations"] });
      if (result.unallocatedQuantity > 0) {
        toast.warning(
          `Unable to fully allocate - ${result.unallocatedQuantity.toFixed(0)} unallocated`,
        );
      } else {
        toast.success("Production lines allocated automatically");
      }
    },
    onError: (error) => toast.error(`Allocation failed: ${error.message}`),
  });
};

export const useDeleteProductionLineAllocationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, ShipmentScope & { lineCode: string }>({
    mutationFn: async (payload) => {
      await deleteProductionLineAllocation(
        payload.buyerCode, payload.order, payload.typeCode,
        payload.styleCode, payload.shipmentOrder, payload.lineCode,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productionLineAllocations"] });
      toast.success("Allocation deleted successfully");
    },
    onError: (error) => toast.error(`Delete failed: ${error.message}`),
  });
};

// ---------------------------------------------------------------------------
// Estimated Production Line Allocation (pre-order planning)
// ---------------------------------------------------------------------------

export const useGetEstimatedProductionLineAllocation = (
  buyerCode: number | null,
  styleCode: string | null,
) => {
  return useQuery<EstimatedProductionLineAllocation | null, Error>({
    queryKey: ["estimatedProductionLineAllocation", buyerCode, styleCode],
    queryFn: async () => {
      try {
        const response: AxiosResponse<EstimatedProductionLineAllocation> =
          await loadEstimatedAllocation(buyerCode!, styleCode!);
        return response.data;
      } catch {
        return null;
      }
    },
    enabled: !!buyerCode && !!styleCode,
  });
};

export const useManualAllocateEstimatedProductionLineMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<EstimatedProductionLineAllocation, Error, ManualAllocateEstimatedProductionLine>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<EstimatedProductionLineAllocation> =
        await manualAllocateEstimatedProductionLine(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estimatedProductionLineAllocation"] });
      toast.success("Estimated line allocation saved successfully");
    },
    onError: (error) => toast.error(`Allocation failed: ${error.message}`),
  });
};

export const useAutomaticAllocateEstimatedProductionLineMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<EstimatedProductionLineAllocationResult, Error, AutomaticAllocateEstimatedProductionLine>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<EstimatedProductionLineAllocationResult> =
        await automaticAllocateEstimatedProductionLine(payload);
      return response.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["estimatedProductionLineAllocation"] });
      if (result.unallocatedQuantity > 0) {
        toast.warning(
          `Unable to fully allocate - ${result.unallocatedQuantity.toFixed(0)} unallocated`,
        );
      } else {
        toast.success("Estimated line allocated automatically");
      }
    },
    onError: (error) => toast.error(`Allocation failed: ${error.message}`),
  });
};

export const useDeleteEstimatedProductionLineAllocationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { buyerCode: number; styleCode: string }>({
    mutationFn: async ({ buyerCode, styleCode }) => {
      await deleteEstimatedProductionLineAllocation(buyerCode, styleCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estimatedProductionLineAllocation"] });
      toast.success("Estimated line allocation deleted successfully");
    },
    onError: (error) => toast.error(`Delete failed: ${error.message}`),
  });
};
