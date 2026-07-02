import { Routes, Route } from "react-router-dom";
// Inside your Routes.tsx or App.tsx
import { useLocation } from "react-router-dom";

import Home from "./home/home.component";
import MainMenu from "./navigation/main-menu.component";
import SignInForm from "./sign-in/sign-in-form.component";
import SignupForm from "./sign-up/sign-up-form.component";
// import Currencies from "./components/references/currency/currency.component";
import Country from "./components/references/country/country.component";
// import GarmentTypes from "./components/references/garment-types/garment-type.component";
import Currencies from "./components/references/currency-tanstack/currencies.component";
import GarmentTypes from "./components/references/garment-type-tanstack/garment-type.component";
import Bank from "./components/references/bank-tan-stack/bank.component";
import Units from "./components/references/unit-tanstack/unit.component";
import Buyers from "./components/references/buyer-tanstack/buyer.component";
import Basises from "./components/references/basis-tanstack/basis.component";
import OrderConfirmationRoutine from "./components/order-management/order-confirmation.component";
import MaterialConsumption from "./components/material-consumption/material-consumption.component";
import SupplierPurchaseOrderWorkspace from "./components/supplier-purchase-order-management/supplier-purchase-order-workspace";
import StylewiseEventsWorkspace from "./components/stylewise-events/stylewise-events-workspace";
// import StyleShippingSummaryCard from "./components/part-shipment/style-shipping-summary-card";
// import PartShipmentsWorkspace from "./components/part-shipment/part-shipments-workspace";
import StoresRequisitionWorkspace from "./components/orderwise-inventory/stores-requisition-workspace";
// import Styles from "./components/order-management/styles.component";
// import MaterialConsumption from "./components/material-consumption/material-consumption.component";

function App() {
  const location = useLocation();
  // Look at the routing memory state right inside the router
  const userToEdit = location.state;

  // 🚀 Create your unique token key!
  // If editing John, key is "John@mail.com". If registering, key is "register".
  const formTokenKey = userToEdit ? userToEdit.email : "register";

  return (
    <Routes>
      <Route path="/" element={<MainMenu />}>
        <Route index path="/" element={<Home />} />
        <Route index path="/sign-in" element={<SignInForm />} />
        <Route
          index
          path="/sign-up"
          element={<SignupForm key={formTokenKey} />}
        />
        <Route index path="currency" element={<Currencies />} />
        <Route index path="bank" element={<Bank />} />
        <Route index path="country" element={<Country />} />
        <Route index path="unit" element={<Units />} />
        <Route index path="buyers" element={<Buyers />} />
        <Route index path="garment-type" element={<GarmentTypes />} />
        <Route index path="basis" element={<Basises />} />
        <Route index path="po" element={<OrderConfirmationRoutine />} />
        <Route
          index
          path="material-consumption"
          element={<MaterialConsumption />}
        />
        <Route
          index
          path="supplier-po"
          element={<SupplierPurchaseOrderWorkspace />}
        />
        <Route
          index
          path="stylewise-events"
          element={<StylewiseEventsWorkspace />}
        />
        <Route index path="srn" element={<StoresRequisitionWorkspace />} />
      </Route>
    </Routes>
  );
}

export default App;
