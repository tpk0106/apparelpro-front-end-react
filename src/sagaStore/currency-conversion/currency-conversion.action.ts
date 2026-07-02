import type { PaginationData } from "../../interfaces/definitions";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { CurrencyConversion } from "../../interfaces/references/CurrencyConversion";
import { createAction } from "../../utils/reducer/reducer.utils";
import { CURRENCY_CONVERSIONS_ACTION_TYPES } from "./currency-conversion.types";

const loadAllCurrencyConversionsStart = ({ ...pagination }: PaginationData) => {
  return createAction(
    CURRENCY_CONVERSIONS_ACTION_TYPES.LOAD_ALL_CURRENCY_CONVERSIONS_START,
    pagination,
  );
};

const loadAllCurrencyConversionsSuccess = (
  currencyConversions: PaginationAPIModel<CurrencyConversion>,
) => {
  return createAction(
    CURRENCY_CONVERSIONS_ACTION_TYPES.LOAD_ALL_CURRENCY_CONVERSIONS_SUCCESS,
    currencyConversions,
  );
};

const loadAllCurrencyConversionsFailure = (error: unknown) => {
  return createAction(
    CURRENCY_CONVERSIONS_ACTION_TYPES.LOAD_ALL_CURRENCY_CONVERSIONS_FAILURE,
    error,
  );
};

// create

const createCurrencyConversionStart = (
  currencyConversion: CurrencyConversion,
) => {
  return createAction(
    CURRENCY_CONVERSIONS_ACTION_TYPES.CREATE_CURRENCY_CONVERSION_START,
    currencyConversion,
  );
};

const createCurrencyConversionSuccess = (success: boolean) => {
  return createAction(
    CURRENCY_CONVERSIONS_ACTION_TYPES.CREATE_CURRENCY_CONVERSION_SUCCESS,
    success,
  );
};

const createCurrencyConversionFailure = (error: unknown) => {
  return createAction(
    CURRENCY_CONVERSIONS_ACTION_TYPES.CREATE_CURRENCY_CONVERSION_FAILURE,
    error,
  );
};

// update
const updateCurrencyConversionStart = (
  currencyConversionToEdit: CurrencyConversion,
) => {
  return createAction(
    CURRENCY_CONVERSIONS_ACTION_TYPES.UPDATE_CURRENCY_CONVERSION_START,
    currencyConversionToEdit,
  );
};

const updateCurrencyConversionSuccess = (success: boolean) => {
  return createAction(
    CURRENCY_CONVERSIONS_ACTION_TYPES.UPDATE_CURRENCY_CONVERSION_SUCCESS,
    success,
  );
};

const updateCurrencyConversionFailure = (error: unknown) => {
  return createAction(
    CURRENCY_CONVERSIONS_ACTION_TYPES.UPDATE_CURRENCY_CONVERSION_FAILURE,
    error,
  );
};

type deleteCurrencyConversionParams = {
  fromCurrencyCode: string;
  toCurrencyCode: string;
  date: Date;
};

const deleteCurrencyConversionStart = (
  deleteParams: deleteCurrencyConversionParams,
) => {
  return createAction(
    CURRENCY_CONVERSIONS_ACTION_TYPES.DELETE_CURRENCY_CONVERSION_START,
    deleteParams,
  );
};

const deleteCurrencyConversionSuccess = (success: boolean) => {
  return createAction(
    CURRENCY_CONVERSIONS_ACTION_TYPES.DELETE_CURRENCY_CONVERSION_SUCCESS,
    success,
  );
};

const deleteCurrencyConversionFailure = (error: unknown) => {
  return createAction(
    CURRENCY_CONVERSIONS_ACTION_TYPES.DELETE_CURRENCY_CONVERSION_FAILURE,
    error,
  );
};

export {
  loadAllCurrencyConversionsStart,
  loadAllCurrencyConversionsSuccess,
  loadAllCurrencyConversionsFailure,
  createCurrencyConversionStart,
  createCurrencyConversionSuccess,
  createCurrencyConversionFailure,
  updateCurrencyConversionStart,
  updateCurrencyConversionSuccess,
  updateCurrencyConversionFailure,
  deleteCurrencyConversionStart,
  deleteCurrencyConversionSuccess,
  deleteCurrencyConversionFailure,
};
