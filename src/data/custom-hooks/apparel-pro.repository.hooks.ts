import type { MRT_PaginationState } from "material-react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import type { Buyer } from "../../interfaces/references/Buyer";

import {
  createBuyerStart,
  deleteBuyerStart,
  loadAllBuyersStart,
  updateBuyerStart,
} from "../../sagaStore/buyer/buyer.action";
import type { Bank } from "../../interfaces/references/Bank";
import {
  createBankStart,
  deleteBankStart,
  loadAllBanksStart,
  updateBankStart,
} from "../../sagaStore/bank/bank.action";
import type { Currency } from "../../interfaces/references/Currency";
import {
  createCurrencyStart,
  deleteCurrencyStart,
  loadAllCurrenciesStart,
  updateCurrencyStart,
} from "../../sagaStore/currency/currency.action";
import {
  DROPDOWN_LIST_DATA,
  type CreateAddressAPIModel,
  type CreateCountryAPIModel,
  type PaginationData,
} from "../../interfaces/definitions";
import type { Address } from "../../interfaces/references/Address";
import {
  createBuyerAddressStart,
  createSupplierAddressStart,
  deleteBuyerAddressStart,
  deleteSupplierAddressStart,
  loadAllAddressesForBuyerStart,
  updateBuyerAddressStart,
  updateSupplierAddressStart,
} from "../../sagaStore/address/address.action";
import type { Country } from "../../interfaces/references/Country";
import {
  createCountryStart,
  loadAllCountriesStart,
  updateCountryStart,
} from "../../sagaStore/country/country.action";
import type { Supplier } from "../../interfaces/references/Supplier";
import {
  createSupplierStart,
  deleteSupplierStart,
  loadAllSuppliersStart,
  updateSupplierStart,
} from "../../sagaStore/supplier/supplier.action";
import type { PortDestination } from "../../interfaces/references/PortDestination";
import {
  createPortDestinationStart,
  deletePortDestinationStart,
  loadAllPortDestinationsStart,
  updatePortDestinationStart,
} from "../../sagaStore/port-destination/port-destination.action";
import type { GarmentType } from "../../interfaces/references/GarmentType";
import {
  createGarmentTypeStart,
  deleteGarmentTypeStart,
  loadAllGarmentTypesStart,
  updateGarmentTypeStart,
} from "../../sagaStore/garment-type/garment-type.action";
import {
  createUnitStart,
  deleteUnitStart,
  loadAllUnitsStart,
  updateUnitStart,
} from "../../sagaStore/unit/unit.action";
import type { Unit } from "../../interfaces/references/Unit";
import type PurchaseOrder from "../../interfaces/OrderManagement/PurchaseOrder";
import { loadOrderStart } from "../../sagaStore/order-confirmation/order.action";
import type { Basis } from "../../interfaces/references/Basis";
import { loadAllBasisesStart } from "../../sagaStore/basis/basis.action";
import type { CurrencyConversion } from "../../interfaces/references/CurrencyConversion";
import {
  createCurrencyConversionStart,
  deleteCurrencyConversionStart,
  loadAllCurrencyConversionsStart,
} from "../../sagaStore/currency-conversion/currency-conversion.action";
import type { CurrencyExchange } from "../../interfaces/references/CurrencyExchange";
import {
  createCurrencyExchangeStart,
  deleteCurrencyExchangeStart,
  loadAllCurrencyExchangesStart,
  updateCurrencyExchangeStart,
} from "../../sagaStore/currency-exchange/currency-exchange.action";

// READ hook, (get buyer in api)
export const useGetBuyers = (
  paginate: PaginationData,
  pagination: MRT_PaginationState,
) => {
  const dispatch = useDispatch();

  return useQuery<Buyer[]>({
    queryKey: ["buyers", pagination?.pageSize, pagination?.pageIndex],
    queryFn: async () => {
      dispatch(
        loadAllBuyersStart({
          ...paginate,
          // pageIndex: pagination?.pageIndex,
          ...pagination,
        }),
      );
      return [];
    },
    refetchOnWindowFocus: false,
  });
};

// UPDATE hook, (put buyer in api)
export const useUpdateBuyer = (pagination: MRT_PaginationState) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (buyer: Buyer) => {
      const res = dispatch(updateBuyerStart({ ...buyer }));
      return res.payload;
    },

    // client side optimistic update
    onMutate: (editBuyer: Buyer) => {
      queryClient.setQueryData(
        ["buyers", pagination?.pageSize, pagination?.pageIndex],
        (prevBuyers: Buyer[]) =>
          prevBuyers?.map((prevBuyer: Buyer) => {
            return prevBuyer.buyerCode === editBuyer.buyerCode
              ? editBuyer
              : prevBuyer;
          }),
      );
    },

    onError: (error) => {
      console.log("onError", error);
    },

    //refetch buyers after mutation,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["buyers"],
        refetchType: "all",
      });

      // refetch queries based on certain conditions.
      // refetch all active queries exactly matching a query key:
      queryClient.refetchQueries({
        queryKey: ["buyers", pagination.pageSize, pagination.pageIndex],
        type: "active",
        exact: true,
      });
    },
  });
};

export const useCreateBuyer = (
  pagination: MRT_PaginationState,
  paginate: PaginationData,
) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (buyer: Buyer) => {
      const res = dispatch(createBuyerStart({ ...buyer }));
      return res.payload;
    },

    //client side optimistic update
    onMutate: (newBuyer: Buyer) => {
      queryClient.setQueryData(
        ["buyers", pagination?.pageSize, pagination?.pageIndex],
        (prevBuyers: Buyer[]) =>
          [
            { ...prevBuyers },
            {
              ...newBuyer,
            },
          ] as Buyer[],
      );
    },

    onSuccess: (data) => {
      console.log("success:", data);
      dispatch(
        loadAllBuyersStart({
          ...paginate,
          pageSize: pagination.pageSize,
          pageIndex: pagination.pageIndex,
        }),
      );
    },

    onError: (error) => {
      console.log("error ......!!!", error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["buyers"],
      });
    },
  });
};

