import { createAction } from "../../utils/reducer/reducer.utils";
import type { PaginationData } from "../../interfaces/definitions";
import type { CreateCurrencyAPIModel } from "../../interfaces/definitions";

import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import { CURRENCIES_ACTION_TYPES } from "./currency.types";
import type { Currency } from "../../interfaces/references/Currency";

const loadAllCurrenciesStart = ({ ...pagination }: PaginationData) => {
  return createAction(
    CURRENCIES_ACTION_TYPES.LOAD_ALL_CURRENCIES_START,
    pagination,
  );
};

const loadAllCurrenciesSuccess = (currencies: PaginationAPIModel<Currency>) => {
  return createAction(
    CURRENCIES_ACTION_TYPES.LOAD_ALL_CURRENCIES_SUCCESS,
    currencies,
  );
};

const loadAllCurrenciesFailure = (error: unknown) => {
  return createAction(
    CURRENCIES_ACTION_TYPES.LOAD_ALL_CURRENCIES_FAILURE,
    error,
  );
};

const updateCurrencyStart = ({ ...currency }: Currency) => {
  return createAction(CURRENCIES_ACTION_TYPES.UPDATE_CURRENCY_START, currency);
};

const updateCurrencySuccess = (success: boolean) => {
  return createAction(CURRENCIES_ACTION_TYPES.UPDATE_CURRENCY_SUCCESS, success);
};

const updateCurrencyFailure = (error: unknown) => {
  return createAction(CURRENCIES_ACTION_TYPES.UPDATE_CURRENCY_FAILURE, error);
};

const createCurrencyStart = ({
  ...createCurrencyAPIModel
}: CreateCurrencyAPIModel) => {
  return createAction(
    CURRENCIES_ACTION_TYPES.CREATE_CURRENCY_START,
    createCurrencyAPIModel,
  );
};

const createCurrencySuccess = (success: boolean) => {
  return createAction(CURRENCIES_ACTION_TYPES.CREATE_CURRENCY_SUCCESS, success);
};

const createCurrencyFailure = (error: unknown) => {
  return createAction(CURRENCIES_ACTION_TYPES.CREATE_CURRENCY_FAILURE, error);
};

const deleteCurrencyStart = (id: number) => {
  return createAction(CURRENCIES_ACTION_TYPES.DELETE_CURRENCY_START, id);
};

const deleteCurrencySuccess = (success: boolean) => {
  return createAction(CURRENCIES_ACTION_TYPES.DELETE_CURRENCY_START, success);
};

const deleteCurrencyFailure = (error: unknown) => {
  return createAction(CURRENCIES_ACTION_TYPES.DELETE_CURRENCY_START, error);
};

export {
  loadAllCurrenciesStart,
  loadAllCurrenciesSuccess,
  loadAllCurrenciesFailure,
  updateCurrencyStart,
  updateCurrencySuccess,
  updateCurrencyFailure,
  createCurrencyStart,
  createCurrencySuccess,
  createCurrencyFailure,
  deleteCurrencyStart,
  deleteCurrencySuccess,
  deleteCurrencyFailure,
};
