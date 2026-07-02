import type { PaginationData } from "../../interfaces/definitions";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { Supplier } from "../../interfaces/references/Supplier";
import { createAction } from "../../utils/reducer/reducer.utils";
import { SUPPLIERS_ACTION_TYPES } from "./supplier.types";

// load
const loadAllSuppliersStart = ({ ...pagination }: PaginationData) => {
  return createAction(
    SUPPLIERS_ACTION_TYPES.LOAD_ALL_SUPPLIERS_START,
    pagination,
  );
};

const loadAllSuppliersSuccess = (suppliers: PaginationAPIModel<Supplier>) => {
  return createAction(
    SUPPLIERS_ACTION_TYPES.LOAD_ALL_SUPPLIERS_SUCCESS,
    suppliers,
  );
};

const loadAllSuppliersFailure = (error: unknown) => {
  return createAction(SUPPLIERS_ACTION_TYPES.LOAD_ALL_SUPPLIERS_FAILURE, error);
};

// create
const createSupplierStart = (supplier: Supplier) => {
  return createAction(SUPPLIERS_ACTION_TYPES.CREATE_SUPPLIER_START, supplier);
};

const createSupplierSuccess = (success: boolean) => {
  return createAction(SUPPLIERS_ACTION_TYPES.CREATE_SUPPLIER_SUCCESS, success);
};

const createSupplierFailure = (error: unknown) => {
  return createAction(SUPPLIERS_ACTION_TYPES.CREATE_SUPPLIER_FAILURE, error);
};

// update
const updateSupplierStart = (supplierToEdit: Supplier) => {
  return createAction(
    SUPPLIERS_ACTION_TYPES.UPDATE_SUPPLIER_START,
    supplierToEdit,
  );
};

const updateSupplierSuccess = (success: boolean) => {
  return createAction(SUPPLIERS_ACTION_TYPES.UPDATE_SUPPLIER_SUCCESS, success);
};

const updateSupplierFailure = (error: unknown) => {
  return createAction(SUPPLIERS_ACTION_TYPES.UPDATE_SUPPLIER_FAILURE, error);
};

const deleteSupplierStart = (supplierCode: number) => {
  return createAction(
    SUPPLIERS_ACTION_TYPES.DELETE_SUPPLIER_START,
    supplierCode,
  );
};

const deleteSupplierSuccess = (success: boolean) => {
  return createAction(SUPPLIERS_ACTION_TYPES.DELETE_SUPPLIER_SUCCESS, success);
};

const deleteSupplierFailure = (error: unknown) => {
  return createAction(SUPPLIERS_ACTION_TYPES.DELETE_SUPPLIER_FAILURE, error);
};

export {
  loadAllSuppliersStart,
  loadAllSuppliersSuccess,
  loadAllSuppliersFailure,
  createSupplierStart,
  createSupplierSuccess,
  createSupplierFailure,
  updateSupplierStart,
  updateSupplierSuccess,
  updateSupplierFailure,
  deleteSupplierStart,
  deleteSupplierSuccess,
  deleteSupplierFailure,
};