// //DELETE hook (delete buyer in api)
export const useDeleteBuyer = (pagination: MRT_PaginationState) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (buyerCode: number) => {
      //send api update request here
      const response = dispatch(deleteBuyerStart(buyerCode));
      return response;
    },

    //client side optimistic update

    onMutate: (buyerCode: number) => {
      queryClient.setQueryData(
        ["buyers", pagination.pageSize, pagination.pageIndex],
        (prevBuyers: Buyer[]) =>
          prevBuyers?.filter((buyer: Buyer) => buyer.buyerCode !== buyerCode),
      );
    },

    onSettled: () => {
      return (
        queryClient.invalidateQueries({
          queryKey: ["buyers"],
          refetchType: "all",
        }),
        queryClient.refetchQueries({
          queryKey: ["buyers", pagination.pageSize, pagination.pageIndex],
          type: "active",
          exact: true,
        })
      );
    },
  });
};

// get All currency codes at once (for dropdown list)

export const useCurrencies = (paginate: PaginationData) => {
  const dispatch = useDispatch();
  return useQuery<Currency[]>({
    queryKey: ["currencies"],
    queryFn: async () => {
      dispatch(
        loadAllCurrenciesStart({
          ...paginate,
          pageIndex: DROPDOWN_LIST_DATA.PAGE_NUMBER,
          pageSize: DROPDOWN_LIST_DATA.PAGE_SIZE,
        }),
      );
      return [];
    },
  });
};

export const useGetBanks = (
  paginate: PaginationData,
  pagination: MRT_PaginationState,
) => {
  const dispatch = useDispatch();

  return useQuery<Bank[]>({
    queryKey: ["banks", pagination?.pageSize, pagination?.pageIndex],
    queryFn: async () => {
      dispatch(
        loadAllBanksStart({
          ...paginate,
          // pageIndex: pagination?.pageIndex,
          ...pagination,
        }),
      );
      return [];
    },
    refetchOnWindowFocus: false,
  });
};

export const useUpdateBank = (pagination: MRT_PaginationState) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (bank: Bank) => {
      //send api update request here
      const res = dispatch(updateBankStart({ ...bank }));
      return res.payload;
    },

    // client side optimistic update
    onMutate: (editBank: Bank) => {
      queryClient.setQueryData(
        ["banks", pagination.pageSize, pagination.pageIndex],
        (prevBanks: Bank[]) =>
          prevBanks?.map((prevBank: Bank) => {
            return prevBank.bankCode === editBank.bankCode
              ? editBank
              : prevBank;
          }),
      );
    },

    onError: (error) => {
      console.log("onError", error);
    },

    onSettled: () => {
      const state = queryClient.getQueryState([
        "banks",
        pagination.pageSize,
        pagination.pageIndex,
      ]);
      console.log("STATE : ", state?.dataUpdatedAt);

      queryClient.invalidateQueries({
        queryKey: ["banks"],
        refetchType: "all",
      });

      // await queryClient.refetchQueries({ stale: true });

      queryClient.refetchQueries({
        queryKey: ["banks", pagination.pageSize, pagination.pageIndex],
        type: "active",
        exact: true,
      });
    },
  });
};

export const useCreateBank = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (bank: Bank) => {
      const res = dispatch(createBankStart({ ...bank }));
      return res.payload;
    },

    onMutate: (newBank: Bank) => {
      queryClient.setQueryData(
        ["banks"],
        (prevBanks: Bank[]) =>
          [
            { ...prevBanks },
            {
              ...newBank,
            },
          ] as Bank[],
      );
    },

    onSuccess: (data) => {
      console.log("success:", data);
    },

    onError: (error) => {
      console.log("error ......!!!", error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
    },
  });
};

export const useDeleteBank = (pagination: MRT_PaginationState) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (bankCode: string) => {
      const response = dispatch(deleteBankStart(bankCode));
      return response;
    },

    onMutate: (bankCode: string) => {
      queryClient.setQueryData(
        ["buyers", pagination.pageSize, pagination.pageIndex],
        (prevBanks: Bank[]) =>
          prevBanks?.filter((bank: Bank) => bank.bankCode !== bankCode),
      );
    },

    onSettled: () => {
      return (
        queryClient.invalidateQueries({
          queryKey: ["banks"],
          refetchType: "all",
        }),
        queryClient.refetchQueries({
          queryKey: ["banks", pagination.pageSize, pagination.pageIndex],
          type: "active",
          exact: true,
        })
      );
    },
  });
};

// buyer Addresses

export const useGetAddressesForBuyer = (addressId: string) => {
  const dispatch = useDispatch();
  return useQuery<Address[]>({
    queryKey: ["buyerAddresses", addressId],
    queryFn: async () => {
      const { payload } = dispatch(loadAllAddressesForBuyerStart(addressId));
      return payload;
    },
  });
};

//  countries

export const useCountries = (paginate: PaginationData) => {
  const dispatch = useDispatch();
  return useQuery<Country[]>({
    queryKey: ["countries"],
    queryFn: async () => {
      dispatch(
        loadAllCountriesStart({
          ...paginate,
          pageIndex: DROPDOWN_LIST_DATA.PAGE_NUMBER,
          pageSize: DROPDOWN_LIST_DATA.PAGE_SIZE,
        }),
      );
      return [];
    },
  });
};

