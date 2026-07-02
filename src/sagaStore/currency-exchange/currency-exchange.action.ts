import type { PaginationData } from "../../interfaces/definitions";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { CurrencyExchange } from "../../interfaces/references/CurrencyExchange";
import { createAction } from "../../utils/reducer/reducer.utils";
import { CURRENCY_EXCHANGES_ACTION_TYPES } from "./currency-exchange.types";

const loadAllCurrencyExchangesStart = ({ ...pagination }: PaginationData) => {
  return createAction(
    CURRENCY_EXCHANGES_ACTION_TYPES.LOAD_ALL_CURRENCY_EXCHANGES_START,
    pagination,
  );
};

const loadAllCurrencyExchangesSuccess = (
  currencyExchanges: PaginationAPIModel<CurrencyExchange>,
) => {
  return createAction(
    CURRENCY_EXCHANGES_ACTION_TYPES.LOAD_ALL_CURRENCY_EXCHANGES_SUCCESS,
    currencyExchanges,
  );
};

const loadAllCurrencyExchangesFailure = (error: unknown) => {
  return createAction(
    CURRENCY_EXCHANGES_ACTION_TYPES.LOAD_ALL_CURRENCY_EXCHANGES_FAILURE,
    error,
  );
};

// create

const createCurrencyExchangeStart = (currencyExchange: CurrencyExchange) => {
  return createAction(
    CURRENCY_EXCHANGES_ACTION_TYPES.CREATE_CURRENCY_EXCHANGE_START,
    currencyExchange,
  );
};

const createCurrencyExchangeSuccess = (success: boolean) => {
  return createAction(
    CURRENCY_EXCHANGES_ACTION_TYPES.CREATE_CURRENCY_EXCHANGE_SUCCESS,
    success,
  );
};

const createCurrencyExchangeFailure = (error: unknown) => {
  return createAction(
    CURRENCY_EXCHANGES_ACTION_TYPES.CREATE_CURRENCY_EXCHANGE_FAILURE,
    error,
  );
};

// update
const updateCurrencyExchangeStart = (
  currencyExchangeToEdit: CurrencyExchange,
) => {
  return createAction(
    CURRENCY_EXCHANGES_ACTION_TYPES.UPDATE_CURRENCY_EXCHANGE_START,
    currencyExchangeToEdit,
  );
};

const updateCurrencyExchangeSuccess = (success: boolean) => {
  return createAction(
    CURRENCY_EXCHANGES_ACTION_TYPES.UPDATE_CURRENCY_EXCHANGE_SUCCESS,
    success,
  );
};

const updateCurrencyExchangeFailure = (error: unknown) => {
  return createAction(
    CURRENCY_EXCHANGES_ACTION_TYPES.UPDATE_CURRENCY_EXCHANGE_FAILURE,
    error,
  );
};

type deleteCurrencyExchangeParams = {
  baseCurrency: string;
  quoteCurrency: string;
  exchangeDate: Date;
};

const deleteCurrencyExchangeStart = (
  deleteParams: deleteCurrencyExchangeParams,
) => {
  return createAction(
    CURRENCY_EXCHANGES_ACTION_TYPES.DELETE_CURRENCY_EXCHANGE_START,
    deleteParams,
  );
};

const deleteCurrencyExchangeSuccess = (success: boolean) => {
  return createAction(
    CURRENCY_EXCHANGES_ACTION_TYPES.DELETE_CURRENCY_EXCHANGE_SUCCESS,
    success,
  );
};

const deleteCurrencyExchangeFailure = (error: unknown) => {
  return createAction(
    CURRENCY_EXCHANGES_ACTION_TYPES.DELETE_CURRENCY_EXCHANGE_FAILURE,
    error,
  );
};

export {
  loadAllCurrencyExchangesStart,
  loadAllCurrencyExchangesSuccess,
  loadAllCurrencyExchangesFailure,
  createCurrencyExchangeStart,
  createCurrencyExchangeSuccess,
  createCurrencyExchangeFailure,
  updateCurrencyExchangeStart,
  updateCurrencyExchangeSuccess,
  updateCurrencyExchangeFailure,
  deleteCurrencyExchangeStart,
  deleteCurrencyExchangeSuccess,
  deleteCurrencyExchangeFailure,
};
