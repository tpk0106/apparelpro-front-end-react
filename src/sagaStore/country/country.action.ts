import type { PaginationData } from "../../interfaces/definitions";
import type { CreateCountryAPIModel } from "../../interfaces/definitions";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { Country } from "../../interfaces/references/Country";
import { createAction } from "../../utils/reducer/reducer.utils";
import { COUNTRIES_ACTION_TYPES } from "./country.types";

const loadAllCountriesStart = ({ ...pagination }: PaginationData) => {
  return createAction(
    COUNTRIES_ACTION_TYPES.LOAD_ALL_COUNTRIES_START,
    pagination,
  );
};

const loadAllCountriesSuccess = (countries: PaginationAPIModel<Country>) => {
  return createAction(
    COUNTRIES_ACTION_TYPES.LOAD_ALL_COUNTRIES_SUCCESS,
    countries,
  );
};

const loadAllCountriesFailure = (error: unknown) => {
  return createAction(COUNTRIES_ACTION_TYPES.LOAD_ALL_COUNTRIES_FAILURE, error);
};

const updateCountryStart = ({ ...country }: Country) => {
  return createAction(COUNTRIES_ACTION_TYPES.UPDATE_COUNTRY_START, country);
};

const updateCountrySuccess = (success: boolean) => {
  return createAction(COUNTRIES_ACTION_TYPES.UPDATE_COUNTRY_SUCCESS, success);
};

const updateCountryFailure = (error: unknown) => {
  return createAction(COUNTRIES_ACTION_TYPES.UPDATE_COUNTRY_FAILURE, error);
};

const createCountryStart = ({
  ...createCountryAPIModel
}: CreateCountryAPIModel) => {
  return createAction(
    COUNTRIES_ACTION_TYPES.CREATE_COUNTRY_START,
    createCountryAPIModel,
  );
};

const createCountrySuccess = (success: boolean) => {
  return createAction(COUNTRIES_ACTION_TYPES.CREATE_COUNTRY_SUCCESS, success);
};

const createCountryFailure = (error: unknown) => {
  return createAction(COUNTRIES_ACTION_TYPES.CREATE_COUNTRY_FAILURE, error);
};

const deleteCountryStart = (buyerCode: number) => {
  return createAction(COUNTRIES_ACTION_TYPES.DELETE_COUNTRY_START, buyerCode);
};

const deleteCountrySuccess = (success: boolean) => {
  return createAction(COUNTRIES_ACTION_TYPES.DELETE_COUNTRY_START, success);
};

const deleteCountryFailure = (error: unknown) => {
  return createAction(COUNTRIES_ACTION_TYPES.DELETE_COUNTRY_START, error);
};

export {
  loadAllCountriesStart,
  loadAllCountriesSuccess,
  loadAllCountriesFailure,
  updateCountryStart,
  updateCountrySuccess,
  updateCountryFailure,
  createCountryStart,
  createCountrySuccess,
  createCountryFailure,
  deleteCountryStart,
  deleteCountrySuccess,
  deleteCountryFailure,
};