export const useCreateCountry = (pagination: MRT_PaginationState) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  console.log("create country started.....");

  return useMutation({
    mutationFn: async (country: CreateCountryAPIModel) => {
      const res = dispatch(createCountryStart({ ...country }));
      return res.payload;
    },

    onMutate: async (newCountry: Country) => {
      // Cancel outbound refetches so they don't overwrite optimistic updates

      console.log(newCountry);

      await queryClient.cancelQueries({
        queryKey: ["countries", pagination?.pageSize, pagination?.pageIndex],
      });

      // Snapshot the previous value

      const previousCountries = queryClient.getQueryData([
        "countries",
        pagination?.pageSize,
        pagination?.pageIndex,
      ]);

      return { previousCountries };

      // queryClient.setQueryData(
      //   ["banks"],
      //   (prevCountries: Country[]) =>
      //     [
      //       { ...prevCountries },
      //       {
      //         ...newCountry,
      //       },
      //     ] as Country[],
      // );
    },

    onSuccess: () => {
      dispatch(
        loadAllCountriesStart({
          pageIndex: pagination.pageIndex, // Matches your updated type definition perfectly
          pageSize: pagination.pageSize,
          sortColumn: null,
          sortOrder: null,
          filterColumn: null,
          filterQuery: null,
        }),
      );
    },

    onError: (error) => {
      console.log("error ......!!!", error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
    },
  });
};

export const useUpdateCountry = (pagination: MRT_PaginationState) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (country: Country) => {
      //send api update request here
      const res = dispatch(updateCountryStart({ ...country }));
      return res.payload;
    },

    // client side optimistic update
    onMutate: (editCountry: Country) => {
      return queryClient.setQueryData(
        ["banks", pagination.pageSize, pagination.pageIndex],
        (prevCountries: Country[]) =>
          prevCountries?.map((prevCountry: Country) => {
            return prevCountry.code === editCountry.code
              ? editCountry
              : prevCountry;
          }),
      );
    },

    onError: (error) => {
      console.log("onError", error);
    },

    onSettled: () => {
      const state = queryClient.getQueryState([
        "banks",
        pagination.pageSize,
        pagination.pageIndex,
      ]);
      console.log("STATE : ", state?.dataUpdatedAt);

      queryClient.invalidateQueries({
        queryKey: ["banks"],
        refetchType: "all",
      });

      // await queryClient.refetchQueries({ stale: true });

      queryClient.refetchQueries({
        queryKey: ["banks", pagination.pageSize, pagination.pageIndex],
        type: "active",
        exact: true,
      });
    },
  });
};

// buyer address

export const useUpdateBuyerAddress = (pagination: MRT_PaginationState) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (address: Address) => {
      const res = dispatch(updateBuyerAddressStart({ ...address }));
      return res.payload;
    },

    onMutate: (editAddress: Address) => {
      queryClient.setQueryData(
        ["buyerAddresses", pagination.pageSize, pagination.pageIndex],
        (prevAaddresses: Address[]) =>
          prevAaddresses?.map((prevAddress: Address) => {
            return prevAddress.addressId === editAddress.addressId
              ? editAddress
              : prevAddress;
          }),
      );
    },

    onError: (error) => {
      console.log("onError", error);
    },

    onSettled: () => {
      const state = queryClient.getQueryState([
        "buyerAddresses",
        pagination.pageSize,
        pagination.pageIndex,
      ]);
      console.log("STATE : ", state?.dataUpdatedAt);

      queryClient.invalidateQueries({
        queryKey: ["buyerAddresses"],
        refetchType: "all",
      });

      // await queryClient.refetchQueries({ stale: true });

      queryClient.refetchQueries({
        queryKey: ["buyerAddresses", pagination.pageSize, pagination.pageIndex],
        type: "active",
        exact: true,
      });
    },
  });
};

interface deleteBuyerAddressParams {
  id: number;
  addressId: string;
}

export const useDeleteBuyerAddress = (
  pagination: MRT_PaginationState,
  paginate: PaginationData,
  currentBuyerPageNumber: number,
  currentBuyerPageSize: number,
) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async ({ id, addressId }) => {
      const response = dispatch(deleteBuyerAddressStart(id, addressId));
      return response;
    },

    onMutate: ({ addressId }: deleteBuyerAddressParams) => {
      queryClient.setQueryData(
        ["buyerAddresses", pagination.pageSize, pagination.pageIndex],
        (prevBuyerAddresses: Address[]) =>
          prevBuyerAddresses?.filter(
            (buyerAddress: Address) => buyerAddress.addressId !== addressId,
          ),
      );
    },

    onSettled: () => {
      return (
        queryClient.invalidateQueries({
          queryKey: ["buyerAddresses"],
          refetchType: "all",
        }),
        queryClient.refetchQueries({
          queryKey: [
            "buyerAddresses",
            pagination.pageSize,
            pagination.pageIndex,
          ],
          type: "active",
          exact: true,
        })
      );

      //
      dispatch(
        loadAllBuyersStart({
          ...paginate,
          pageSize: currentBuyerPageSize,
          pageIndex: currentBuyerPageNumber,
        }),
      );
    },
  });
};

export const useCreateBuyerAddress = (
  pagination: MRT_PaginationState,
  paginate: PaginationData,
  currentSupplierPageNumber: number,
  currentSupplierPageSize: number,
) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (buyerAddress: CreateAddressAPIModel) => {
      const res = dispatch(createBuyerAddressStart({ ...buyerAddress }));
      return res.payload;
    },

    onMutate: (newBuyerAddress: CreateAddressAPIModel) => {
      queryClient.setQueryData(
        ["buyerAddresses", pagination.pageSize, pagination.pageIndex],
        (prevBuyerAddress: Address[]) =>
          [
            { ...prevBuyerAddress },
            {
              ...newBuyerAddress,
            },
          ] as Address[],
      );
    },

    onSuccess: (data) => {
      console.log("success:", data);
      dispatch(
        loadAllBuyersStart({
          ...paginate,
          pageSize: currentSupplierPageSize,
          pageIndex: currentSupplierPageNumber,
        }),
      );
    },

    onError: (error) => {
      console.log("error ......!!!", error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["buyerAddresses"] });
    },
  });
};

