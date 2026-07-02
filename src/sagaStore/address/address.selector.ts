import { createSelector } from "reselect";
import type { Country } from "../../interfaces/references/Country";
import { useSelector } from "react-redux";
import { useCountries } from "../../data/custom-hooks/apparel-pro.repository.hooks";
import type { PaginationData } from "../../interfaces/definitions";

export function SelectCountries(paginate: PaginationData) {
  useCountries(paginate);

  const selectAllCountries = createSelector(
    (state: { country: { paginationAPIResult: { items: Country[] } } }) =>
      state.country.paginationAPIResult?.items,
    (items) => items?.map((country: Country) => country.code),
  );

  const countries = useSelector(selectAllCountries);
  return countries;
}
