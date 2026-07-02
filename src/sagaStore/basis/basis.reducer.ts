import type { PayloadAction } from "@reduxjs/toolkit";

import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import { BASISES_ACTION_TYPES } from "./basis.types";
import type { Basis } from "../../interfaces/references/Basis";

const INITIAL_STATE = {
  paginationAPIResult: null,
  error: null,
  isLoading: false,
  success: false,
};

const basisReducer = (
  state = INITIAL_STATE,
  action: PayloadAction<PaginationAPIModel<Basis>>,
) => {
  const { payload, type } = action;

  switch (type) {
    case BASISES_ACTION_TYPES.LOAD_ALL_BASISES_SUCCESS:
      return {
        ...state,
        isLoading: false,
        success: true,
        error: null,
        paginationAPIResult: payload.data,
      };
    case BASISES_ACTION_TYPES.LOAD_ALL_BASISES_FAILURE:
      return {
        ...state,
        isLoading: false,
        success: false,
        error: payload,
        paginationAPIResult: null,
      };
    case BASISES_ACTION_TYPES.CREATE_BASIS_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        success: false,
        paginationAPIResult: null,
      };
    case BASISES_ACTION_TYPES.CREATE_BASIS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        success: true,
        paginationAPIResult: null,
      };
    case BASISES_ACTION_TYPES.CREATE_BASIS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: payload,
        success: false,
        paginationAPIResult: null,
      };
    case BASISES_ACTION_TYPES.UPDATE_BASIS_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        success: false,
        paginationAPIResult: null,
      };
    case BASISES_ACTION_TYPES.UPDATE_BASIS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        success: true,
        paginationAPIResult: null,
      };
    case BASISES_ACTION_TYPES.UPDATE_BASIS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: payload,
        success: false,
        paginationAPIResult: null,
      };
    case BASISES_ACTION_TYPES.DELETE_BASIS_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        success: false,
        paginationAPIResult: null,
      };
    case BASISES_ACTION_TYPES.DELETE_BASIS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        success: true,
        paginationAPIResult: null,
      };
    case BASISES_ACTION_TYPES.DELETE_BASIS_FAILURE:
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

export { basisReducer };