// Suppliers

export const useGetSuppliers = (
  paginate: PaginationData,
  pagination: MRT_PaginationState,
) => {
  const dispatch = useDispatch();

  return useQuery<Supplier[]>({
    queryKey: ["suppliers", pagination?.pageSize, pagination?.pageIndex],
    queryFn: async () => {
      dispatch(
        loadAllSuppliersStart({
          ...paginate,
          // pageIndex: pagination?.pageIndex,
          ...pagination,
        }),
      );
      return [];
    },
    refetchOnWindowFocus: false,
  });
};

export const useCreateSupplier = (
  pagination: MRT_PaginationState,
  paginate: PaginationData,
) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (supplier: Supplier) => {
      const res = dispatch(createSupplierStart({ ...supplier }));
      return res.payload;
    },

    onMutate: (newSupplier: Supplier) => {
      queryClient.setQueryData(
        ["suppliers", pagination?.pageSize, pagination?.pageIndex],
        (prevSupplier: Supplier[]) =>
          [
            { ...prevSupplier },
            {
              ...newSupplier,
            },
          ] as Supplier[],
      );
    },

    onSuccess: (data) => {
      console.log("success:", data);
      console.log("create supplier pagination :", {
        ...paginate,
        pageSize: pagination.pageSize,
        pageIndex: pagination.pageIndex,
      });
      dispatch(
        loadAllSuppliersStart({
          ...paginate,
          pageSize: pagination.pageSize,
          pageIndex: pagination.pageIndex,
        }),
      );
    },

    onError: (error) => {
      console.log("error ......!!!", error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["suppliers"],
      });
    },
  });
};

export const useUpdateSupplier = (pagination: MRT_PaginationState) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (supplier: Supplier) => {
      const res = dispatch(updateSupplierStart({ ...supplier }));
      return res.payload;
    },

    onMutate: (editSupplier: Supplier) => {
      queryClient.setQueryData(
        ["suppliers", pagination?.pageSize, pagination?.pageIndex],
        (prevSuppliers: Supplier[]) =>
          prevSuppliers?.map((prevSupplier: Supplier) => {
            return prevSupplier.supplierCode === editSupplier.supplierCode
              ? editSupplier
              : prevSupplier;
          }),
      );
    },

    onError: (error) => {
      console.log("onError", error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["suppliers"],
        refetchType: "all",
      });

      // refetch queries based on certain conditions.
      // refetch all active queries exactly matching a query key:
      //queryKey: ["suppliers", pagination.pageSize, pagination.pageIndex],
      queryClient.refetchQueries({
        queryKey: ["suppliers"],
        type: "active",
        exact: true,
      });
    },
  });
};

export const useDeleteSupplier = (pagination: MRT_PaginationState) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (supplierCode: number) => {
      const response = dispatch(deleteSupplierStart(supplierCode));
      return response;
    },

    onMutate: (supplierCode: number) => {
      queryClient.setQueryData(
        ["suppliers", pagination.pageSize, pagination.pageIndex],
        (prevSuppliers: Supplier[]) =>
          prevSuppliers?.filter(
            (supplier: Supplier) => supplier.supplierCode !== supplierCode,
          ),
      );
    },

    onSettled: () => {
      return (
        queryClient.invalidateQueries({
          queryKey: ["suppliers"],
          refetchType: "all",
        }),
        queryClient.refetchQueries({
          queryKey: ["suppliers", pagination.pageSize, pagination.pageIndex],
          type: "active",
          exact: true,
        })
      );
    },
  });
};

export const useCreateSupplierAddress = (
  paginate: PaginationData,
  currentSupplierPageNumber: number,
  currentSupplierPageSize: number,
) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (supplierAddress: CreateAddressAPIModel) => {
      const res = dispatch(createSupplierAddressStart({ ...supplierAddress }));
      console.log("useCreateSupplierAddress :", res.payload);
      return res.payload;
    },

    onMutate: (newSupplierAddress: CreateAddressAPIModel) => {
      queryClient.setQueryData(
        [
          "supplierAddresses",
          currentSupplierPageSize,
          currentSupplierPageNumber,
        ],
        (prevSupplierAddress: Address[]) =>
          [
            { ...prevSupplierAddress },
            {
              ...newSupplierAddress,
            },
          ] as Address[],
      );
    },

    onSuccess: (data) => {
      dispatch(
        loadAllSuppliersStart({
          ...paginate,
          pageSize: currentSupplierPageSize,
          pageIndex: currentSupplierPageNumber,
        }),
      );
      console.log("success:", data);
    },

    onError: (error) => {
      console.log("error ......!!!", error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["supplierAddresses"] });
    },
  });
};

export const useUpdateSupplierAddress = (pagination: MRT_PaginationState) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (address: Address) => {
      const res = dispatch(updateSupplierAddressStart({ ...address }));
      return res.payload;
    },

    onMutate: (editAddress: Address) => {
      queryClient.setQueryData(
        ["supplierAddresses", pagination.pageSize, pagination.pageIndex],
        (prevAaddresses: Address[]) =>
          prevAaddresses?.map((prevAddress: Address) => {
            return prevAddress.addressId === editAddress.addressId
              ? editAddress
              : prevAddress;
          }),
      );
    },

    onError: (error) => {
      console.log("onError", error);
    },

    onSettled: () => {
      const state = queryClient.getQueryState([
        "supplierAddresses",
        pagination.pageSize,
        pagination.pageIndex,
      ]);
      console.log("STATE : ", state?.dataUpdatedAt);

      queryClient.invalidateQueries({
        queryKey: ["supplierAddresses"],
        refetchType: "all",
      });

      // await queryClient.refetchQueries({ stale: true });

      queryClient.refetchQueries({
        queryKey: [
          "supplierAddresses",
          pagination.pageSize,
          pagination.pageIndex,
        ],
        type: "active",
        exact: true,
      });
    },
  });
};

