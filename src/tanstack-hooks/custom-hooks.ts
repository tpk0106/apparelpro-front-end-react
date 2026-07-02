import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import type {
  BulkSaveResponse,
  ColorSizeBreakdownDetailsPayloadWithBody,
  CreateAddressAPIModel,
  PaginationData,
} from "../interfaces/definitions";
import type { PaginationAPIModel } from "../interfaces/references/ApiResult";

import type { GarmentType } from "../interfaces/references/GarmentType";
import {
  createNewGarmentType,
  loadGarmentTypes,
  removeGarmentType,
  updateEditGarmentType,
} from "../services/garment-type.service";
import { toast } from "react-toastify";
import {
  createNewCurrency,
  loadCurrencies,
  removeCurrency,
  updateEditCurrency,
} from "../services/currency.service";
import type { Currency } from "../interfaces/references/Currency";
import type { Country } from "../interfaces/references/Country";
import { loadCountries } from "../services/country.service";
import type { Bank } from "../interfaces/references/Bank";
import {
  createNewBank,
  deleteBank,
  loadBanks,
  updateEditBank,
} from "../services/bank.service";
import type { Unit } from "../interfaces/references/Unit";
import {
  createNewUnit,
  loadUnits,
  removeUnit,
  updateEditUnit,
} from "../services/unit.service";
import type { Buyer } from "../interfaces/references/Buyer";
import {
  createNewBuyer,
  loadBuyers,
  removeBuyer,
  updateEditBuyer,
} from "../services/buyerService";
import type { Address } from "../interfaces/references/Address";
import {
  createNewBuyerAddress,
  loadAllAddressesForBuyerCode,
  removeBuyerAddress,
  updateBuyerAddress,
} from "../services/address.serice";
import type {
  DeleteAddressPayload,
  DeleteBasisPayload,
  DeleteStylePayload,
  PurchaseOrderPayload,
  UpdateAddressPayload,
  UpdateBasisPayload,
  UpdateStylePayload,
} from "./interfaces";
import {
  createNewBasis,
  loadBasises,
  removeBasis,
  updateEditBasis,
} from "../services/basis.service";
import type { Basis } from "../interfaces/references/Basis";
import type { Style } from "../interfaces/OrderManagement/Style";
import {
  createNewStyle,
  deleteStyle,
  loadStyles,
  updateEditStyle,
} from "../services/style.service";
import type PurchaseOrder from "../interfaces/OrderManagement/PurchaseOrder";
import {
  createNewPO,
  loadPurchaseOrder,
  loadPurchaseOrdersByBuyerCode,
} from "../services/poService";

import { createNewColorSizeBreakdownDetails } from "../services/color-size-breakdown-details.service";

// 1. THE FETCH HOOK (Replaces loadAllCurrencies Saga & Reducer)
export const useGetGarmentTypes = (paginate: PaginationData) => {
  return useQuery<PaginationAPIModel<GarmentType>, Error>({
    // The queryKey acts like a dependency array.
    // When paginate.pageIndex shifts, TanStack Query automatically fires a new network request!
    queryKey: ["garmentTypes", paginate.pageIndex, paginate.pageSize],
    queryFn: async () => {
      // Assumes loadGarmentTypes returns AxiosResponse<PaginationAPIModel<Country>>
      const response: AxiosResponse<PaginationAPIModel<GarmentType>> =
        await loadGarmentTypes(paginate);
      return response.data;
    },
    placeholderData: (previousData) => previousData, // Keeps old page data visible while loading the next page (smooth transitions)
  });
};

export const useCreateGarmentTypeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, GarmentType>({
    mutationFn: async (newGarmentType: GarmentType) => {
      await createNewGarmentType(newGarmentType);
    },
    onSuccess: () => {
      // 🚀 THE MAGIC: This instantly tells TanStack Query to clear its cache
      // and re-fetch whatever active page your table is currently looking at!
      queryClient.invalidateQueries({ queryKey: ["garmentTypes"] });
      toast.success("Garment Type created successfully");
    },
    onError: (error) => {
      toast.error(`Creation failed: ${error.message}`);
    },
  });
};

