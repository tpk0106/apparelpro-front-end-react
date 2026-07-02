import { all, call } from "redux-saga/effects";
import { userSagas } from "./user/user.saga";
import { bankSagas } from "./bank/bank.saga";
import { countrySagas } from "./country/country.saga";
import { currencySagas } from "./currency/currency.saga";
import { buyerSagas } from "./buyer/buyer.saga";
import { addressSagas } from "./address/address.saga";
import { supplierSagas } from "./supplier/supplier.saga";
import { portDestinationSagas } from "./port-destination/port-destination.saga";
import { garmentTypeSagas } from "./garment-type/garment-type.saga";
import { unitSagas } from "./unit/unit.saga";
import { orderSagas } from "./order-confirmation/order.saga";
import { basisSagas } from "./basis/basis.saga";
import { CurrencyExchangeSagas } from "./currency-exchange/currency-exchange.saga";

export function* rootSaga() {
  yield all([
    call(userSagas),
    call(bankSagas),
    call(countrySagas),
    call(currencySagas),
    call(buyerSagas),
    call(addressSagas),
    call(supplierSagas),
    call(portDestinationSagas),
    call(garmentTypeSagas),
    call(unitSagas),
    call(orderSagas),
    call(basisSagas),
    call(CurrencyExchangeSagas),
  ]);
}
