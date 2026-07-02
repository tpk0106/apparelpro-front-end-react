import { createSelector } from "reselect";
// import { PaginationAPIModel } from "../../interfaces/references/ApiResult";

// import { PaginationData } from "../../defs/defs";
// import { MRT_PaginationState } from "material-react-table";
// import { useSelector } from "react-redux";

// import { GarmentType } from "../../interfaces/references/GarmentType";
// import { useGetGarmentTypes } from "../../data/custom-hooks/apparel-pro.repository.hooks";

// export const getAllGarmentTypes = (state: {
//   garmentType: { paginationAPIResult: PaginationAPIModel<Supplier> };
// }): PaginationAPIModel<Supplier> => {
//   return state.garmentType.paginationAPIResult;
// };

// const selectAllGarmentTypes = createSelector(
//   [
//     (state: {
//       garmentType: {
//         paginationAPIResult: {
//           items: GarmentType[];
//         };
//       };
//     }) => state.garmentType.paginationAPIResult,
//   ],
//   (paginationAPIResult) => paginationAPIResult?.items,
// );

// const selectTotalGarmentTypes = createSelector(
//   [
//     (state: {
//       garmentType: {
//         paginationAPIResult: PaginationAPIModel<GarmentType>;
//       };
//     }) => state.garmentType.paginationAPIResult,
//   ],
//   (paginationAPIResult) => paginationAPIResult?.totalItems,
// );

// export const SelectAllGarmentTypes = (
//   paginate: PaginationData,
//   pagination: MRT_PaginationState,
// ) => {
//   useGetGarmentTypes(paginate, pagination);
//   const selector = useSelector(selectAllGarmentTypes);
//   return selector;
// };

// export const SelectTotal = (
//   paginate: PaginationData,
//   pagination: MRT_PaginationState,
// ) => {
//   useGetGarmentTypes(paginate, pagination);
//   const count = useSelector(selectTotalGarmentTypes);
//   return count;
// };
// sagaStore/currency/currency.selector.ts

import type { RootState } from "../rootReducer"; // Adjust path to your store config

// 1. Core input selector reads the typed slice cleanly
const selectGarmentTypeSlice = (state: RootState) => state.garmentType;

// 2. Memoised selector extracts items completely error-free with NO double-casting!
export const SelectAllGarmentTypes = createSelector(
  [selectGarmentTypeSlice],
  (garmentTypeState) => {
    // TypeScript natively knows garmentTypeState.paginationAPIResult is a PaginationAPIModel!
    return garmentTypeState.paginationAPIResult?.items || [];
  },
);

// 3. Memoised selector to capture row metrics safely
export const SelectGarmentTypesTotal = createSelector(
  [selectGarmentTypeSlice],
  (garmentTypeState) => {
    // Adjust totalItems to match the naming convention on your ApiResult interface (e.g. totalItems, totalCount)
    return garmentTypeState.paginationAPIResult?.totalItems || 0;
  },
);