interface deleteSupplierAddressParams {
  id: number;
  addressId: string;
}

// //DELETE hook (delete supplier address in api)
export const useDeleteSupplierAddress = (
  pagination: MRT_PaginationState,
  paginate: PaginationData,
  currentSupplierPageNumber: number,
  currentSupplierPageSize: number,
) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async ({ id, addressId }) => {
      //send api update request here

      const response = dispatch(deleteSupplierAddressStart(id, addressId));
      return response;
    },

    //client side optimistic update

    onMutate: ({ addressId }: deleteSupplierAddressParams) => {
      queryClient.setQueryData(
        ["supplierAddresses", pagination.pageSize, pagination.pageIndex],
        (prevBuyerAddresses: Address[]) =>
          prevBuyerAddresses?.filter(
            (buyerAddress: Address) => buyerAddress.addressId !== addressId,
          ),
      );
    },

    onSettled: () => {
      return (
        queryClient.invalidateQueries({
          queryKey: ["supplierAddresses"],
          refetchType: "all",
        }),
        queryClient.refetchQueries({
          queryKey: [
            "supplierAddresses",
            pagination.pageSize,
            pagination.pageIndex,
          ],
          type: "active",
          exact: true,
        })
      );

      //
      dispatch(
        loadAllSuppliersStart({
          ...paginate,
          pageSize: currentSupplierPageSize,
          pageIndex: currentSupplierPageNumber,
        }),
      );
    },
  });
};

// Port Destination
export const useGetPortDestinations = (
  paginate: PaginationData,
  pagination: MRT_PaginationState,
) => {
  const dispatch = useDispatch();

  return useQuery<PortDestination[]>({
    queryKey: ["portDestinations", pagination?.pageSize, pagination?.pageIndex],
    queryFn: async () => {
      dispatch(
        loadAllPortDestinationsStart({
          ...paginate,
          // pageIndex: pagination?.pageIndex,
          ...pagination,
        }),
      );
      return [];
    },
    refetchOnWindowFocus: false,
  });
};

export const useCreatePortDestination = (
  pagination: MRT_PaginationState,
  paginate: PaginationData,
) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (portDestination: PortDestination) => {
      const res = dispatch(createPortDestinationStart({ ...portDestination }));
      return res.payload;
    },

    onMutate: (newPortDestination: PortDestination) => {
      queryClient.setQueryData(
        ["portDestinations", pagination?.pageSize, pagination?.pageIndex],
        (prevPortDestinations: PortDestination[]) =>
          [
            { ...prevPortDestinations },
            {
              ...newPortDestination,
            },
          ] as PortDestination[],
      );
    },

    onSuccess: () => {
      dispatch(
        loadAllPortDestinationsStart({
          ...paginate,
          pageSize: pagination.pageSize,
          pageIndex: pagination.pageIndex,
        }),
      );
    },

    onError: (error) => {
      console.log("error ......!!!", error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["portDestinations"],
      });
    },
  });
};

export const useUpdatePortDestination = (pagination: MRT_PaginationState) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (portDestination: PortDestination) => {
      const res = dispatch(updatePortDestinationStart({ ...portDestination }));
      return res.payload;
    },

    onMutate: (editPortDestination: PortDestination) => {
      queryClient.setQueryData(
        ["portDestinations", pagination?.pageSize, pagination?.pageIndex],
        (prevPortDestinations: PortDestination[]) =>
          prevPortDestinations?.map((prevPortDestination: PortDestination) => {
            return prevPortDestination.id === editPortDestination.id &&
              prevPortDestination.countryCode ===
                editPortDestination.countryCode
              ? editPortDestination
              : prevPortDestination;
          }),
      );
    },

    onError: (error) => {
      console.log("onError", error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["portDestinations"],
        refetchType: "all",
      });

      queryClient.refetchQueries({
        queryKey: ["portDestinations"],
        type: "active",
        exact: true,
      });
    },
  });
};

type deletePortDestinationParams = {
  id: number;
  countryCode: string;
};

export const useDeletePortDestination = (pagination: MRT_PaginationState) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async ({ id, countryCode }: deletePortDestinationParams) => {
      const response = dispatch(deletePortDestinationStart(id, countryCode));
      return response;
    },

    onMutate: ({ id, countryCode }: deletePortDestinationParams) => {
      queryClient.setQueryData(
        ["portDestinations", pagination.pageSize, pagination.pageIndex],
        (prevPortDestinations: PortDestination[]) =>
          prevPortDestinations?.filter(
            (portDestination: PortDestination) =>
              portDestination.id !== id &&
              portDestination.countryCode !== countryCode,
          ),
      );
    },

    onSettled: () => {
      return (
        queryClient.invalidateQueries({
          queryKey: ["portDestinations"],
          refetchType: "all",
        }),
        queryClient.refetchQueries({
          queryKey: [
            "portDestinations",
            pagination.pageSize,
            pagination.pageIndex,
          ],
          type: "active",
          exact: true,
        })
      );
    },
  });
};

// Garment Types
export const useGetGarmentTypes = (
  paginate: PaginationData,
  pagination: MRT_PaginationState,
) => {
  const dispatch = useDispatch();

  return useQuery<GarmentType[]>({
    queryKey: ["garmentTypes", pagination?.pageSize, pagination?.pageIndex],
    queryFn: async () => {
      dispatch(
        loadAllGarmentTypesStart({
          ...paginate,
          // pageIndex: pagination?.pageIndex,
          ...pagination,
        }),
      );
      return [];
    },
    refetchOnWindowFocus: false,
  });
};

