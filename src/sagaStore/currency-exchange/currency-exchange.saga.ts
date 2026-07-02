import type { Action, PayloadAction } from "@reduxjs/toolkit";
import type {
  CreateCurrencyExchangeAPIModel,
  PaginationData,
} from "../../interfaces/definitions";
import type { CurrencyExchange } from "../../interfaces/references/CurrencyExchange";
import {
  all,
  call,
  put,
  takeLatest,
  type CallEffect,
  type PutEffect,
} from "redux-saga/effects";

import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";

import {
  createNewCurrencyExchange,
  loadCurrencyExchanges,
  removeCurrencyExchange,
  updateEditCurrencyExchange,
} from "../../services/currency-exchange.service";
import {
  createCurrencyExchangeFailure,
  createCurrencyExchangeSuccess,
  deleteCurrencyExchangeFailure,
  deleteCurrencyExchangeSuccess,
  loadAllCurrencyExchangesFailure,
  loadAllCurrencyExchangesSuccess,
  updateCurrencyExchangeFailure,
  updateCurrencyExchangeSuccess,
} from "./currency-exchange.action";
import { CURRENCY_EXCHANGES_ACTION_TYPES } from "./currency-exchange.types";

export function* loadAllCurrencyExchanges(
  action: PayloadAction<PaginationData>,
): Generator<CallEffect | PutEffect<Action>, void, unknown> {
  try {
    const { payload } = action;
    const currencyExchanges: PaginationAPIModel<CurrencyExchange> = (yield call(
      loadCurrencyExchanges,
      payload,
    )) as PaginationAPIModel<CurrencyExchange>;

    yield put(
      loadAllCurrencyExchangesSuccess({
        ...currencyExchanges,
        filterColumn: payload.filterColumn,
        filterOrder: payload.filterQuery,
        sortColumn: payload.sortColumn,
        sortOrder: payload.sortOrder,
        currentPage: payload.pageNumber,
      }),
    );
  } catch (error) {
    yield put(loadAllCurrencyExchangesFailure(error));
  }
}

export function* CreateCurrencyExchange(
  action: PayloadAction<CreateCurrencyExchangeAPIModel>,
): Generator<CallEffect | PutEffect, void, boolean> {
  try {
    const { payload } = action;
    yield call(createNewCurrencyExchange, payload);
    yield put(createCurrencyExchangeSuccess(true));
  } catch (error) {
    yield put(createCurrencyExchangeFailure(error));
  }
}

export function* updateCurrencyExchange(
  action: PayloadAction<CurrencyExchange>,
): Generator<CallEffect | PutEffect<Action>, void, void> {
  try {
    const { payload } = action;

    yield call(
      updateEditCurrencyExchange,
      payload.baseCurrency,
      payload.quoteCurrency,
      payload.exchangeDate,
      payload,
    );
    yield put(updateCurrencyExchangeSuccess(true));
  } catch (error) {
    yield put(updateCurrencyExchangeFailure(error));
  }
}

type deleteCurrencyExchangeParams = {
  baseCurrency: string;
  quoteCurrency: string;
  exchangeDate: Date;
};

export function* deleteCurrencyExchange(
  action: PayloadAction<deleteCurrencyExchangeParams>,
): Generator<CallEffect | PutEffect<Action>, void, boolean> {
  try {
    const { payload } = action;
    const { baseCurrency, quoteCurrency, exchangeDate } = payload;

    yield call(
      removeCurrencyExchange,
      baseCurrency,
      quoteCurrency,
      exchangeDate,
    );
    yield put(deleteCurrencyExchangeSuccess(true));
  } catch (error) {
    yield put(deleteCurrencyExchangeFailure(error));
  }
}

export function* onLoadAllCurrencyExchanges() {
  yield takeLatest(
    CURRENCY_EXCHANGES_ACTION_TYPES.LOAD_ALL_CURRENCY_EXCHANGES_START,
    loadAllCurrencyExchanges,
  );
}

export function* onCreateCurrencyExchange() {
  yield takeLatest(
    CURRENCY_EXCHANGES_ACTION_TYPES.CREATE_CURRENCY_EXCHANGE_START,
    CreateCurrencyExchange,
  );
}

export function* onUpdateCurrencyExchange() {
  yield takeLatest(
    CURRENCY_EXCHANGES_ACTION_TYPES.UPDATE_CURRENCY_EXCHANGE_START,
    updateCurrencyExchange,
  );
}

export function* onDeleteCurrencyExchange() {
  yield takeLatest(
    CURRENCY_EXCHANGES_ACTION_TYPES.DELETE_CURRENCY_EXCHANGE_START,
    deleteCurrencyExchange,
  );
}

export function* CurrencyExchangeSagas() {
  yield all([
    call(onLoadAllCurrencyExchanges),
    call(onCreateCurrencyExchange),
    call(onUpdateCurrencyExchange),
    call(onDeleteCurrencyExchange),
  ]);
}
