// TanStack Query hooks for the Production Control reference masters
// (RF_MENU.PRG > D. Production Control, plus Production Line from > A. General).
// Kept in a dedicated file, separate from the ever-growing custom-hooks.ts,
// so the six near-identical master-data screens don't add more surface area
// to a file that already covers a dozen unrelated domains (SoC).

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { toast } from "react-toastify";

import type { PaginationData } from "../interfaces/definitions";
import type { PaginationAPIModel } from "../interfaces/references/ApiResult";

import type { ProductionLine } from "../interfaces/production/ProductionLine";
import {
  loadProductionLines,
  createNewProductionLine,
  deleteProductionLine,
  updateEditProductionLine,
} from "../services/production/production-line.service";

import type { Operation } from "../interfaces/production/Operation";
import {
  loadOperations,
  createNewOperation,
  deleteOperation,
  updateEditOperation,
} from "../services/production/operation.service";

import type { NonProductiveHourCode } from "../interfaces/production/NonProductiveHourCode";
import {
  loadNonProductiveHourCodes,
  createNewNonProductiveHourCode,
  deleteNonProductiveHourCode,
  updateEditNonProductiveHourCode,
} from "../services/production/non-productive-hour-code.service";

import type { MachineType } from "../interfaces/production/MachineType";
import {
  loadMachineTypes,
  createNewMachineType,
  deleteMachineType,
  updateEditMachineType,
} from "../services/production/machine-type.service";

import type { GarmentComponent } from "../interfaces/production/GarmentComponent";
import {
  loadGarmentComponents,
  createNewGarmentComponent,
  deleteGarmentComponent,
  updateEditGarmentComponent,
} from "../services/production/garment-component.service";

import type { Employee } from "../interfaces/production/Employee";
import {
  loadEmployees,
  createNewEmployee,
  deleteEmployee,
  updateEditEmployee,
} from "../services/production/employee.service";

import type { Section } from "../interfaces/production/Section";
import { loadAllSections } from "../services/production/section.service";

// ---------------------------------------------------------------------------
// Production Line
// ---------------------------------------------------------------------------

export const useGetProductionLines = (paginate: PaginationData) => {
  return useQuery<PaginationAPIModel<ProductionLine>, Error>({
    queryKey: ["productionLines", paginate.pageIndex, paginate.pageSize],
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<ProductionLine>> =
        await loadProductionLines(paginate);
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateProductionLineMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, ProductionLine>({
    mutationFn: async (newProductionLine: ProductionLine) => {
      await createNewProductionLine(newProductionLine);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productionLines"] });
      toast.success("Production line created successfully");
    },
    onError: (error) => toast.error(`Create failed: ${error.message}`),
  });
};

export const useUpdateProductionLineMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, ProductionLine>({
    mutationFn: async (updated: ProductionLine) => {
      await updateEditProductionLine(updated.lineCode, updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productionLines"] });
      toast.success("Production line updated successfully");
    },
    onError: (error) => toast.error(`Update failed: ${error.message}`),
  });
};

export const useDeleteProductionLineMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (lineCode: string) => {
      await deleteProductionLine(lineCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productionLines"] });
      toast.success("Production line deleted successfully");
    },
    onError: (error) => toast.error(`Delete failed: ${error.message}`),
  });
};

// ---------------------------------------------------------------------------
// Operation
// ---------------------------------------------------------------------------

