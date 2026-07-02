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
  loadAllCountriesFailure,
  loadAllCountriesSuccess,
  updateCountryFailure,
  updateCountrySuccess,
  deleteCountrySuccess,
  deleteCountryFailure,
  createCountryFailure,
  createCountrySuccess,
  loadAllCountriesStart,
} from "./country.action";

import { COUNTRIES_ACTION_TYPES } from "./country.types";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { PaginationData } from "../../interfaces/definitions";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { Country } from "../../interfaces/references/Country";
import {
  loadCountries,
  updateEditCountry,
  removeCountry,
  createNewCountry,
} from "../../services/country.service";
import { handleApiError } from "../../utils/errorHandler";
import { toast } from "react-toastify";
import type { CountryState } from "../redux-reducer-interfaces";
import type { RootState } from "../rootReducer";
import type { AxiosResponse } from "axios";

export function* loadAllCountries(
  action: PayloadAction<PaginationData>,
): Generator<
  // 1. Allow CallEffect to handle the native Axios wrapper shape
  CallEffect<AxiosResponse<PaginationAPIModel<Country>>> | PutEffect,
  void,
  // 2. Strong-type what the yield statement actually evaluates to
  AxiosResponse<PaginationAPIModel<Country>> // 🚀 Natively defines the structure of what 'yield' resolves to!
> {
  try {
    const { payload } = action;
    // 3. Extract data cleanly via native Axios response properties
    const response: AxiosResponse<PaginationAPIModel<Country>> = yield call(
      loadCountries,
      payload,
    );

    const countries: PaginationAPIModel<Country> = response.data;
    console.log("laoded countries in saga : ", countries);
    // Extract your strongly-typed data container cleanly

    yield put(
      loadAllCountriesSuccess({
        ...countries,
        filterColumn: payload.filterColumn,
        filterOrder: payload.filterQuery,
        sortColumn: payload.sortColumn,
        sortOrder: payload.sortOrder,
        currentPage: payload.pageIndex,
      }),
    );

    console.log("laoded countries in saga in success: : ", countries);
  } catch (error) {
    yield put(loadAllCountriesFailure(error as Error));
  }
}

export function* getPageData() {
  yield select((state) => state.countrty.PaginationAPIModel);
}

function* onLoadAllCountries() {
  yield takeLatest(
    COUNTRIES_ACTION_TYPES.LOAD_ALL_COUNTRIES_START,
    loadAllCountries,
  );
}

export function* createCountry(
  action: PayloadAction<Country>,
): Generator<
  CallEffect | SelectEffect | PutEffect<AnyAction>,
  void,
  CountryState
> {
  try {
    const { payload } = action;
    yield call(createNewCountry, payload);
    yield put(createCountrySuccess(true));
    toast.success("Country created successfully", {
      position: "top-right",
      autoClose: 2000,
    });
    // 🚀 FIX: Safely retrieve the current currency data shape state out of the Redux store
    const countryState = yield select((state: RootState) => state.country);
    const currentPage = countryState.paginationAPIResult?.currentPage || 0;
    const pageSize = countryState.paginationAPIResult?.pageSize || 5;

    yield put(
      loadAllCountriesStart({
        pageIndex: currentPage,
        pageSize: pageSize,
        sortColumn: null,
        sortOrder: null,
        filterColumn: null,
        filterQuery: null,
      }),
    );
  } catch (error) {
    handleApiError(error);
    yield put(createCountryFailure(error));
  }
}

export function* updateCountry(
  action: PayloadAction<Country>,
): Generator<CallEffect | PutEffect<AnyAction>, void, void> {
  try {
    const { payload } = action;
    yield call(updateEditCountry, payload.code, payload);

    yield put(updateCountrySuccess(true));
    toast.success("Country updated successfully", {
      position: "top-right",
      autoClose: 2000,
    });
  } catch (error) {
    yield put(updateCountryFailure(error));
  }
}

export function* deleteCountry(
  action: PayloadAction<string>,
): Generator<CallEffect | PutEffect<AnyAction>, void, boolean> {
  try {
    const code = action.payload;
    yield call(removeCountry, code);

    yield put(deleteCountrySuccess(true));
    toast.success("Country deleted successfully", {
      position: "top-right",
      autoClose: 2000,
    });
  } catch (error) {
    yield put(deleteCountryFailure(error));
  }
}

function* onCreateCountry() {
  yield takeLatest(COUNTRIES_ACTION_TYPES.CREATE_COUNTRY_START, createCountry);
}

function* onUpdateCountry() {
  yield takeLatest(COUNTRIES_ACTION_TYPES.UPDATE_COUNTRY_START, updateCountry);
}

function* onDeleteCountry() {
  yield takeLatest(COUNTRIES_ACTION_TYPES.DELETE_COUNTRY_START, deleteCountry);
}

export function* countrySagas() {
  yield all([
    call(onLoadAllCountries),
    call(onCreateCountry),
    call(onUpdateCountry),
    call(onDeleteCountry),
  ]);
}
