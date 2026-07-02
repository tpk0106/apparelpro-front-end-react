import type { CreateAddressAPIModel } from "../../interfaces/definitions";
import type { Address } from "../../interfaces/references/Address";
import { createAction } from "../../utils/reducer/reducer.utils";
import { ADDRESS_ACTION_TYPES } from "./address.types";

const loadAllAddressesForBuyerStart = (addressId: string) => {
  return createAction(
    ADDRESS_ACTION_TYPES.LOAD_ADDRESSES_BY_ADDRESSID_START,
    addressId,
  );
};

const loadAllAddressesForBuyerSuccess = (addresses: Address[]) => {
  return createAction(
    ADDRESS_ACTION_TYPES.LOAD_ADDRESSES_BY_ADDRESSID_START,
    addresses,
  );
};

const loadAllAddressesForBuyerFailure = (error: unknown) => {
  return createAction(
    ADDRESS_ACTION_TYPES.LOAD_ADDRESSES_BY_ADDRESSID_START,
    error,
  );
};

const createBuyerAddressStart = ({
  ...createAddressAPIModel
}: CreateAddressAPIModel) => {
  return createAction(
    ADDRESS_ACTION_TYPES.CREATE_ADDRESS_START,
    createAddressAPIModel,
  );
};

const createBuyerAddressSuccess = (success: boolean) => {
  return createAction(ADDRESS_ACTION_TYPES.CREATE_ADDRESS_SUCCESS, success);
};

const createBuyerAddressFailure = (error: unknown) => {
  return createAction(ADDRESS_ACTION_TYPES.CREATE_ADDRESS_FAILURE, error);
};

const updateBuyerAddressStart = (buyerAddress: Address) => {
  return createAction(ADDRESS_ACTION_TYPES.UPDATE_ADDRESS_START, buyerAddress);
};

const updateBuyerAddressSuccess = (success: boolean) => {
  return createAction(ADDRESS_ACTION_TYPES.UPDATE_ADDRESS_SUCCESS, success);
};

const updateBuyerAddressFailure = (error: unknown) => {
  return createAction(ADDRESS_ACTION_TYPES.UPDATE_ADDRESS_FAILURE, error);
};

const deleteBuyerAddressStart = (id: number, addressId: string) => {
  return createAction(ADDRESS_ACTION_TYPES.DELETE_ADDRESS_START, {
    id,
    addressId,
  });
};

const deleteBuyerAddressSuccess = (success: boolean) => {
  return createAction(ADDRESS_ACTION_TYPES.DELETE_ADDRESS_SUCCESS, success);
};

const deleteBuyerAddressFailure = (error: unknown) => {
  return createAction(ADDRESS_ACTION_TYPES.DELETE_ADDRESS_FAILURE, error);
};

// Supplier

const createSupplierAddressStart = ({
  ...createAddressAPIModel
}: CreateAddressAPIModel) => {
  return createAction(
    ADDRESS_ACTION_TYPES.CREATE_ADDRESS_START,
    createAddressAPIModel,
  );
};

const createSupplierAddressSuccess = (success: boolean) => {
  return createAction(ADDRESS_ACTION_TYPES.CREATE_ADDRESS_SUCCESS, success);
};

const createSupplierAddressFailure = (error: unknown) => {
  return createAction(ADDRESS_ACTION_TYPES.CREATE_ADDRESS_FAILURE, error);
};

const updateSupplierAddressStart = (supplierAddress: Address) => {
  return createAction(
    ADDRESS_ACTION_TYPES.UPDATE_ADDRESS_START,
    supplierAddress,
  );
};

const updateSupplierAddressSuccess = (success: boolean) => {
  return createAction(ADDRESS_ACTION_TYPES.UPDATE_ADDRESS_SUCCESS, success);
};

const updateSupplierAddressFailure = (error: unknown) => {
  return createAction(ADDRESS_ACTION_TYPES.UPDATE_ADDRESS_FAILURE, error);
};

const deleteSupplierAddressStart = (id: number, addressId: string) => {
  return createAction(ADDRESS_ACTION_TYPES.DELETE_ADDRESS_START, {
    id,
    addressId,
  });
};

const deleteSupplierAddressSuccess = (success: boolean) => {
  return createAction(ADDRESS_ACTION_TYPES.DELETE_ADDRESS_SUCCESS, success);
};

const deleteSupplierAddressFailure = (error: unknown) => {
  return createAction(ADDRESS_ACTION_TYPES.DELETE_ADDRESS_FAILURE, error);
};

export {
  loadAllAddressesForBuyerStart,
  loadAllAddressesForBuyerSuccess,
  loadAllAddressesForBuyerFailure,
  createBuyerAddressStart,
  createBuyerAddressSuccess,
  createBuyerAddressFailure,
  updateBuyerAddressStart,
  updateBuyerAddressSuccess,
  updateBuyerAddressFailure,
  deleteBuyerAddressStart,
  deleteBuyerAddressSuccess,
  deleteBuyerAddressFailure,
  createSupplierAddressStart,
  createSupplierAddressSuccess,
  createSupplierAddressFailure,
  updateSupplierAddressStart,
  updateSupplierAddressSuccess,
  updateSupplierAddressFailure,
  deleteSupplierAddressStart,
  deleteSupplierAddressSuccess,
  deleteSupplierAddressFailure,
};
