import type { PaginationData } from "../../interfaces/definitions";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { GarmentType } from "../../interfaces/references/GarmentType";

import { createAction } from "../../utils/reducer/reducer.utils";
import { GARMENT_TYPES_ACTION_TYPES } from "./garment-type.types";

// load
const loadAllGarmentTypesStart = ({ ...pagination }: PaginationData) => {
  return createAction(
    GARMENT_TYPES_ACTION_TYPES.LOAD_ALL_GARMENT_TYPES_START,
    pagination,
  );
};

const loadAllGarmentTypesSuccess = (
  garmentTypes: PaginationAPIModel<GarmentType>,
) => {
  return createAction(
    GARMENT_TYPES_ACTION_TYPES.LOAD_ALL_GARMENT_TYPES_SUCCESS,
    garmentTypes,
  );
};

const loadAllGarmentTypesFailure = (error: unknown) => {
  return createAction(
    GARMENT_TYPES_ACTION_TYPES.LOAD_ALL_GARMENT_TYPES_FAILURE,
    error,
  );
};

// create
const createGarmentTypeStart = (garmentTypes: GarmentType) => {
  return createAction(
    GARMENT_TYPES_ACTION_TYPES.CREATE_GARMENT_TYPE_START,
    garmentTypes,
  );
};

const createGarmentTypeSuccess = (success: boolean) => {
  return createAction(
    GARMENT_TYPES_ACTION_TYPES.CREATE_GARMENT_TYPE_SUCCESS,
    success,
  );
};

const createGarmentTypeFailure = (error: unknown) => {
  return createAction(
    GARMENT_TYPES_ACTION_TYPES.CREATE_GARMENT_TYPE_FAILURE,
    error,
  );
};

// update
const updateGarmentTypeStart = (garmentTypesToEdit: GarmentType) => {
  return createAction(
    GARMENT_TYPES_ACTION_TYPES.UPDATE_GARMENT_TYPE_START,
    garmentTypesToEdit,
  );
};

const updateGarmentTypeSuccess = (success: boolean) => {
  return createAction(
    GARMENT_TYPES_ACTION_TYPES.UPDATE_GARMENT_TYPE_SUCCESS,
    success,
  );
};

const updateGarmentTypeFailure = (error: unknown) => {
  return createAction(
    GARMENT_TYPES_ACTION_TYPES.UPDATE_GARMENT_TYPE_FAILURE,
    error,
  );
};

const deleteGarmentTypeStart = (garmentTypesCode: number) => {
  return createAction(
    GARMENT_TYPES_ACTION_TYPES.DELETE_GARMENT_TYPE_START,
    garmentTypesCode,
  );
};

const deleteGarmentTypeSuccess = (success: boolean) => {
  return createAction(
    GARMENT_TYPES_ACTION_TYPES.DELETE_GARMENT_TYPE_SUCCESS,
    success,
  );
};

const deleteGarmentTypeFailure = (error: unknown) => {
  return createAction(
    GARMENT_TYPES_ACTION_TYPES.DELETE_GARMENT_TYPE_FAILURE,
    error,
  );
};

export {
  loadAllGarmentTypesStart,
  loadAllGarmentTypesSuccess,
  loadAllGarmentTypesFailure,
  createGarmentTypeStart,
  createGarmentTypeSuccess,
  createGarmentTypeFailure,
  updateGarmentTypeStart,
  updateGarmentTypeSuccess,
  updateGarmentTypeFailure,
  deleteGarmentTypeStart,
  deleteGarmentTypeSuccess,
  deleteGarmentTypeFailure,
};