// 3. THE UPDATE HOOK (Replaces updateCountry Saga)
export const useUpdateGarmentTypeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, GarmentType>({
    mutationFn: async (updatedCurrency: GarmentType) => {
      await updateEditGarmentType(updatedCurrency.id, updatedCurrency);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      toast.success("GarmentType updated successfully");
    },
    onError: (error) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });
};

// 4. THE DELETE HOOK (Replaces deleteCountry Saga)
export const useDeleteGarmentTypeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id: number) => {
      await removeGarmentType(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      toast.success("GarmentType deleted successfully");
    },
  });
};

// currency

// 1. THE FETCH HOOK (Replaces loadAllCurrencies Saga & Reducer)
export const useGetCurrenciesQuery = (paginate: PaginationData) => {
  return useQuery<PaginationAPIModel<Currency>, Error>({
    // The queryKey acts like a dependency array.
    // When paginate.pageIndex shifts, TanStack Query automatically fires a new network request!
    queryKey: ["currencies", paginate.pageIndex, paginate.pageSize],
    queryFn: async () => {
      // Assumes loadCurrencies returns AxiosResponse<PaginationAPIModel<Currency>>
      const response: AxiosResponse<PaginationAPIModel<Currency>> =
        await loadCurrencies(paginate);
      return response.data;
    },
    placeholderData: (previousData) => previousData, // Keeps old page data visible while loading the next page (smooth transitions)
  });
};

// 2. THE CREATE HOOK (Replaces createCurrency Saga)
export const useCreateCurrencyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Currency>({
    mutationFn: async (newCurrency: Currency) => {
      await createNewCurrency(newCurrency);
    },
    onSuccess: () => {
      // 🚀 THE MAGIC: This instantly tells TanStack Query to clear its cache
      // and re-fetch whatever active page your table is currently looking at!
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      toast.success("Currency created successfully");
    },
    onError: (error) => {
      toast.error(`Creation failed: ${error.message}`);
    },
  });
};

// 3. THE UPDATE HOOK (Replaces updateCountry Saga)
export const useUpdateCurrencyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Currency>({
    mutationFn: async (updatedCurrency: Currency) => {
      await updateEditCurrency(updatedCurrency.code, updatedCurrency);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      toast.success("Currency updated successfully");
    },
    onError: (error) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });
};

// 4. THE DELETE HOOK (Replaces deleteCountry Saga)
export const useDeleteCurrencyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (code: string) => {
      await removeCurrency(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      toast.success("Currency deleted successfully");
    },
  });
};

// country

// 1. THE FETCH HOOK (Replaces loadAllCurrencies Saga & Reducer)
export const useGetCountriesQuery = (paginate: PaginationData) => {
  return useQuery<PaginationAPIModel<Country>, Error>({
    // The queryKey acts like a dependency array.
    // When paginate.pageIndex shifts, TanStack Query automatically fires a new network request!
    queryKey: ["countries", paginate.pageIndex, paginate.pageSize],
    queryFn: async () => {
      // Assumes loadCurrencies returns AxiosResponse<PaginationAPIModel<Country>>
      const response: AxiosResponse<PaginationAPIModel<Country>> =
        await loadCountries(paginate);
      console.log("country service :", response.data);
      return response.data;
    },
    placeholderData: (previousData) => previousData, // Keeps old page data visible while loading the next page (smooth transitions)
  });
};

// bank

// 1. THE FETCH HOOK (Replaces loadAllCurrencies Saga & Reducer)
export const useGetBanksQuery = (paginate: PaginationData) => {
  return useQuery<PaginationAPIModel<Bank>, Error>({
    // The queryKey acts like a dependency array.
    // When paginate.pageIndex shifts, TanStack Query automatically fires a new network request!
    queryKey: ["banks", paginate.pageIndex, paginate.pageSize],
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<Bank>> =
        await loadBanks(paginate);
      return response.data;
    },
    placeholderData: (previousData) => previousData, // Keeps old page data visible while loading the next page (smooth transitions)
  });
};

// bank

export const useCreateBankMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Bank>({
    mutationFn: async (newBank: Bank) => {
      await createNewBank(newBank);
    },
    onSuccess: () => {
      // 🚀 THE MAGIC: This instantly tells TanStack Query to clear its cache
      // and re-fetch whatever active page your table is currently looking at!
      queryClient.invalidateQueries({ queryKey: ["banks"] });
      toast.success("Bank created successfully");
    },
    onError: (error) => {
      toast.error(`Creation failed: ${error.message}`);
    },
  });
};

