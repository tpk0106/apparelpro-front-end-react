import { client } from "../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type { PaginationData } from "../interfaces/definitions";
import type { CreateCurrencyExchangeAPIModel } from "../interfaces/definitions";
import type { CurrencyExchange } from "../interfaces/references/CurrencyExchange";

const loadCurrencyExchanges = async (data: PaginationData) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CURRENCY_EXCHANGE.GET_BY_PAGINATION,
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

const createNewCurrencyExchange = async (
  createCurrencyExchangeAPIModel: CreateCurrencyExchangeAPIModel,
) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CURRENCY_EXCHANGE.POST,
    createCurrencyExchangeAPIModel,
  );
};

const updateEditCurrencyExchange = async (
  baseCurrency: string,
  quoteCurrency: string,
  exchangeDate: Date,
  existingCurrencyExchange: CurrencyExchange,
) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CURRENCY_EXCHANGE.PUT,
    existingCurrencyExchange,
    {
      params: {
        baseCurrency: baseCurrency,
        quoteCurrency: quoteCurrency,
        exchangeDate: exchangeDate,
      },
    },
  );
};

const removeCurrencyExchange = async (
  baseCurrency: string,
  quoteCurrency: string,
  exchangeDate: Date,
) => {
  return await client.delete(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CURRENCY_EXCHANGE.DELETE +
      baseCurrency +
      "/" +
      quoteCurrency +
      "/" +
      exchangeDate, //  pass by route
  );
};

export {
  loadCurrencyExchanges,
  createNewCurrencyExchange,
  updateEditCurrencyExchange,
  removeCurrencyExchange,
};