// CREATE hook (post new garment type to api)
export const useCreateGarmentType = (
  pagination: MRT_PaginationState,
  paginate: PaginationData,
) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (portDestination: GarmentType) => {
      const res = dispatch(createGarmentTypeStart({ ...portDestination }));
      return res.payload;
    },

    onMutate: (newGarmentType: GarmentType) => {
      queryClient.setQueryData(
        ["garmentTypes", pagination?.pageSize, pagination?.pageIndex],
        (prevGarmentTypes: GarmentType[]) =>
          [
            { ...prevGarmentTypes },
            {
              ...newGarmentType,
            },
          ] as GarmentType[],
      );
    },

    onSuccess: () => {
      dispatch(
        loadAllGarmentTypesStart({
          ...paginate,
          pageSize: pagination.pageSize,
          pageIndex: pagination.pageIndex,
        }),
      );
    },

    onError: (error) => {
      console.log("error ......!!!", error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["garmentTypes"],
      });
    },
  });
};

export const useUpdateGarmentType = (pagination: MRT_PaginationState) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (portDestination: GarmentType) => {
      const res = dispatch(updateGarmentTypeStart({ ...portDestination }));
      return res.payload;
    },

    onMutate: (editGarmentType: GarmentType) => {
      queryClient.setQueryData(
        ["garmentTypes", pagination?.pageSize, pagination?.pageIndex],
        (prevGarmentTypes: GarmentType[]) =>
          prevGarmentTypes?.map((prevGarmentType: GarmentType) => {
            return prevGarmentType.id === editGarmentType.id &&
              prevGarmentType.id === editGarmentType.id
              ? editGarmentType
              : prevGarmentType;
          }),
      );
    },

    onError: (error) => {
      console.log("onError", error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["garmentTypes"],
        refetchType: "all",
      });

      queryClient.refetchQueries({
        queryKey: ["garmentTypes"],
        type: "active",
        exact: true,
      });
    },
  });
};

// type deleteGarmentTypeParams = {
//   id: number;
//   countryCode: string;
// };

export const useDeleteGarmentType = (pagination: MRT_PaginationState) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (id) => {
      const response = dispatch(deleteGarmentTypeStart(id));
      return response;
    },

    onMutate: (id: number) => {
      queryClient.setQueryData(
        ["garmentTypes", pagination.pageSize, pagination.pageIndex],
        (prevGarmentTypes: GarmentType[]) =>
          prevGarmentTypes?.filter(
            (portGarmentType: GarmentType) =>
              portGarmentType.id !== id && portGarmentType.id !== id,
          ),
      );
    },

    onSettled: () => {
      return (
        queryClient.invalidateQueries({
          queryKey: ["garmentTypes"],
          refetchType: "all",
        }),
        queryClient.refetchQueries({
          queryKey: ["garmentTypes", pagination.pageSize, pagination.pageIndex],
          type: "active",
          exact: true,
        })
      );
    },
  });
};

// currency
export const useGetCurrencies = (
  paginate: PaginationData,
  pagination: MRT_PaginationState,
) => {
  const dispatch = useDispatch();

  return useQuery<Currency[]>({
    queryKey: ["currencies", pagination?.pageSize, pagination?.pageIndex],
    queryFn: async () => {
      dispatch(
        loadAllCurrenciesStart({
          ...paginate,
          // pageIndex: pagination?.pageIndex,
          ...pagination,
        }),
      );
      return [];
    },
    refetchOnWindowFocus: false,
  });
};

export const useCreateCurrency = (
  pagination: MRT_PaginationState,
  paginate: PaginationData,
) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (currency: Currency) => {
      const res = dispatch(createCurrencyStart({ ...currency }));
      return res.payload;
    },

    onMutate: (newCurrency: Currency) => {
      queryClient.setQueryData(
        ["currencies", pagination?.pageSize, pagination?.pageIndex],
        (prevUnits: Currency[]) =>
          [
            { ...prevUnits },
            {
              ...newCurrency,
            },
          ] as Currency[],
      );
    },

    onSuccess: () => {
      dispatch(
        loadAllUnitsStart({
          ...paginate,
          pageSize: pagination.pageSize,
          pageIndex: pagination.pageIndex,
        }),
      );
    },

    onError: (error) => {
      console.log("error ......!!!", error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["currencies"],
      });
    },
  });
};

// UPDATE hook, (put currency in api)
export const useUpdateCurrency = (pagination: MRT_PaginationState) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (portDestination: Currency) => {
      const res = dispatch(updateCurrencyStart({ ...portDestination }));
      return res.payload;
    },

    onMutate: (editCurrency: Currency) => {
      queryClient.setQueryData(
        ["currencies", pagination?.pageSize, pagination?.pageIndex],
        (prevUnits: Currency[]) =>
          prevUnits?.map((prevCurrency: Currency) => {
            return prevCurrency.id === editCurrency.id &&
              prevCurrency.id === editCurrency.id
              ? editCurrency
              : prevCurrency;
          }),
      );
    },

    onError: (error) => {
      console.log("onError", error);
    },

    //refetch portDestinations after mutation,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["currencies"],
        refetchType: "all",
      });

      //queryKey: ["portDestinations", pagination.pageSize, pagination.pageIndex],
      queryClient.refetchQueries({
        queryKey: ["currencies"],
        type: "active",
        exact: true,
      });
    },
  });
};

// type deleteCurrencyParams = {
//   id: number;
//   countryCode: string;
// };

export const useDeleteCurrency = (pagination: MRT_PaginationState) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (id) => {
      const response = dispatch(deleteCurrencyStart(id));
      return response;
    },

    onMutate: (id: number) => {
      queryClient.setQueryData(
        ["currencies", pagination.pageSize, pagination.pageIndex],
        (prevUnits: Currency[]) =>
          prevUnits?.filter(
            (portCurrency: Currency) =>
              portCurrency.id !== id && portCurrency.id !== id,
          ),
      );
    },

    onSettled: () => {
      return (
        queryClient.invalidateQueries({
          queryKey: ["currencies"],
          refetchType: "all",
        }),
        queryClient.refetchQueries({
          queryKey: ["currencies", pagination.pageSize, pagination.pageIndex],
          type: "active",
          exact: true,
        })
      );
    },
  });
};

