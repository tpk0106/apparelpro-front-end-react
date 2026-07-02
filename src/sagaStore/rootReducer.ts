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

// 1. Import your material consumption API slice safely
import { materialConsumptionApi } from "../services/material-consumption.services";
import { supplierPurchaseOrderApi } from "../services/supplier-purchase-order.service";
import { stylewiseEventApi } from "../services/stylewise-event.services";
import { partShipmentApi } from "../services/part-shipment.service";
import { orderwiseInventoryApi } from "../services/order-wise-inventory.services";
import { commonServiceApi } from "../services/common.service";

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

  // Maps the dynamic RTK-Query reducer execution tree to the main Redux state store
  [materialConsumptionApi.reducerPath]: materialConsumptionApi.reducer,
  // Add the reducer inside your rootReducer or store reducer mapping block:
  [supplierPurchaseOrderApi.reducerPath]: supplierPurchaseOrderApi.reducer,
  [stylewiseEventApi.reducerPath]: stylewiseEventApi.reducer,
  [partShipmentApi.reducerPath]: partShipmentApi.reducer,
  [orderwiseInventoryApi.reducerPath]: orderwiseInventoryApi.reducer, // Shields your inventory caches from browser storage bloat
  [commonServiceApi.reducerPath]: commonServiceApi.reducer,
});

// Automatically extracts the exact shape of your entire combined Redux store state
export type RootState = ReturnType<typeof rootReducer>;
