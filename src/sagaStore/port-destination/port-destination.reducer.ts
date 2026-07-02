import type { PayloadAction } from "@reduxjs/toolkit";
import { PORT_DESTINATION_ACTION_TYPES } from "./port-destination.types";
import { INITIAL_STATE } from "../../interfaces/definitions";
import type { PortDestination } from "../../interfaces/references/PortDestination";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";

const portDestinationReducer = (
  state = INITIAL_STATE,
  action: PayloadAction<PaginationAPIModel<PortDestination>>,
) => {
  const { type, payload } = action;

  switch (type) {
    case PORT_DESTINATION_ACTION_TYPES.LOAD_ALL_PORT_DESTINATIONS_START:
      return {
        ...state,
        error: null,
        isLoading: true,
        success: false,
        paginationAPIResult: null,
      };
    case PORT_DESTINATION_ACTION_TYPES.LOAD_ALL_PORT_DESTINATIONS_SUCCESS:
      return {
        ...state,
        error: null,
        isLoading: false,
        success: true,
        paginationAPIResult: payload.data,
      };
    case PORT_DESTINATION_ACTION_TYPES.LOAD_ALL_PORT_DESTINATIONS_FAILURE:
      return {
        ...state,
        error: payload,
        isLoading: false,
        success: false,
        paginationAPIResult: null,
      };
    case PORT_DESTINATION_ACTION_TYPES.CREATE_PORT_DESTINATION_SUCCESS:
      return {
        ...state,
        error: null,
        isLoading: false,
        success: true,
        paginationAPIResult: payload.data,
      };
    case PORT_DESTINATION_ACTION_TYPES.CREATE_PORT_DESTINATION_FAILURE:
      return {
        ...state,
        error: payload,
        isLoading: false,
        success: false,
        paginationAPIResult: null,
      };

    case PORT_DESTINATION_ACTION_TYPES.UPDATE_PORT_DESTINATION_START:
      return {
        ...state,
        error: null,
        isLoading: true,
        success: false,
        paginationAPIResult: null,
      };
    case PORT_DESTINATION_ACTION_TYPES.UPDATE_PORT_DESTINATION_SUCCESS:
      return {
        ...state,
        error: null,
        isLoading: false,
        success: true,
        paginationAPIResult: null,
      };
    case PORT_DESTINATION_ACTION_TYPES.UPDATE_PORT_DESTINATION_FAILURE:
      return {
        ...state,
        error: payload,
        isLoading: false,
        success: false,
        paginationAPIResult: null,
      };
    default:
      return state;
  }
};

export { portDestinationReducer };
