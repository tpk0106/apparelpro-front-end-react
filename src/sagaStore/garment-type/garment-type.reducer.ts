import type { PayloadAction } from "@reduxjs/toolkit";

import { GARMENT_TYPES_ACTION_TYPES } from "./garment-type.types";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { GarmentType } from "../../interfaces/references/GarmentType";
import type { GarmentTypeState } from "../redux-reducer-interfaces";

const INITIAL_STATE: GarmentTypeState = {
  paginationAPIResult: null,
  error: null,
  isLoading: false,
  success: false,
};

const garmentTypeReducer = (
  state = INITIAL_STATE,
  action: PayloadAction<PaginationAPIModel<GarmentType>>,
) => {
  const { payload, type } = action;

  switch (type) {
    case GARMENT_TYPES_ACTION_TYPES.LOAD_ALL_GARMENT_TYPES_SUCCESS:
      return {
        ...state,
        isLoading: false,
        success: true,
        error: null,
        // NOTE (2026-08-09): was `payload.data ? payload.data : payload` -
        // PaginationAPIModel<T>.data is a single T, not the paginated
        // envelope, so that ternary leaked a GarmentType | PaginationAPIModel
        // union into GarmentTypeState. This reducer branch is unreachable
        // from any live UI (superseded by the TanStack Query garment-type
        // hooks) but is still type-checked, so pin it to the full payload,
        // matching the declared PaginationAPIModel<GarmentType> shape.
        paginationAPIResult: payload,
      };
    case GARMENT_TYPES_ACTION_TYPES.LOAD_ALL_GARMENT_TYPES_FAILURE:
      return {
        ...state,
        isLoading: false,
        success: false,
        error: payload,
        paginationAPIResult: null,
      };
    case GARMENT_TYPES_ACTION_TYPES.CREATE_GARMENT_TYPE_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        success: false,
        paginationAPIResult: null,
      };
    case GARMENT_TYPES_ACTION_TYPES.CREATE_GARMENT_TYPE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        success: true,
        paginationAPIResult: null,
      };
    case GARMENT_TYPES_ACTION_TYPES.CREATE_GARMENT_TYPE_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: payload,
        success: false,
        paginationAPIResult: null,
      };
    case GARMENT_TYPES_ACTION_TYPES.UPDATE_GARMENT_TYPE_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        success: false,
        paginationAPIResult: null,
      };
    case GARMENT_TYPES_ACTION_TYPES.UPDATE_GARMENT_TYPE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        success: true,
        paginationAPIResult: null,
      };
    case GARMENT_TYPES_ACTION_TYPES.UPDATE_GARMENT_TYPE_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: payload,
        success: false,
        paginationAPIResult: null,
      };
    case GARMENT_TYPES_ACTION_TYPES.DELETE_GARMENT_TYPE_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        success: false,
        paginationAPIResult: null,
      };
    case GARMENT_TYPES_ACTION_TYPES.DELETE_GARMENT_TYPE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        success: true,
        paginationAPIResult: null,
      };
    case GARMENT_TYPES_ACTION_TYPES.DELETE_GARMENT_TYPE_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: payload,
        success: false,
        paginationAPIResult: null,
      };
    default:
      return state;
  }
};

export { garmentTypeReducer };