// 3. THE UPDATE HOOK (Replaces updateCountry Saga)
export const useUpdateBankMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Bank>({
    mutationFn: async (updatedBank: Bank) => {
      await updateEditBank(updatedBank.bankCode, updatedBank);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
      toast.success("Bank updated successfully");
    },
    onError: (error) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });
};

// 4. THE DELETE HOOK (Replaces deleteCountry Saga)
export const useDeleteBankMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (bankCode: string) => {
      await deleteBank(bankCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
      toast.success("Bank deleted successfully");
    },
  });
};

// Unit

// 1. THE FETCH HOOK (Replaces loadAllCurrencies Saga & Reducer)
export const useGetUnits = (paginate: PaginationData) => {
  return useQuery<PaginationAPIModel<Unit>, Error>({
    // The queryKey acts like a dependency array.
    // When paginate.pageIndex shifts, TanStack Query automatically fires a new network request!
    queryKey: ["units", paginate.pageIndex, paginate.pageSize],
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<Unit>> =
        await loadUnits(paginate);
      console.log("Units Data : ", response.data);
      return response.data;
    },
    placeholderData: (previousData) => previousData, // Keeps old page data visible while loading the next page (smooth transitions)
  });
};

export const useCreateUnitMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Unit>({
    mutationFn: async (newUnit: Unit) => {
      await createNewUnit(newUnit);
    },
    onSuccess: () => {
      // 🚀 THE MAGIC: This instantly tells TanStack Query to clear its cache
      // and re-fetch whatever active page your table is currently looking at!
      queryClient.invalidateQueries({ queryKey: ["units"] });
      toast.success("Unit created successfully");
    },
    onError: (error) => {
      toast.error(`Creation failed: ${error.message}`);
    },
  });
};

// 3. THE UPDATE HOOK (Replaces updateCountry Saga)
export const useUpdateUnitMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Unit>({
    mutationFn: async (updatedUnit: Unit) => {
      await updateEditUnit(updatedUnit.id, updatedUnit);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      toast.success("Unit updated successfully");
    },
    onError: (error) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });
};

// 4. THE DELETE HOOK (Replaces deleteCountry Saga)
export const useDeleteUnitMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id: number) => {
      removeUnit(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      toast.success("Unit deleted successfully");
    },
  });
};

// Buyer

// 1. THE FETCH HOOK (Replaces loadAllCurrencies Saga & Reducer)
export const useGetBuyersQuery = (paginate: PaginationData) => {
  return useQuery<PaginationAPIModel<Buyer>, Error>({
    // The queryKey acts like a dependency array.
    // When paginate.pageIndex shifts, TanStack Query automatically fires a new network request!
    queryKey: ["buyers", paginate.pageIndex, paginate.pageSize],
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<Buyer>> =
        await loadBuyers(paginate);
      return response.data;
    },
    placeholderData: (previousData) => previousData, // Keeps old page data visible while loading the next page (smooth transitions)
  });
};

export const useCreateBuyerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Buyer>({
    mutationFn: async (newBuyer: Buyer) => {
      await createNewBuyer(newBuyer);
    },
    onSuccess: () => {
      // 🚀 THE MAGIC: This instantly tells TanStack Query to clear its cache
      // and re-fetch whatever active page your table is currently looking at!
      queryClient.invalidateQueries({ queryKey: ["buyers"] });
      toast.success("Buyer created successfully");
    },
    onError: (error) => {
      toast.error(`Creation failed: ${error.message}`);
    },
  });
};

// 3. THE UPDATE HOOK (Replaces updateCountry Saga)
export const useUpdateBuyerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Buyer>({
    mutationFn: async (updatedBuyer: Buyer) => {
      await updateEditBuyer(updatedBuyer.buyerCode, updatedBuyer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyers"] });
      toast.success("Buyer updated successfully");
    },
    onError: (error) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });
};

// 4. THE DELETE HOOK (Replaces deleteCountry Saga)
export const useDeleteBuyerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (buyerCode: number) => {
      removeBuyer(buyerCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyers"] });
      toast.success("Buyer deleted successfully");
    },
  });
};

