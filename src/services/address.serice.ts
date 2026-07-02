import { client } from "../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type {
  CreateAddressAPIModel,
  PaginationData,
} from "../interfaces/definitions";
import type { Address } from "../interfaces/references/Address";

const loadAllAddressesForBuyerCode = async (
  buyerCode: number,
  data: PaginationData,
) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ADDRESS.GET_BY_BUYER_CODE,
    {
      params: {
        buyerCode: buyerCode,
        pageNumber: data.pageIndex,
        pageSize: data.pageSize,
        sortColumn: data.sortColumn,
        sortOrder: data.sortOrder,
        filterColumn: data.filterColumn,
        filterQuery: data.filterQuery,
      },
    },
  );
};

const createNewBuyerAddress = async (
  createAddressAPIModel: CreateAddressAPIModel,
) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ADDRESS.POST,
    createAddressAPIModel,
  );
};

const removeBuyerAddress = async (buyerId: number, buyerAddressId: string) => {
  return await client.delete(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ADDRESS.DELETE +
      buyerId +
      "/" +
      buyerAddressId,
  );
};

const updateAddress = async (
  addressId: string,
  existingBuyerAddress: Address,
) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ADDRESS.PUT,
    existingBuyerAddress,
    {
      params: {
        buyerCode: existingBuyerAddress.buyerCode,
        addressId: addressId,
      },
    },
  );
};

const updateBuyerAddress = async (
  buyerCode: number,
  addressId: string,
  existingBuyerAddress: Address,
) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ADDRESS
      .UPDATE_BY_BUYER_CODE_AND_ADDRESS_ID +
      "/" +
      buyerCode +
      "/" +
      addressId,
    existingBuyerAddress,
  );
};

export {
  loadAllAddressesForBuyerCode,
  updateAddress,
  createNewBuyerAddress,
  removeBuyerAddress,
  updateBuyerAddress,
};
