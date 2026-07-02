import { ADDRESS_ACTION_TYPES } from "./address.types";

const INITIAL_STATE = {
  error: null,
  isLoading: false,
  success: false,
  addreses: null,
};

export const addressReducer = (state = INITIAL_STATE, action: any) => {
  const { type, payload } = action;
  switch (type) {
    case ADDRESS_ACTION_TYPES.LOAD_ADDRESSES_BY_ADDRESSID_START:
      return {
        ...state,
        error: null,
        success: false,
        isLoading: true,
        addresses: null,
      };
    case ADDRESS_ACTION_TYPES.LOAD_ADDRESSES_BY_ADDRESSID_SUCCESS:
      return {
        ...state,
        error: null,
        success: true,
        isLoading: false,
        addresses: payload,
      };
    case ADDRESS_ACTION_TYPES.LOAD_ADDRESSES_BY_ADDRESSID_FAILURE:
      return {
        ...state,
        addresses: null,
        error: payload,
        isLoading: false,
        success: false,
      };
    case ADDRESS_ACTION_TYPES.CREATE_ADDRESS_START:
      return {
        ...state,
        error: null,
        success: false,
        isLoading: true,
        addresses: null,
      };
    case ADDRESS_ACTION_TYPES.CREATE_ADDRESS_SUCCESS:
      return {
        ...state,
        error: null,
        success: true,
        isLoading: false,
        addresses: payload,
      };
    case ADDRESS_ACTION_TYPES.CREATE_ADDRESS_FAILURE:
      return {
        ...state,
        addresses: null,
        error: payload,
        isLoading: false,
        success: false,
      };
    case ADDRESS_ACTION_TYPES.UPDATE_ADDRESS_START:
      return {
        ...state,
        error: null,
        success: false,
        isLoading: true,
        addresses: null,
      };
    case ADDRESS_ACTION_TYPES.UPDATE_ADDRESS_SUCCESS:
      return {
        ...state,
        error: null,
        success: true,
        isLoading: false,
        addresses: payload,
      };
    case ADDRESS_ACTION_TYPES.UPDATE_ADDRESS_FAILURE:
      return {
        ...state,
        addresses: null,
        error: payload,
        isLoading: false,
        success: false,
      };
    case ADDRESS_ACTION_TYPES.DELETE_ADDRESS_START:
      console.log("payload in delete address start : ", payload);
      return {
        ...state,
        error: null,
        success: false,
        isLoading: true,
        addresses: null,
      };
    case ADDRESS_ACTION_TYPES.DELETE_ADDRESS_SUCCESS:
      console.log("payload in delete address success : ", payload);
      return {
        ...state,
        error: null,
        success: true,
        isLoading: false,
        addresses: payload,
      };
    case ADDRESS_ACTION_TYPES.DELETE_ADDRESS_FAILURE:
      console.log("payload in delete ddress failure : ", payload);
      return {
        ...state,
        addresses: null,
        error: payload,
        isLoading: false,
        success: false,
      };
    default:
      return state;
  }
};
