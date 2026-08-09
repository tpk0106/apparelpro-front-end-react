import { createSelector } from "reselect";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";

import type { MRT_PaginationState } from "material-react-table";
import { useSelector } from "react-redux";
import { useGetUnits } from "../../data/custom-hooks/apparel-pro.repository.hooks";
import type { Unit } from "../../interfaces/references/Unit";
import type { PaginationData } from "../../interfaces/definitions";

const selectAllUnits = createSelector(
  [
    (state: {
      unit: {
        paginationAPIResult: {
          items: Unit[];
        };
      };
    }) => state.unit.paginationAPIResult,
  ],
  (paginationAPIResult) => paginationAPIResult?.items,
);

const selectTotalUnits = createSelector(
  [
    (state: {
      unit: {
        paginationAPIResult: PaginationAPIModel<Unit>;
      };
    }) => state.unit.paginationAPIResult,
  ],
  (paginationAPIResult) => paginationAPIResult?.totalItems,
);

export const SelectAllUnits = (
  paginate: PaginationData,
  pagination: MRT_PaginationState,
) => {
  useGetUnits(paginate, pagination);
  const selector = useSelector(selectAllUnits);

  return selector;
};

export const SelectUnitsTotal = (
  paginate: PaginationData,
  pagination: MRT_PaginationState,
) => {
  useGetUnits(paginate, pagination);
  const count = useSelector(selectTotalUnits);
  return count;
};
