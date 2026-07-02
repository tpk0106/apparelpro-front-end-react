import type { PayloadAction } from "@reduxjs/toolkit";
//import { INITIAL_STATE } from "../../defs/defs";

import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";

import { UNITS_ACTION_TYPES } from "./unit.types";
import type { Unit } from "../../interfaces/references/Unit";

const INITIAL_STATE = {
  paginationAPIResult: null,
  error: null,
  isLoading: false,
  success: false,
};

const unitReducer = (
  state = INITIAL_STATE,
  action: PayloadAction<PaginationAPIModel<Unit>>,
) => {
  const { payload, type } = action;

  switch (type) {
    case UNITS_ACTION_TYPES.LOAD_ALL_UNITS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        success: true,
        error: null,
        paginationAPIResult: payload.data,
      };
    case UNITS_ACTION_TYPES.LOAD_ALL_UNITS_FAILURE:
      return {
        ...state,
        isLoading: false,
        success: false,
        error: payload,
        paginationAPIResult: null,
      };
    case UNITS_ACTION_TYPES.CREATE_UNIT_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        success: false,
        paginationAPIResult: null,
      };
    case UNITS_ACTION_TYPES.CREATE_UNIT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        success: true,
        paginationAPIResult: null,
      };
    case UNITS_ACTION_TYPES.CREATE_UNIT_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: payload,
        success: false,
        paginationAPIResult: null,
      };
    case UNITS_ACTION_TYPES.UPDATE_UNIT_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        success: false,
        paginationAPIResult: null,
      };
    case UNITS_ACTION_TYPES.UPDATE_UNIT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        success: true,
        paginationAPIResult: null,
      };
    case UNITS_ACTION_TYPES.UPDATE_UNIT_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: payload,
        success: false,
        paginationAPIResult: null,
      };
    case UNITS_ACTION_TYPES.DELETE_UNIT_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        success: false,
        paginationAPIResult: null,
      };
    case UNITS_ACTION_TYPES.DELETE_UNIT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        success: true,
        paginationAPIResult: null,
      };
    case UNITS_ACTION_TYPES.DELETE_UNIT_FAILURE:
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

export { unitReducer };
