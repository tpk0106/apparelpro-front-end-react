import type { PayloadAction } from "@reduxjs/toolkit";
import { INITIAL_STATE } from "../../interfaces/definitions";
import { SUPPLIERS_ACTION_TYPES } from "./supplier.types";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { Supplier } from "../../interfaces/references/Supplier";

const supplierReducer = (
  state = INITIAL_STATE,
  action: PayloadAction<PaginationAPIModel<Supplier>>,
) => {
  const { payload, type } = action;

  switch (type) {
    case SUPPLIERS_ACTION_TYPES.LOAD_ALL_SUPPLIERS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        success: true,
        error: null,
        paginationAPIResult: payload.data,
      };
    case SUPPLIERS_ACTION_TYPES.LOAD_ALL_SUPPLIERS_FAILURE:
      return {
        ...state,
        isLoading: false,
        success: false,
        error: payload,
        paginationAPIResult: null,
      };
    case SUPPLIERS_ACTION_TYPES.CREATE_SUPPLIER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        success: false,
        paginationAPIResult: null,
      };
    case SUPPLIERS_ACTION_TYPES.CREATE_SUPPLIER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        success: true,
        paginationAPIResult: null,
      };
    case SUPPLIERS_ACTION_TYPES.CREATE_SUPPLIER_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: payload,
        success: false,
        paginationAPIResult: null,
      };
    case SUPPLIERS_ACTION_TYPES.UPDATE_SUPPLIER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        success: false,
        paginationAPIResult: null,
      };
    case SUPPLIERS_ACTION_TYPES.UPDATE_SUPPLIER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        success: true,
        paginationAPIResult: null,
      };
    case SUPPLIERS_ACTION_TYPES.UPDATE_SUPPLIER_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: payload,
        success: false,
        paginationAPIResult: null,
      };
    case SUPPLIERS_ACTION_TYPES.DELETE_SUPPLIER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        success: false,
        paginationAPIResult: null,
      };
    case SUPPLIERS_ACTION_TYPES.DELETE_SUPPLIER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        success: true,
        paginationAPIResult: null,
      };
    case SUPPLIERS_ACTION_TYPES.DELETE_SUPPLIER_FAILURE:
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

export { supplierReducer };
