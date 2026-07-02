import { createSelector } from "reselect";
import { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import { Supplier } from "../../interfaces/references/Supplier";
import { PaginationData } from "../../defs/defs";
import { MRT_PaginationState } from "material-react-table";
import { useSelector } from "react-redux";
import { useGetSuppliers } from "../../data/custom-hooks/apparel-pro.repository.hooks";

// export const getAllSuppliers = (state: {
//   supplier: { paginationAPIResult: PaginationAPIModel<Supplier> };
// }): PaginationAPIModel<Supplier> => {
//   return state.supplier.paginationAPIResult;
// };

const selectAllSuppliers = createSelector(
  [
    (state: {
      supplier: {
        paginationAPIResult: {
          items: Supplier[];
        };
      };
    }) => state.supplier.paginationAPIResult,
  ],
  (paginationAPIResult) => paginationAPIResult?.items,
);

const selectTotalSuppliers = createSelector(
  [
    (state: {
      supplier: {
        paginationAPIResult: PaginationAPIModel<Supplier>;
      };
    }) => state.supplier.paginationAPIResult,
  ],
  (paginationAPIResult) => paginationAPIResult?.totalItems,
);

export const SelectAllSuppliers = (
  paginate: PaginationData,
  pagination: MRT_PaginationState,
) => {
  useGetSuppliers(paginate, pagination);
  const selector = useSelector(selectAllSuppliers);
  return selector;
};

export const SelectTotal = (
  paginate: PaginationData,
  pagination: MRT_PaginationState,
) => {
  useGetSuppliers(paginate, pagination);
  const count = useSelector(selectTotalSuppliers);
  return count;
};
