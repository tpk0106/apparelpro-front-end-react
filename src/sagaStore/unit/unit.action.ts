import type { PaginationData } from "../../interfaces/definitions";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { Unit } from "../../interfaces/references/Unit";

import { createAction } from "../../utils/reducer/reducer.utils";
import { UNITS_ACTION_TYPES } from "./unit.types";

// load
const loadAllUnitsStart = ({ ...pagination }: PaginationData) => {
  return createAction(UNITS_ACTION_TYPES.LOAD_ALL_UNITS_START, pagination);
};

const loadAllUnitsSuccess = (suppliers: PaginationAPIModel<Unit>) => {
  return createAction(UNITS_ACTION_TYPES.LOAD_ALL_UNITS_SUCCESS, suppliers);
};

const loadAllUnitsFailure = (error: unknown) => {
  return createAction(UNITS_ACTION_TYPES.LOAD_ALL_UNITS_FAILURE, error);
};

// create
const createUnitStart = (supplier: Unit) => {
  return createAction(UNITS_ACTION_TYPES.CREATE_UNIT_START, supplier);
};

const createUnitSuccess = (success: boolean) => {
  return createAction(UNITS_ACTION_TYPES.CREATE_UNIT_SUCCESS, success);
};

const createUnitFailure = (error: unknown) => {
  return createAction(UNITS_ACTION_TYPES.CREATE_UNIT_FAILURE, error);
};

// update
const updateUnitStart = (supplierToEdit: Unit) => {
  return createAction(UNITS_ACTION_TYPES.UPDATE_UNIT_START, supplierToEdit);
};

const updateUnitSuccess = (success: boolean) => {
  return createAction(UNITS_ACTION_TYPES.UPDATE_UNIT_SUCCESS, success);
};

const updateUnitFailure = (error: unknown) => {
  return createAction(UNITS_ACTION_TYPES.UPDATE_UNIT_FAILURE, error);
};

// delete
const deleteUnitStart = (supplierCode: number) => {
  return createAction(UNITS_ACTION_TYPES.DELETE_UNIT_START, supplierCode);
};

const deleteUnitSuccess = (success: boolean) => {
  return createAction(UNITS_ACTION_TYPES.DELETE_UNIT_SUCCESS, success);
};

const deleteUnitFailure = (error: unknown) => {
  return createAction(UNITS_ACTION_TYPES.DELETE_UNIT_FAILURE, error);
};

export {
  loadAllUnitsStart,
  loadAllUnitsSuccess,
  loadAllUnitsFailure,
  createUnitStart,
  createUnitSuccess,
  createUnitFailure,
  updateUnitStart,
  updateUnitSuccess,
  updateUnitFailure,
  deleteUnitStart,
  deleteUnitSuccess,
  deleteUnitFailure,
};
