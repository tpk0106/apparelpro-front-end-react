import { combineReducers } from "redux";
import { userReducer } from "./user/user.reducer";
import { bankReducer } from "./bank/bank.reducer";
import { countryReducer } from "./country/country.reducer";
import { currencyReducer } from "./currency/currency.reducer";
import { buyerReducer } from "./buyer/buyer.reducer";
import { addressReducer } from "./address/address.reducer";
import { supplierReducer } from "./supplier/supplier.reducer";
import { portDestinationReducer } from "./port-destination/port-destination.reducer";
import { garmentTypeReducer } from "./garment-type/garment-type.reducer";
import { unitReducer } from "./unit/unit.reducer";
import { orderReducer } from "./order-confirmation/order.reducer";
import { basisReducer } from "./basis/basis.reducer";
import { currencyConversionReducer } from "./currency-conversion/currency-conversion.reducer";
import { currencyExchangeReducer } from "./currency-exchange/currency-exchange.reducer";

import { supplierPurchaseOrderApi } from "../services/supplier-purchase-order.service";
import { stylewiseEventApi } from "../services/stylewise-event.services";
import { partShipmentApi } from "../services/part-shipment.service";

export const rootReducer = combineReducers({
  user: userReducer,
  bank: bankReducer,
  country: countryReducer,
  currency: currencyReducer,
  buyer: buyerReducer,
  address: addressReducer,
  supplier: supplierReducer,
  portDestination: portDestinationReducer,
  garmentType: garmentTypeReducer,
  unit: unitReducer,
  order: orderReducer,
  basis: basisReducer,
  currencyExchange: currencyExchangeReducer,
  currencyConversion: currencyConversionReducer,

  // Add the reducer inside your rootReducer or store reducer mapping block:
  [supplierPurchaseOrderApi.reducerPath]: supplierPurchaseOrderApi.reducer,
  [stylewiseEventApi.reducerPath]: stylewiseEventApi.reducer,
  [partShipmentApi.reducerPath]: partShipmentApi.reducer,
});

// Automatically extracts the exact shape of your entire combined Redux store state
export type RootState = ReturnType<typeof rootReducer>;