// buyers address

export const useGetBuyerAddressesByBuyerCode = (
  buyerCode: number,
  paginate: PaginationData,
) => {
  return useQuery<PaginationAPIModel<Address>, Error>({
    queryKey: ["buyerAddresses", paginate.pageIndex, paginate.pageSize],
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<Address>> =
        await loadAllAddressesForBuyerCode(buyerCode, paginate);
      return response.data;
    },
    placeholderData: (previousData) => previousData, // Keeps old page data visible while loading the next page (smooth transitions)
  });
};

export const useCreateBuyerAddressMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CreateAddressAPIModel>({
    mutationFn: async (newBuyerAddress: CreateAddressAPIModel) => {
      console.log("new buyer address to save : ", newBuyerAddress);
      await createNewBuyerAddress(newBuyerAddress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyerAddresses"] });
      toast.success("Buyer Address created successfully");
    },
    onError: (error) => {
      toast.error(`Creation failed: ${error.message}`);
    },
  });
};

// 3. THE UPDATE HOOK (Replaces updateCountry Saga)
export const useUpdateBuyerAddressMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateAddressPayload>({
    mutationFn: async (updatedBuyerAddressPayload) => {
      await updateBuyerAddress(
        updatedBuyerAddressPayload.buyerCode,
        updatedBuyerAddressPayload.addressId,
        updatedBuyerAddressPayload.addressToUpdate,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyers"] });
      toast.success("Buyer updated successfully");
    },
    onError: (error) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });
};

// Define an interface for the mutation variables

// 4. THE DELETE HOOK (Replaces deleteCountry Saga)
export const useDeleteBuyerAddressMutation = () => {
  const queryClient = useQueryClient();

  // Update generics: <TData, TError, TVariables, TContext>
  return useMutation<void, Error, DeleteAddressPayload>({
    mutationFn: async ({ buyerCode, addressId }) => {
      // Don't forget to await if removeBuyerAddress is asynchronous!
      await removeBuyerAddress(buyerCode, addressId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyers"] });
      // Note: You might want to update this text to "Address deleted successfully"
      toast.success("Buyer deleted successfully");
    },
  });
};

// basis

export const useGetBasis = (paginate: PaginationData) => {
  return useQuery<PaginationAPIModel<Basis>, Error>({
    queryKey: ["basises", paginate.pageIndex, paginate.pageSize],
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<Basis>> =
        await loadBasises(paginate);
      return response.data;
    },
    placeholderData: (previousData) => previousData, // Keeps old page data visible while loading the next page (smooth transitions)
  });
};

export const useCreateBasisMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Basis>({
    mutationFn: async (newBasis: Basis) => {
      console.log("new buyer address to save : ", newBasis);
      await createNewBasis(newBasis);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["basises"] });
      toast.success("Basis created successfully");
    },
    onError: (error) => {
      toast.error(`Creation failed: ${error.message}`);
    },
  });
};

// 3. THE UPDATE HOOK (Replaces updateCountry Saga)
export const useUpdateBasisMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateBasisPayload>({
    mutationFn: async (updatedBasisPayload) => {
      await updateEditBasis(
        updatedBasisPayload.code,
        updatedBasisPayload.basisToUpdate,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["basises"] });
      toast.success("Basis updated successfully");
    },
    onError: (error) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });
};

// Define an interface for the mutation variables

// 4. THE DELETE HOOK (Replaces deleteCountry Saga)
export const useDeleteBasisMutation = () => {
  const queryClient = useQueryClient();

  // Update generics: <TData, TError, TVariables, TContext>
  return useMutation<void, Error, DeleteBasisPayload>({
    mutationFn: async ({ code }) => {
      // Don't forget to await if removeBuyerAddress is asynchronous!
      await removeBasis(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyers"] });
      // Note: You might want to update this text to "Address deleted successfully"
      toast.success("Buyer deleted successfully");
    },
  });
};

// styles

export const useGetStyles = (paginate: PaginationData) => {
  return useQuery<PaginationAPIModel<Style>, Error>({
    queryKey: ["styles", paginate.pageIndex, paginate.pageSize],
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<Style>> =
        await loadStyles(paginate);
      return response.data;
    },
    placeholderData: (previousData) => previousData, // Keeps old page data visible while loading the next page (smooth transitions)
  });
};

