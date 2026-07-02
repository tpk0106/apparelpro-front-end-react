import type Bank from "../../interfaces/references/Bank";
import { createAction } from "../../utils/reducer/reducer.utils";
import { BANK_ACTION_TYPES } from "./bank.types";

import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { PaginationData } from "../../interfaces/definitions";

const loadAllBanksStart = ({ ...pagination }: PaginationData) => {
  return createAction(BANK_ACTION_TYPES.LOAD_ALL_BANKS_START, pagination);
};

const loadAllBanksSuccess = (banks: PaginationAPIModel<Bank>) => {
  return createAction(BANK_ACTION_TYPES.LOAD_ALL_BANKS_SUCCESS, banks);
};

const loadAllBanksFailed = (error: unknown) => {
  return createAction(BANK_ACTION_TYPES.LOAD_ALL_BANKS_FAILURE, error);
};

const createBankStart = (bank: Bank) => {
  return createAction(BANK_ACTION_TYPES.CREATE_BANK_START, bank);
};

const createBankSuccess = (success: boolean) => {
  return createAction(BANK_ACTION_TYPES.CREATE_BANK_SUCCESS, success);
};

const createBankFailure = (error: unknown) => {
  return createAction(BANK_ACTION_TYPES.CREATE_BANK_FAILURE, error);
};

const updateBankStart = (bankToEdit: Bank) => {
  return createAction(BANK_ACTION_TYPES.UPDATE_BANK_START, bankToEdit);
};

const updateBankSuccess = (success: boolean) => {
  return createAction(BANK_ACTION_TYPES.UPDATE_BANK_SUCCESS, success);
};

const updateBankFailure = (error: unknown) => {
  return createAction(BANK_ACTION_TYPES.UPDATE_BANK_FAILURE, error);
};

const deleteBankStart = (bankCode: string) => {
  return createAction(BANK_ACTION_TYPES.DELETE_BANK_START, bankCode);
};

const deleteBankSuccess = (success: boolean) => {
  return createAction(BANK_ACTION_TYPES.DELETE_BANK_SUCCESS, success);
};

const deleteBankFailure = (error: unknown) => {
  return createAction(BANK_ACTION_TYPES.DELETE_BANK_FAILURE, error);
};
export {
  loadAllBanksStart,
  loadAllBanksFailed,
  loadAllBanksSuccess,
  createBankStart,
  createBankSuccess,
  createBankFailure,
  updateBankStart,
  updateBankSuccess,
  updateBankFailure,
  deleteBankStart,
  deleteBankSuccess,
  deleteBankFailure,
};