export const useGetOperations = (paginate: PaginationData) => {
  return useQuery<PaginationAPIModel<Operation>, Error>({
    queryKey: ["operations", paginate.pageIndex, paginate.pageSize],
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<Operation>> =
        await loadOperations(paginate);
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateOperationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, Operation>({
    mutationFn: async (newOperation: Operation) => {
      await createNewOperation(newOperation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations"] });
      toast.success("Operation created successfully");
    },
    onError: (error) => toast.error(`Create failed: ${error.message}`),
  });
};

export const useUpdateOperationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, Operation>({
    mutationFn: async (updated: Operation) => {
      await updateEditOperation(updated.operationCode, updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations"] });
      toast.success("Operation updated successfully");
    },
    onError: (error) => toast.error(`Update failed: ${error.message}`),
  });
};

export const useDeleteOperationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (operationCode: string) => {
      await deleteOperation(operationCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations"] });
      toast.success("Operation deleted successfully");
    },
    onError: (error) => toast.error(`Delete failed: ${error.message}`),
  });
};

// ---------------------------------------------------------------------------
// Non-Productive Hour Code
// ---------------------------------------------------------------------------

export const useGetNonProductiveHourCodes = (paginate: PaginationData) => {
  return useQuery<PaginationAPIModel<NonProductiveHourCode>, Error>({
    queryKey: [
      "nonProductiveHourCodes",
      paginate.pageIndex,
      paginate.pageSize,
    ],
    queryFn: async () => {
      const response: AxiosResponse<
        PaginationAPIModel<NonProductiveHourCode>
      > = await loadNonProductiveHourCodes(paginate);
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateNonProductiveHourCodeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, NonProductiveHourCode>({
    mutationFn: async (newCode: NonProductiveHourCode) => {
      await createNewNonProductiveHourCode(newCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nonProductiveHourCodes"] });
      toast.success("Non-productive hour code created successfully");
    },
    onError: (error) => toast.error(`Create failed: ${error.message}`),
  });
};

export const useUpdateNonProductiveHourCodeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, NonProductiveHourCode>({
    mutationFn: async (updated: NonProductiveHourCode) => {
      await updateEditNonProductiveHourCode(updated.code, updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nonProductiveHourCodes"] });
      toast.success("Non-productive hour code updated successfully");
    },
    onError: (error) => toast.error(`Update failed: ${error.message}`),
  });
};

export const useDeleteNonProductiveHourCodeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (code: string) => {
      await deleteNonProductiveHourCode(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nonProductiveHourCodes"] });
      toast.success("Non-productive hour code deleted successfully");
    },
    onError: (error) => toast.error(`Delete failed: ${error.message}`),
  });
};

// ---------------------------------------------------------------------------
// Machine Type
// ---------------------------------------------------------------------------

export const useGetMachineTypes = (paginate: PaginationData) => {
  return useQuery<PaginationAPIModel<MachineType>, Error>({
    queryKey: ["machineTypes", paginate.pageIndex, paginate.pageSize],
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<MachineType>> =
        await loadMachineTypes(paginate);
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateMachineTypeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, MachineType>({
    mutationFn: async (newMachineType: MachineType) => {
      await createNewMachineType(newMachineType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["machineTypes"] });
      toast.success("Machine type created successfully");
    },
    onError: (error) => toast.error(`Create failed: ${error.message}`),
  });
};

export const useUpdateMachineTypeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, MachineType>({
    mutationFn: async (updated: MachineType) => {
      await updateEditMachineType(updated.code, updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["machineTypes"] });
      toast.success("Machine type updated successfully");
    },
    onError: (error) => toast.error(`Update failed: ${error.message}`),
  });
};

export const useDeleteMachineTypeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (code: string) => {
      await deleteMachineType(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["machineTypes"] });
      toast.success("Machine type deleted successfully");
    },
    onError: (error) => toast.error(`Delete failed: ${error.message}`),
  });
};

// ---------------------------------------------------------------------------
// Garment Component
// ---------------------------------------------------------------------------

export const useGetGarmentComponents = (paginate: PaginationData) => {
  return useQuery<PaginationAPIModel<GarmentComponent>, Error>({
    queryKey: ["garmentComponents", paginate.pageIndex, paginate.pageSize],
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<GarmentComponent>> =
        await loadGarmentComponents(paginate);
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateGarmentComponentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, GarmentComponent>({
    mutationFn: async (newComponent: GarmentComponent) => {
      await createNewGarmentComponent(newComponent);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["garmentComponents"] });
      toast.success("Garment component created successfully");
    },
    onError: (error) => toast.error(`Create failed: ${error.message}`),
  });
};

export const useUpdateGarmentComponentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, GarmentComponent>({
    mutationFn: async (updated: GarmentComponent) => {
      await updateEditGarmentComponent(updated.componentCode, updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["garmentComponents"] });
      toast.success("Garment component updated successfully");
    },
    onError: (error) => toast.error(`Update failed: ${error.message}`),
  });
};

export const useDeleteGarmentComponentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (componentCode: string) => {
      await deleteGarmentComponent(componentCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["garmentComponents"] });
      toast.success("Garment component deleted successfully");
    },
    onError: (error) => toast.error(`Delete failed: ${error.message}`),
  });
};

// ---------------------------------------------------------------------------
// Employee
// ---------------------------------------------------------------------------

export const useGetEmployees = (paginate: PaginationData) => {
  return useQuery<PaginationAPIModel<Employee>, Error>({
    queryKey: ["employees", paginate.pageIndex, paginate.pageSize],
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<Employee>> =
        await loadEmployees(paginate);
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, Employee>({
    mutationFn: async (newEmployee: Employee) => {
      await createNewEmployee(newEmployee);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee created successfully");
    },
    onError: (error) => toast.error(`Create failed: ${error.message}`),
  });
};

export const useUpdateEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, Employee>({
    mutationFn: async (updated: Employee) => {
      await updateEditEmployee(updated.employeeCode, updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee updated successfully");
    },
    onError: (error) => toast.error(`Update failed: ${error.message}`),
  });
};

export const useDeleteEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (employeeCode: string) => {
      await deleteEmployee(employeeCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee deleted successfully");
    },
    onError: (error) => toast.error(`Delete failed: ${error.message}`),
  });
};

// ---------------------------------------------------------------------------
// Section (non-paginated - used for dropdowns, e.g. the Production Contract
// Section Code system parameter)
// ---------------------------------------------------------------------------

export const useGetAllSections = () => {
  return useQuery<Section[], Error>({
    queryKey: ["sections", "all"],
    queryFn: async () => {
      const response: AxiosResponse<Section[]> = await loadAllSections();
      return response.data;
    },
  });
};