export const useCreateStyleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Style>({
    mutationFn: async (newStyle: Style) => {
      console.log("new buyer address to save : ", newStyle);
      await createNewStyle(newStyle);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["styles"] });
      toast.success("Style created successfully");
    },
    onError: (error) => {
      toast.error(`Creation failed: ${error.message}`);
    },
  });
};

// 3. THE UPDATE HOOK (Replaces updateCountry Saga)
export const useUpdateStyleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateStylePayload>({
    mutationFn: async (updatedStylePayload) => {
      await updateEditStyle(
        updatedStylePayload.styleCode,
        updatedStylePayload.styleToUpdate,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["styles"] });
      toast.success("Style updated successfully");
    },
    onError: (error) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });
};

// Define an interface for the mutation variables

// 4. THE DELETE HOOK (Replaces deleteCountry Saga)
export const useDeleteStyleMutation = () => {
  const queryClient = useQueryClient();

  // Update generics: <TData, TError, TVariables, TContext>
  return useMutation<void, Error, DeleteStylePayload>({
    mutationFn: async ({ styleCode }) => {
      // Don't forget to await if removeBuyerAddress is asynchronous!
      await deleteStyle(styleCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["styles"] });
      // Note: You might want to update this text to "Address deleted successfully"
      toast.success("Buyer deleted successfully");
    },
  });
};

// order

// interface POPayload {
//   buyerCode: number;
//   Order: string;
// }
export const useGetAllPurchaseOrdersByBuyerCode = (
  buyerCode: number,
  isBuyerSupplied: boolean,
) => {
  // console.log("isBuyerAndOrderSupplied :", isBuyerAndOrderSupplied);
  return useQuery<string[], Error>({
    queryKey: ["pos", "buyerCode"],
    queryFn: async () => {
      const response: AxiosResponse<string[]> =
        await loadPurchaseOrdersByBuyerCode(buyerCode);
      return response.data;
    },
    enabled: isBuyerSupplied,
    placeholderData: (previousData) => previousData, // Keeps old page data visible while loading the next page (smooth transitions)
  });
};

export const useGetPurchaseOrder = (
  payload: PurchaseOrderPayload,
  isBuyerAndOrderSupplied: boolean,
) => {
  console.log("isBuyerAndOrderSupplied :", isBuyerAndOrderSupplied);
  return useQuery<PurchaseOrder, Error>({
    queryKey: ["po", payload],
    queryFn: async () => {
      const response: AxiosResponse<PurchaseOrder> =
        await loadPurchaseOrder(payload);
      return response.data;
    },
    enabled: isBuyerAndOrderSupplied,
    // placeholderData: (previousData) => previousData, // Keeps old page data visible while loading the next page (smooth transitions)
  });
};

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, PurchaseOrder>({
    mutationFn: async (newPO: PurchaseOrder) => {
      console.log("new PO to save : ", newPO);
      await createNewPO(newPO);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["POs"] });
      toast.success("Purchase Order created successfully");
    },
    onError: (error) => {
      toast.error(`Creation failed: ${error.message}`);
    },
  });
};

// Pass BulkSaveResponse as the first generic type argument
// Pass BulkSaveResponse as the first generic type argument
import type { AppError } from "../auth/axiosClient"; // Path to your client file
// Path to your client file

export const useCreateColorSizeBreakdownDetailsMutation = () => {
  const queryClient = useQueryClient();

  // Explicitly apply AppError to the second generic type slot
  return useMutation<
    AxiosResponse<BulkSaveResponse>,
    AppError,
    ColorSizeBreakdownDetailsPayloadWithBody
  >({
    mutationFn: async (newColorSizeDetails) => {
      return await createNewColorSizeBreakdownDetails(
        newColorSizeDetails.params,
        newColorSizeDetails.payload,
      );
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ["colorSizeBreakdownDetails"],
      });
      toast.success(response.data.message);
    },
    onError: (error) => {
      // You now have Intellisense autocompletion here!
      // 'error.message' automatically holds clean strings like "Matrix data payload can not be empty."
      toast.error(`Creation failed: ${error.message}`);
    },
  });
};
