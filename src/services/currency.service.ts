import { client } from "../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type { CreateCurrencyAPIModel } from "../interfaces/definitions";
import type { PaginationData } from "../interfaces/definitions";

import type { Currency } from "../interfaces/references/Currency";

const loadCurrencies = async (data: PaginationData) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CURRENCY.GET_BY_PAGINATION,
    {
      params: {
        pageNumber: data.pageIndex,
        pageSize: data.pageSize,
        sortColumn: data.sortColumn,
        sortOrder: data.sortOrder,
        filterColumn: data.filterColumn,
        filterQuery: data.filterQuery,
      },
    },
  );
};

const createNewCurrency = async (
  createCurrencyAPIModel: CreateCurrencyAPIModel,
) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CURRENCY.POST,
    createCurrencyAPIModel,
  );
};

const updateEditCurrency = async (code: string, updateCurrency: Currency) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CURRENCY.PUT,
    updateCurrency,
    {
      params: {
        code: code,
      },
    },
  );
};

const removeCurrency = async (code: string) => {
  return await client.delete(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CURRENCY.DELETE,
    {
      params: {
        code: code,
      },
    },
  );
};

export {
  loadCurrencies,
  createNewCurrency,
  updateEditCurrency,
  removeCurrency,
};
