import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { PaginationData } from "../../interfaces/definitions";
import type { CurrencyConversion } from "../../interfaces/references/CurrencyConversion";

const loadCurrencyConversions = async (data: PaginationData) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CURRENCY_CONVERSION
      .GET_BY_PAGINATION,
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

const createNewCurrencyConversion = async (
  newCurrencyConversion: CurrencyConversion,
) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CURRENCY_CONVERSION.POST,
    newCurrencyConversion,
  );
};

const updateEditCurrencyConversion = async (
  existingCurrencyConversion: CurrencyConversion,
) => {
  // CurrencyConversionController's PUT reads FromCurrency/ToCurrency straight
  // off the request body to locate the row - unlike Stock/Order Items Catalog,
  // there's no separate query-param key here.
  return await client.put(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CURRENCY_CONVERSION.PUT,
    existingCurrencyConversion,
  );
};

const removeCurrencyConversion = async (
  fromCurrency: string,
  toCurrency: string,
) => {
  return await client.delete(
    `${APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CURRENCY_CONVERSION.DELETE}${fromCurrency}/${toCurrency}`,
  );
};

export {
  loadCurrencyConversions,
  createNewCurrencyConversion,
  updateEditCurrencyConversion,
  removeCurrencyConversion,
};
