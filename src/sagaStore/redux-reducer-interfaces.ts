import type { PaginationAPIModel } from "../interfaces/references/ApiResult";
import type { Country } from "../interfaces/references/Country";
import type { Currency } from "../interfaces/references/Currency";
import type { GarmentType } from "../interfaces/references/GarmentType";

// 🚀 1. Create a strict interface for this specific reducer slice
interface CurrencyState {
  paginationAPIResult: PaginationAPIModel<Currency> | null; // Strongly typed!
  error: unknown | null;
  isLoading: boolean;
  success: boolean;
}

interface CountryState {
  paginationAPIResult: PaginationAPIModel<Country> | null; // Strongly typed!
  error: unknown | null;
  isLoading: boolean;
  success: boolean;
}

interface GarmentTypeState {
  paginationAPIResult: PaginationAPIModel<GarmentType> | null; // Strongly typed!
  error: unknown | null;
  isLoading: boolean;
  success: boolean;
}

export type { CurrencyState, GarmentTypeState, CountryState };
