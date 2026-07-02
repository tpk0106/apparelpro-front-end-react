import { createSelector } from "reselect";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { Buyer } from "../../interfaces/references/Buyer";
import type { PaginationData } from "../../interfaces/definitions";
import type { MRT_PaginationState } from "material-react-table";
import { useSelector } from "react-redux";
import { useGetBuyers } from "../../data/custom-hooks/apparel-pro.repository.hooks";

// export const getAllBuyers = (state: {
//   buyer: { paginationAPIResult: PaginationAPIModel<Buyer> };
// }): PaginationAPIModel<Buyer> => state.buyer.paginationAPIResult;

// export const isLoading = (state: any) => state.isLoading;

const selectAllBuyers = createSelector(
  [
    (state: {
      buyer: {
        paginationAPIResult: {
          items: Buyer[];
        };
      };
    }) => state.buyer.paginationAPIResult,
  ],
  (paginationAPIResult) => paginationAPIResult?.items,
);

const selectTotalBuyers = createSelector(
  [
    (state: {
      buyer: {
        paginationAPIResult: PaginationAPIModel<Buyer>;
      };
    }) => state.buyer.paginationAPIResult,
  ],
  (paginationAPIResult) => paginationAPIResult?.totalItems,
);

export const SelectAllBuyers = (
  paginate: PaginationData,
  pagination: MRT_PaginationState,
) => {
  useGetBuyers(paginate, pagination);
  const selector = useSelector(selectAllBuyers);
  return selector;
};

export const SelectBuyersTotal = (
  paginate: PaginationData,
  pagination: MRT_PaginationState,
) => {
  useGetBuyers(paginate, pagination);
  const count = useSelector(selectTotalBuyers);
  return count;
};