// units
export const useGetUnits = (
  paginate: PaginationData,
  pagination: MRT_PaginationState,
) => {
  const dispatch = useDispatch();

  return useQuery<Unit[]>({
    queryKey: ["units", pagination?.pageSize, pagination?.pageIndex],
    queryFn: async () => {
      dispatch(
        loadAllUnitsStart({
          ...paginate,
          // pageIndex: pagination?.pageIndex,
          ...pagination,
        }),
      );
      return [];
    },
    refetchOnWindowFocus: false,
  });
};

export const useCreateUnit = (
  pagination: MRT_PaginationState,
  paginate: PaginationData,
) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (unit: Unit) => {
      const res = dispatch(createUnitStart({ ...unit }));
      return res.payload;
    },

    onMutate: (newUnit: Unit) => {
      queryClient.setQueryData(
        ["units", pagination?.pageSize, pagination?.pageIndex],
        (prevUnits: Unit[]) =>
          [
            { ...prevUnits },
            {
              ...newUnit,
            },
          ] as Unit[],
      );
    },

    onSuccess: () => {
      dispatch(
        loadAllUnitsStart({
          ...paginate,
          pageSize: pagination.pageSize,
          pageIndex: pagination.pageIndex,
        }),
      );
    },

    onError: (error) => {
      console.log("error ......!!!", error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["units"],
      });
    },
  });
};

export const useUpdateUnit = (pagination: MRT_PaginationState) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (portDestination: Unit) => {
      const res = dispatch(updateUnitStart({ ...portDestination }));
      return res.payload;
    },

    onMutate: (editUnit: Unit) => {
      queryClient.setQueryData(
        ["units", pagination?.pageSize, pagination?.pageIndex],
        (prevUnits: Unit[]) =>
          prevUnits?.map((prevUnit: Unit) => {
            return prevUnit.id === editUnit.id && prevUnit.id === editUnit.id
              ? editUnit
              : prevUnit;
          }),
      );
    },

    onError: (error) => {
      console.log("onError", error);
    },

    //refetch portDestinations after mutation,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["units"],
        refetchType: "all",
      });

      queryClient.refetchQueries({
        queryKey: ["units"],
        type: "active",
        exact: true,
      });
    },
  });
};

// type deleteUnitParams = {
//   id: number;
//   countryCode: string;
// };

export const useDeleteUnit = (pagination: MRT_PaginationState) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (id) => {
      const response = dispatch(deleteUnitStart(id));
      return response;
    },

    onMutate: (id: number) => {
      queryClient.setQueryData(
        ["units", pagination.pageSize, pagination.pageIndex],
        (prevUnits: Unit[]) =>
          prevUnits?.filter(
            (portUnit: Unit) => portUnit.id !== id && portUnit.id !== id,
          ),
      );
    },

    onSettled: () => {
      return (
        queryClient.invalidateQueries({
          queryKey: ["units"],
          refetchType: "all",
        }),
        queryClient.refetchQueries({
          queryKey: ["units", pagination.pageSize, pagination.pageIndex],
          type: "active",
          exact: true,
        })
      );
    },
  });
};

// basis
export const useGetBasises = (
  paginate: PaginationData,
  pagination: MRT_PaginationState,
) => {
  const dispatch = useDispatch();

  return useQuery<Basis[]>({
    queryKey: ["basises", pagination?.pageSize, pagination?.pageIndex],
    queryFn: async () => {
      dispatch(
        loadAllBasisesStart({
          ...paginate,
          // pageIndex: pagination?.pageIndex,
          ...pagination,
        }),
      );
      return [];
    },
    refetchOnWindowFocus: false,
  });
};

// PO
export const useGetPurchaseOrder = (po: PurchaseOrder) => {
  const dispatch = useDispatch();

  return useQuery<PurchaseOrder[]>({
    queryKey: ["po"],
    queryFn: async () => {
      dispatch(loadOrderStart(po));
      return [];
    },
    refetchOnWindowFocus: false,
  });
};

// hook to load Port destinations
export const useGetAllCountryPortDestinations = (
  paginate: PaginationData,
  pagination: MRT_PaginationState,
) => {
  return useGetPortDestinations(paginate, pagination);
};

// Currency Conversions

// READ hook, (get currencyExchanges in api)
export const useGetCurrencyConversions = (
  paginate: PaginationData,
  pagination: MRT_PaginationState,
) => {
  const dispatch = useDispatch();

  return useQuery<CurrencyConversion[]>({
    queryKey: [
      "currencyExchanges",
      pagination?.pageSize,
      pagination?.pageIndex,
    ],
    queryFn: async () => {
      dispatch(
        loadAllCurrencyConversionsStart({
          ...paginate,
          // pageIndex: pagination?.pageIndex,
          ...pagination,
        }),
      );
      return [];
    },
    refetchOnWindowFocus: false,
  });
};

export const useCreateCurrencyConversion = (
  pagination: MRT_PaginationState,
  paginate: PaginationData,
) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (currencyConversion: CurrencyConversion) => {
      const res = dispatch(
        createCurrencyConversionStart({ ...currencyConversion }),
      );
      return res.payload;
    },

    onMutate: (newCurrencyConversion: CurrencyConversion) => {
      queryClient.setQueryData(
        ["currencyConversions", pagination?.pageSize, pagination?.pageIndex],
        (prevCurrencyConversion: CurrencyConversion[]) =>
          [
            { ...prevCurrencyConversion },
            {
              ...newCurrencyConversion,
            },
          ] as CurrencyConversion[],
      );
    },

    onSuccess: (data) => {
      console.log("success:", data);
      dispatch(
        loadAllCurrencyConversionsStart({
          ...paginate,
          pageSize: pagination.pageSize,
          pageIndex: pagination.pageIndex,
        }),
      );
    },

    onError: (error) => {
      console.log("error ......!!!", error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["currencyConversions"],
      });
    },
  });
};

