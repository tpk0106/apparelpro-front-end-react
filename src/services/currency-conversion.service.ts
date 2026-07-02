import { client } from "../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type {
  CreateCurrencyConversionAPIModel,
  PaginationData,
} from "../interfaces/definitions";
import type { CurrencyConversion } from "../interfaces/references/CurrencyConversion";

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
  createCurrencyConversionAPIModel: CreateCurrencyConversionAPIModel,
) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CURRENCY_CONVERSION.POST,
    createCurrencyConversionAPIModel,
  );
};

const updateEditCurrencyConversion = async (
  fromCurrencyCode: string,
  toCurrencyCode: string,
  existingCurrencyConversion: CurrencyConversion,
) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CURRENCY_CONVERSION.PUT,
    existingCurrencyConversion,
    {
      params: {
        fromCurrencyCode: fromCurrencyCode,
        toCurrencyCode: toCurrencyCode,
      },
    },
  );
};

const removeCurrencyConversion = async (
  fromCurrencyCode: string,
  toCurrencyCode: string,
) => {
  return await client.delete(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CURRENCY_CONVERSION.DELETE +
      fromCurrencyCode +
      "/" +
      toCurrencyCode, // buyercode pass by route
  );
};
export {
  loadCurrencyConversions,
  createNewCurrencyConversion,
  updateEditCurrencyConversion,
  removeCurrencyConversion,
};
