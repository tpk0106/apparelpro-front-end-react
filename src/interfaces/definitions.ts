import type ColorSizeBreakdownDetails from "./OrderManagement/ColorSizeDetails";

const SLASH = "/";
const ASSETS_FOLDER_LENGTH = 10;
const USER_KEY = "user";

type menuItem = {
  subMenus: unknown[] | null;
  icon: string;
  label: string;
  routerLink: string;
  // menuClick: (e: MouseEvent) => {};
};

type Item = {
  icon: string;
  label: string;
  routerLink: string;
};

type PaginationData = {
  pageIndex: number;
  pageSize: number;
  sortColumn: string | null;
  sortOrder: string | null;
  filterColumn: string | null;
  filterQuery: string | null;
};

type ColorSizeBreakdownDetailsParams = {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
};

interface ColorSizeBreakdownDetailsPayloadWithBody {
  params: ColorSizeBreakdownDetailsParams;
  payload: ColorSizeBreakdownDetails[];
}

interface BulkSaveResponse {
  message: string;
}

const Gender = {
  FEMALE: "Female",
  MALE: "Male",
};
type Gender = (typeof Gender)[keyof typeof Gender];

const GENDER_MAP: Record<string, number> = {
  Male: 1,
  Female: 2,
};

const GENDER_MAP_REVERSE: Record<number, string> = {
  1: "Male",
  2: "Female",
};

const ADDRESS_TYPE = [
  { label: "Residential", value: 1 },
  { label: "Postal", value: 2 },
  { label: "Corporate", value: 3 },
  { label: "Billing", value: 4 },
  { label: "Delivery", value: 5 },
];

const COLOR_RATIO_OR_QUANTITY = {
  RATIO: "R",
  QUANTITY: "Q",
};

const DEFAULT_ADDREES_MAP: Record<string, boolean> = {
  Yes: true,
  No: false,
};

const DEFAULT_ADDREES_MAP_REVERSE: Record<number, string> = {
  1: "Yes",
  0: "No",
};

const USER_CREDENTIALS = {
  TOKEN_KEY: "token",
  REFRESH_TOKEN: "refreshToken",
  USER_KEY: "user",
  USER_ID: "userId",
};
type USER_CREDENTIALS =
  (typeof USER_CREDENTIALS)[keyof typeof USER_CREDENTIALS];

interface CreateCountryAPIModel {
  id: number;
  code: string;
  name: string;
  flag: BinaryType;
}

interface CreateCurrencyAPIModel {
  id: number;
  code: string;
  countryCode: string;
  name: string;
  minor: string;
}

interface CreateBuyerAPIModel {
  buyerCode: number;
  status: string;
  name: string;
  telephoneNos: string;
  mobileNos: string;
  fax: string;
  addressId: unknown;
  cusdec: string;
}

interface CreatePortDestinationAPIModel {
  id: number;
  destinationName: string;
}

interface UpdateBuyerAPIModel {
  buyerCode: number;
  status: string;
  name: string;
  telephoneNos: string;
  mobileNos: string;
  fax: string;
  addressId: unknown;
  cusdec: string;
}

interface UpdatePortDestinationAPIModel {
  id: number;
  destinationName: string;
}

interface CreateAddressAPIModel {
  addressId: string;
  id: number;
  addressType: AddressType;
  streetAddress: string;
  city: string;
  postCode: string;
  state: string;
  countryCode: string;
  // country: string;
  default: boolean;
  buyerCode?: number;
}

interface CreateCurrencyConversionAPIModel {
  id: number;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  date: Date;
}

interface CreateCurrencyExchangeAPIModel {
  id: number;
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  exchangeDate: Date;
}

const DROPDOWN_LIST_DATA = {
  PAGE_SIZE: 1000,
  PAGE_NUMBER: 0,
};

const AddressType = {
  Residential: 1,
  Postal: 2,
  Corporate: 3,
  Billing: 4,
  Delivery: 5,
};
type AddressType = (typeof AddressType)[keyof typeof AddressType];

const INITIAL_STATE = {
  paginationAPIResult: null,
  error: null,
  isLoading: false,
  success: false,
};

interface POParameters {
  buyerCode: number;
  order: string;
}

export {
  SLASH,
  ASSETS_FOLDER_LENGTH,
  USER_KEY,
  Gender,
  USER_CREDENTIALS,
  DROPDOWN_LIST_DATA,
  AddressType,
  INITIAL_STATE,
  GENDER_MAP,
  GENDER_MAP_REVERSE,
  ADDRESS_TYPE,
  DEFAULT_ADDREES_MAP,
  DEFAULT_ADDREES_MAP_REVERSE,
  COLOR_RATIO_OR_QUANTITY,
};

interface TokenAPIModel {
  token: string;
  refreshToken: string;
}

export interface AppError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>; // Captures .NET validation dictionary
}

export type {
  menuItem,
  Item,
  PaginationData,
  CreateCountryAPIModel,
  CreateCurrencyAPIModel,
  CreateBuyerAPIModel,
  CreatePortDestinationAPIModel,
  UpdateBuyerAPIModel,
  UpdatePortDestinationAPIModel,
  CreateAddressAPIModel,
  CreateCurrencyConversionAPIModel,
  CreateCurrencyExchangeAPIModel,
  POParameters,
  TokenAPIModel,
  ColorSizeBreakdownDetailsParams,
  ColorSizeBreakdownDetailsPayloadWithBody,
  BulkSaveResponse,
};
