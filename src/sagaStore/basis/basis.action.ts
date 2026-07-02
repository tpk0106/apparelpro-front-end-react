import type { PaginationData } from "../../interfaces/definitions";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { Basis } from "../../interfaces/references/Basis";

import { createAction } from "../../utils/reducer/reducer.utils";
import { BASISES_ACTION_TYPES } from "./basis.types";

// load
const loadAllBasisesStart = ({ ...pagination }: PaginationData) => {
  return createAction(BASISES_ACTION_TYPES.LOAD_ALL_BASISES_START, pagination);
};

const loadAllBasisesSuccess = (suppliers: PaginationAPIModel<Basis>) => {
  return createAction(BASISES_ACTION_TYPES.LOAD_ALL_BASISES_SUCCESS, suppliers);
};

const loadAllBasisesFailure = (error: unknown) => {
  return createAction(BASISES_ACTION_TYPES.LOAD_ALL_BASISES_FAILURE, error);
};

// create
const createBasisStart = (supplier: Basis) => {
  return createAction(BASISES_ACTION_TYPES.CREATE_BASIS_START, supplier);
};

const createBasisSuccess = (success: boolean) => {
  return createAction(BASISES_ACTION_TYPES.CREATE_BASIS_SUCCESS, success);
};

const createBasisFailure = (error: unknown) => {
  return createAction(BASISES_ACTION_TYPES.CREATE_BASIS_FAILURE, error);
};

// update
const updateBasisStart = (supplierToEdit: Basis) => {
  return createAction(BASISES_ACTION_TYPES.UPDATE_BASIS_START, supplierToEdit);
};

const updateBasisSuccess = (success: boolean) => {
  return createAction(BASISES_ACTION_TYPES.UPDATE_BASIS_SUCCESS, success);
};

const updateBasisFailure = (error: unknown) => {
  return createAction(BASISES_ACTION_TYPES.UPDATE_BASIS_FAILURE, error);
};

// delete
const deleteBasisStart = (supplierCode: number) => {
  return createAction(BASISES_ACTION_TYPES.DELETE_BASIS_START, supplierCode);
};

const deleteBasisSuccess = (success: boolean) => {
  return createAction(BASISES_ACTION_TYPES.DELETE_BASIS_SUCCESS, success);
};

const deleteBasisFailure = (error: unknown) => {
  return createAction(BASISES_ACTION_TYPES.DELETE_BASIS_FAILURE, error);
};

export {
  loadAllBasisesStart,
  loadAllBasisesSuccess,
  loadAllBasisesFailure,
  createBasisStart,
  createBasisSuccess,
  createBasisFailure,
  updateBasisStart,
  updateBasisSuccess,
  updateBasisFailure,
  deleteBasisStart,
  deleteBasisSuccess,
  deleteBasisFailure,
};
