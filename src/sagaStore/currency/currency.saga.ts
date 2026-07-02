import {
  all,
  call,
  type CallEffect,
  put,
  type PutEffect,
  select,
  type SelectEffect,
  takeLatest,
} from "redux-saga/effects";

import type { AnyAction } from "redux-saga";

import {
  loadAllCurrenciesFailure,
  loadAllCurrenciesSuccess,
  updateCurrencyFailure,
  updateCurrencySuccess,
  deleteCurrencySuccess,
  deleteCurrencyFailure,
  createCurrencyFailure,
  createCurrencySuccess,
  loadAllCurrenciesStart,
} from "./currency.action";

import { CURRENCIES_ACTION_TYPES } from "./currency.types";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { PaginationData } from "../../interfaces/definitions";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { Currency } from "../../interfaces/references/Currency";
import {
  loadCurrencies,
  updateEditCurrency,
  removeCurrency,
  createNewCurrency,
} from "../../services/currency.service";
import { toast } from "react-toastify";
import { handleApiError } from "../../utils/errorHandler";
import type { RootState } from "../rootReducer";

export function* loadAllCurrencies(
  action: PayloadAction<PaginationData>,
): Generator<CallEffect | PutEffect<AnyAction>, void, unknown> {
  try {
    const { payload } = action;
    const currencies: PaginationAPIModel<Currency> = (yield call(
      loadCurrencies,
      payload,
    )) as PaginationAPIModel<Currency>;
    console.log("laoded currencies in saga : ", currencies);

    yield put(
      loadAllCurrenciesSuccess({
        ...currencies,
        filterColumn: payload.filterColumn,
        filterOrder: payload.filterQuery,
        sortColumn: payload.sortColumn,
        sortOrder: payload.sortOrder,
        currentPage: payload.pageIndex,
      }),
    );
    console.log("laoded currencies in saga in success: : ", currencies);
  } catch (error) {
    yield put(loadAllCurrenciesFailure(error));
  }
}

export function* getPageData() {
  yield select((state) => state.countrty.PaginationAPIModel);
}

function* onLoadAllCurrencies() {
  yield takeLatest(
    CURRENCIES_ACTION_TYPES.LOAD_ALL_CURRENCIES_START,
    loadAllCurrencies,
  );
}

export function* createCurrency(
  action: PayloadAction<Currency>,
): Generator<CallEffect | SelectEffect | PutEffect<AnyAction>, void, any> {
  try {
    const { payload } = action;

    yield call(createNewCurrency, payload);
    yield put(createCurrencySuccess(true));

    // // 🚀 THE FIX: Get the active pagination state and dispatch a fresh fetch
    // const currentPagination = yield select(
    //   (state) => state.currency.pagination,
    // );

    // 🚀 FIX: Safely retrieve the current currency data shape state out of the Redux store
    const currencyState = yield select((state: RootState) => state.currency);
    const currentPage = currencyState.paginationAPIResult?.currentPage || 0;
    const pageSize = currencyState.paginationAPIResult?.pageSize || 5;

    yield put(
      loadAllCurrenciesStart({
        pageIndex: currentPage,
        pageSize: pageSize,
        sortColumn: null,
        sortOrder: null,
        filterColumn: null,
        filterQuery: null,
      }),
    );
    toast.success("Currency created successfully", {
      autoClose: 2000,
    });
  } catch (error) {
    handleApiError(error);
    yield put(createCurrencyFailure(error));
  }
}

export function* updateCurrency(
  action: PayloadAction<Currency>,
): Generator<CallEffect | PutEffect<AnyAction>, void, void> {
  try {
    const { payload } = action;
    yield call(updateEditCurrency, payload.code, payload);

    yield put(updateCurrencySuccess(true));
  } catch (error) {
    yield put(updateCurrencyFailure(error));
  }
}

export function* deleteCurrency(
  action: PayloadAction<string>,
): Generator<CallEffect | PutEffect<AnyAction>, void, boolean> {
  try {
    const code = action.payload;
    yield call(removeCurrency, code);

    yield put(deleteCurrencySuccess(true));
  } catch (error) {
    yield put(deleteCurrencyFailure(error));
  }
}

function* onCreateCurrency() {
  yield takeLatest(
    CURRENCIES_ACTION_TYPES.CREATE_CURRENCY_START,
    createCurrency,
  );
}

function* onUpdateCurrency() {
  yield takeLatest(
    CURRENCIES_ACTION_TYPES.UPDATE_CURRENCY_START,
    updateCurrency,
  );
}

function* onDeleteCurrency() {
  yield takeLatest(
    CURRENCIES_ACTION_TYPES.DELETE_CURRENCY_START,
    deleteCurrency,
  );
}

export function* currencySagas() {
  yield all([
    call(onLoadAllCurrencies),
    call(onCreateCurrency),
    call(onUpdateCurrency),
    call(onDeleteCurrency),
  ]);
}