type deleteCurrencyConversionParams = {
  fromCurrencyCode: string;
  toCurrencyCode: string;
  date: Date;
};

export const useDeleteCurrencyConversion = (
  pagination: MRT_PaginationState,
) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (params: deleteCurrencyConversionParams) => {
      const response = dispatch(deleteCurrencyConversionStart(params));
      return response;
    },

    onMutate: (params: deleteCurrencyConversionParams) => {
      queryClient.setQueryData(
        ["currencyConversions", pagination.pageSize, pagination.pageIndex],
        (prevCurrencyConversions: CurrencyConversion[]) =>
          prevCurrencyConversions?.filter(
            (currencyConversion: CurrencyConversion) =>
              currencyConversion.fromCurrency !== params.fromCurrencyCode &&
              currencyConversion.toCurrency !== params.toCurrencyCode &&
              currencyConversion.date !== params.date,
          ),
      );
    },

    onSettled: () => {
      return (
        queryClient.invalidateQueries({
          queryKey: ["buyers"],
          refetchType: "all",
        }),
        queryClient.refetchQueries({
          queryKey: ["buyers", pagination.pageSize, pagination.pageIndex],
          type: "active",
          exact: true,
        })
      );
    },
  });
};

// Currency Exchanges

export const useGetCurrencyExchanges = (
  paginate: PaginationData,
  pagination: MRT_PaginationState,
) => {
  const dispatch = useDispatch();

  return useQuery<CurrencyExchange[]>({
    queryKey: [
      "currencyExchanges",
      pagination?.pageSize,
      pagination?.pageIndex,
    ],
    queryFn: async () => {
      dispatch(
        loadAllCurrencyExchangesStart({
          ...paginate,
          // pageIndex: pagination?.pageIndex,
          ...pagination,
        }),
      );
      return [];
    },
    refetchOnWindowFocus: false,
  });
};

export const useCreateCurrencyExchange = (
  pagination: MRT_PaginationState,
  paginate: PaginationData,
) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (currencyExchange: CurrencyExchange) => {
      const res = dispatch(
        createCurrencyExchangeStart({ ...currencyExchange }),
      );
      return res.payload;
    },

    onMutate: (newCurrencyExchange: CurrencyExchange) => {
      queryClient.setQueryData(
        ["currencyExchanges", pagination?.pageSize, pagination?.pageIndex],
        (prevCurrencyExchange: CurrencyExchange[]) =>
          [
            { ...prevCurrencyExchange },
            {
              ...newCurrencyExchange,
            },
          ] as CurrencyExchange[],
      );
    },

    onSuccess: (data) => {
      console.log("success:", data);
      dispatch(
        loadAllCurrencyConversionsStart({
          ...paginate,
          pageSize: pagination.pageSize,
          pageIndex: pagination.pageIndex,
        }),
      );
    },

    onError: (error) => {
      console.log("error ......!!!", error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["currencyExchanges"],
      });
    },
  });
};

type deleteCurrencyExchangeParams = {
  baseCurrency: string;
  quoteCurrency: string;
  exchangeDate: Date;
};

export const useUpdateCurrencyExchange = (pagination: MRT_PaginationState) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (currencyExchange: CurrencyExchange) => {
      const res = dispatch(
        updateCurrencyExchangeStart({ ...currencyExchange }),
      );
      return res.payload;
    },

    onMutate: (editCurrencyExchange: CurrencyExchange) => {
      queryClient.setQueryData(
        ["units", pagination?.pageSize, pagination?.pageIndex],
        (prevCurrencyExchanges: CurrencyExchange[]) =>
          prevCurrencyExchanges?.map(
            (prevCurrencyExchange: CurrencyExchange) => {
              return prevCurrencyExchange.baseCurrency ===
                editCurrencyExchange.baseCurrency &&
                prevCurrencyExchange.quoteCurrency ===
                  editCurrencyExchange.quoteCurrency
                ? editCurrencyExchange
                : prevCurrencyExchange;
            },
          ),
      );
    },

    onError: (error) => {
      console.log("onError", error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["units"],
        refetchType: "all",
      });

      queryClient.refetchQueries({
        queryKey: ["units"],
        type: "active",
        exact: true,
      });
    },
  });
};

export const useDeleteCurrencyExchange = (pagination: MRT_PaginationState) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (params: deleteCurrencyExchangeParams) => {
      const response = dispatch(deleteCurrencyExchangeStart(params));
      return response;
    },

    onMutate: (params: deleteCurrencyExchangeParams) => {
      queryClient.setQueryData(
        ["currencyExchanges", pagination.pageSize, pagination.pageIndex],
        (prevCurrencyExchanges: CurrencyConversion[]) =>
          prevCurrencyExchanges?.filter(
            (currencyExchanges: CurrencyConversion) =>
              currencyExchanges.fromCurrency !== params.baseCurrency &&
              currencyExchanges.toCurrency !== params.quoteCurrency &&
              currencyExchanges.date !== params.exchangeDate,
          ),
      );
    },

    onSettled: () => {
      return (
        queryClient.invalidateQueries({
          queryKey: ["currencyExchanges"],
          refetchType: "all",
        }),
        queryClient.refetchQueries({
          queryKey: [
            "currencyExchanges",
            pagination.pageSize,
            pagination.pageIndex,
          ],
          type: "active",
          exact: true,
        })
      );
    },
  });
};
