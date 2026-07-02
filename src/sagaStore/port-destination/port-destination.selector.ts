import { createSelector } from "reselect";
import { PortDestination } from "../../interfaces/references/PortDestination";
import { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import { useSelector } from "react-redux";
import { useGetPortDestinations } from "../../data/custom-hooks/apparel-pro.repository.hooks";
import { PaginationData } from "../../defs/defs";
import { MRT_PaginationState } from "material-react-table";

export const selectAllPortDestinations = (state: {
  portDestination: { paginationAPIResult: PaginationAPIModel<PortDestination> };
}): PaginationAPIModel<PortDestination> => {
  return state.portDestination.paginationAPIResult;
};

const selectAllPorts = createSelector(
  [
    (state: {
      portDestination: {
        paginationAPIResult: {
          items: PortDestination[];
        };
      };
    }) => state.portDestination.paginationAPIResult,
  ],
  (paginationAPIResult) => paginationAPIResult?.items,
);

const selectTotalPorts = createSelector(
  [
    (state: {
      portDestination: {
        paginationAPIResult: PaginationAPIModel<PortDestination>;
      };
    }) => state.portDestination.paginationAPIResult,
  ],
  (paginationAPIResult) => paginationAPIResult?.totalItems,
);

export const SelectAllCountryPortDestinations = (
  paginate: PaginationData,
  pagination: MRT_PaginationState,
) => {
  useGetPortDestinations(paginate, pagination);
  const selector = useSelector(selectAllPorts);
  return selector;
};
export const SelectTotal = (
  paginate: PaginationData,
  pagination: MRT_PaginationState,
) => {
  useGetPortDestinations(paginate, pagination);
  return useSelector(selectTotalPorts);
};
