import { createSelector } from "reselect";
import { CurrencyConversion } from "../../interfaces/references/CurrencyConversion";
import { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import { PaginationData } from "../../defs/defs";
import { MRT_PaginationState } from "material-react-table";
import { useSelector } from "react-redux";
import { useGetCurrencyConversions } from "../../data/custom-hooks/apparel-pro.repository.hooks";

const selectAllCurrencyConversions = createSelector(
  [
    (state: {
      currencyConversion: {
        paginationAPIResult: {
          items: CurrencyConversion[];
        };
      };
    }) => state.currencyConversion.paginationAPIResult,
  ],
  (paginationAPIResult) => paginationAPIResult?.items,
);

const selectTotalCurrencyConversions = createSelector(
  [
    (state: {
      buyer: {
        paginationAPIResult: PaginationAPIModel<CurrencyConversion>;
      };
    }) => state.buyer.paginationAPIResult,
  ],
  (paginationAPIResult) => paginationAPIResult?.totalItems,
);

export const SelectAllCurrencyConversions = (
  paginate: PaginationData,
  pagination: MRT_PaginationState,
) => {
  useGetCurrencyConversions(paginate, pagination);
  const selector = useSelector(selectAllCurrencyConversions);
  return selector;
};

export const SelectCurrencyConversionsTotal = (
  paginate: PaginationData,
  pagination: MRT_PaginationState,
) => {
  useGetCurrencyConversions(paginate, pagination);
  const count = useSelector(selectTotalCurrencyConversions);
  return count;
};
