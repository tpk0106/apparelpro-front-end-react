import { Routes, Route } from "react-router-dom";
// Inside your Routes.tsx or App.tsx
import { useLocation } from "react-router-dom";

import DashboardHome from "./components/dashboard/dashboard.component";
import ProductionSummaryDailyReportWorkspace from "./components/reports/production/production-summary-daily-report-workspace";
import ProductionScheduleReportWorkspace from "./components/reports/production/production-schedule-report-workspace";
import ProductionSummaryMonthlyReportWorkspace from "./components/reports/production/production-summary-monthly-report-workspace";
import ProductionSummaryMonthlyOverviewReportWorkspace from "./components/reports/production/production-summary-monthly-overview-report-workspace";
import ProductionSummaryStyleWiseReportWorkspace from "./components/reports/production/production-summary-style-wise-report-workspace";
import ProductionSummaryStyleWiseDetailedReportWorkspace from "./components/reports/production/production-summary-style-wise-detailed-report-workspace";
import LineProductionSummaryReportWorkspace from "./components/reports/production/line-production-summary-report-workspace";
import OperationBreakdownReportWorkspace from "./components/reports/production/operation-breakdown-report-workspace";
import ManpowerRequirementReportWorkspace from "./components/reports/production/manpower-requirement-report-workspace";
import DailyEmployeeEfficiencyReportWorkspace from "./components/reports/production/daily-employee-efficiency-report-workspace";
import MonthlyEmployeeEfficiencyReportWorkspace from "./components/reports/production/monthly-employee-efficiency-report-workspace";
import LineEfficiencyReportWorkspace from "./components/reports/production/line-efficiency-report-workspace";
import EstimatedProductionScheduleReportWorkspace from "./components/reports/production/estimated-production-schedule-report-workspace";
import ProductionAnalysisSummaryReportWorkspace from "./components/reports/production/production-analysis-summary-report-workspace";
import ProductionProgressGraph from "./components/production/production-progress-graph/production-progress-graph.component";
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
import TrimSheetApprovalWorkspace from "./components/order-management/trim-sheet-approval/trim-sheet-approval-workspace";
// import StyleShippingSummaryCard from "./components/part-shipment/style-shipping-summary-card";
// import PartShipmentsWorkspace from "./components/part-shipment/part-shipments-workspace";
import StoresRequisitionWorkspace from "./components/orderwise-inventory/stores-requisition-workspace";
import GoodsIssueNoteWorkspace from "./components/orderwise-inventory/goods-issue-note-workspace";
import GoodsIssueNoteCascadeWorkspace from "./components/orderwise-inventory/goods-issue-note-cascade-workspace";
import GoodsReceivedNoteWorkspace from "./components/orderwise-inventory/goods-received-note-workspace";
import GoodsReceivedNoteCascadeWorkspace from "./components/orderwise-inventory/goods-received-note-cascade-workspace";
import GoodsReturnNoteWorkspace from "./components/orderwise-inventory/goods-return-note-workspace";
import GoodsTransferNoteWorkspace from "./components/orderwise-inventory/goods-transfer-note-workspace";
import SupplierReturnNoteWorkspace from "./components/orderwise-inventory/supplier-return-note-workspace";
import DamagedGoodsNoteWorkspace from "./components/orderwise-inventory/damaged-goods-note-workspace";
import StockAdjustmentNoteWorkspace from "./components/orderwise-inventory/stock-adjustment-note-workspace";
import AdditionalIssueNoteWorkspace from "./components/orderwise-inventory/additional-issue-note-workspace";
import StockMovementReportWorkspace from "./components/orderwise-inventory/stock-movement-report-workspace";
import StockMovementItemReportWorkspace from "./components/orderwise-inventory/stock-movement-item-report-workspace";

import ColorSizeReportWorkspace from "./components/reports/order-management/color-size-report/color-size-report-workspace";
import PurchaseOrderListReportWorkspace from "./components/reports/order-management/purchase-order-list-report/purchase-order-list-report-workspace";
import OutstandingPurchaseOrderListReportWorkspace from "./components/reports/order-management/outstanding-purchase-order-list-report/outstanding-purchase-order-list-report-workspace";
import OrderDetailReportWorkspace from "./components/reports/order-management/order-detail-report/order-detail-report-workspace";
import TrimSheetReportWorkspace from "./components/reports/orderwise-inventory/trim-sheet-report/trim-sheet-report-workspace";
import Suppliers from "./components/references/supplier/supplier.component";
import ItemFeatures from "./components/references/item-feature/item-feature.component";
import OrderItemFeatures from "./components/references/order-item-feature/order-item-feature.component";
import GarmentTypeItems from "./components/references/garment-type-items/garment-type-items.component";
import StockReference from "./components/references/stock/stock.component";
import OrderItemCatalogPage from "./components/references/order-item-catalog/order-item-catalog.component";
import CurrencyConversionPage from "./components/references/currency-conversion/currency-conversion.component";
import AdditionalCosts from "./components/references/additional-cost/additional-cost.component";
import SubContractors from "./components/references/sub-contractor/sub-contractor.component";
import GarmentAdditionalCostPage from "./components/garment-additional-cost/garment-additional-cost.component";
import SubContractPage from "./components/sub-contract/sub-contract.component";
import SettingsPage from "./components/settings/settings.component";
import StrnPrintReportWorkspace from "./components/reports/orderwise-inventory/strn/strn-print-report-workspace";
import ProductionLines from "./components/references/production/production-line-tanstack/production-line.component";
import Operations from "./components/references/production/operation-tanstack/operation.component";
import NonProductiveHourCodes from "./components/references/production/non-productive-hour-code-tanstack/non-productive-hour-code.component";
import MachineTypes from "./components/references/production/machine-type-tanstack/machine-type.component";
import GarmentComponents from "./components/references/production/garment-component-tanstack/garment-component.component";
import Employees from "./components/references/production/employee-tanstack/employee.component";
import StyleComponentBreakdownWorkspace from "./components/production/style-component-breakdown/style-component-breakdown.component";
import StyleOperationBreakdownWorkspace from "./components/production/style-operation-breakdown/style-operation-breakdown.component";
import Holidays from "./components/references/production/holiday-tanstack/holiday.component";
import ProductionLineAllocationWorkspace from "./components/production/production-line-allocation/production-line-allocation.component";
import EstimatedProductionLineAllocationWorkspace from "./components/production/estimated-production-line-allocation/estimated-production-line-allocation.component";
import DailyProductionTimeTicketWorkspace from "./components/production/daily-production-time-ticket/daily-production-time-ticket.component";
import EstimatedProductionEntryWorkspace from "./components/production/estimated-production-entry/estimated-production-entry.component";
import DailyProductionEntryWorkspace from "./components/production/daily-production-entry/daily-production-entry.component";

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
        <Route index path="/" element={<DashboardHome />} />
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
        <Route index path="item-feature" element={<ItemFeatures />} />
        <Route index path="order-item-feature" element={<OrderItemFeatures />} />
        <Route index path="garment-type-items" element={<GarmentTypeItems />} />
        <Route index path="stock-reference" element={<StockReference />} />
        <Route index path="order-item-catalog" element={<OrderItemCatalogPage />} />
        <Route index path="currency-conversion" element={<CurrencyConversionPage />} />
        <Route index path="additional-cost" element={<AdditionalCosts />} />
        <Route index path="sub-contractor" element={<SubContractors />} />
        <Route index path="additional" element={<GarmentAdditionalCostPage />} />
        <Route index path="subcont" element={<SubContractPage />} />
        <Route index path="buyers" element={<Buyers />} />
        <Route index path="garment-type" element={<GarmentTypes />} />
        <Route index path="basis" element={<Basises />} />
        <Route index path="production-line" element={<ProductionLines />} />
        <Route index path="operation" element={<Operations />} />
        <Route
          index
          path="non-productive-hour-code"
          element={<NonProductiveHourCodes />}
        />
        <Route index path="machine-type" element={<MachineTypes />} />
        <Route
          index
          path="garment-component"
          element={<GarmentComponents />}
        />
        <Route index path="employee" element={<Employees />} />
        <Route
          index
          path="style-component-breakdown"
          element={<StyleComponentBreakdownWorkspace />}
        />
        <Route
          index
          path="style-operation-breakdown"
          element={<StyleOperationBreakdownWorkspace />}
        />
        <Route index path="holiday" element={<Holidays />} />
        <Route
          index
          path="production-line-allocation"
          element={<ProductionLineAllocationWorkspace />}
        />
        <Route
          index
          path="estimated-production-line-allocation"
          element={<EstimatedProductionLineAllocationWorkspace />}
        />
        <Route
          index
          path="daily-production-time-ticket"
          element={<DailyProductionTimeTicketWorkspace />}
        />
        <Route
          index
          path="estimated-production-entry"
          element={<EstimatedProductionEntryWorkspace />}
        />
        <Route
          index
          path="daily-production-entry"
          element={<DailyProductionEntryWorkspace />}
        />
        <Route
          index
          path="production-summary-daily-report"
          element={<ProductionSummaryDailyReportWorkspace />}
        />
        <Route
          index
          path="production-schedule-report"
          element={<ProductionScheduleReportWorkspace />}
        />
        <Route
          index
          path="production-summary-monthly-report"
          element={<ProductionSummaryMonthlyReportWorkspace />}
        />
        <Route
          index
          path="production-summary-monthly-overview-report"
          element={<ProductionSummaryMonthlyOverviewReportWorkspace />}
        />
        <Route
          index
          path="production-summary-style-wise-report"
          element={<ProductionSummaryStyleWiseReportWorkspace />}
        />
        <Route
          index
          path="production-summary-style-wise-detailed-report"
          element={<ProductionSummaryStyleWiseDetailedReportWorkspace />}
        />
        <Route
          index
          path="line-production-summary-report"
          element={<LineProductionSummaryReportWorkspace />}
        />
        <Route
          index
          path="operation-breakdown-report"
          element={<OperationBreakdownReportWorkspace />}
        />
        <Route
          index
          path="manpower-requirement-report"
          element={<ManpowerRequirementReportWorkspace />}
        />
        <Route
          index
          path="daily-employee-efficiency-report"
          element={<DailyEmployeeEfficiencyReportWorkspace />}
        />
        <Route
          index
          path="monthly-employee-efficiency-report"
          element={<MonthlyEmployeeEfficiencyReportWorkspace />}
        />
        <Route
          index
          path="line-efficiency-report"
          element={<LineEfficiencyReportWorkspace />}
        />
        <Route
          index
          path="estimated-production-schedule-report"
          element={<EstimatedProductionScheduleReportWorkspace />}
        />
        <Route
          index
          path="production-analysis-summary-report"
          element={<ProductionAnalysisSummaryReportWorkspace />}
        />
        <Route
          index
          path="production-progress-graph"
          element={<ProductionProgressGraph />}
        />
        <Route index path="supplier" element={<Suppliers />} />
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
        <Route
          index
          path="trim-sheet-approval"
          element={<TrimSheetApprovalWorkspace />}
        />
        <Route index path="srn" element={<StoresRequisitionWorkspace />} />
        <Route index path="gin" element={<GoodsIssueNoteWorkspace />} />
        <Route
          index
          path="gin-cascade"
          element={<GoodsIssueNoteCascadeWorkspace />}
        />
        <Route index path="grn" element={<GoodsReceivedNoteWorkspace />} />
        <Route
          index
          path="grn-cascade"
          element={<GoodsReceivedNoteCascadeWorkspace />}
        />
        <Route index path="rtn" element={<GoodsReturnNoteWorkspace />} />
        <Route index path="gtn" element={<GoodsTransferNoteWorkspace />} />
        <Route
          index
          path="supplier-return-note"
          element={<SupplierReturnNoteWorkspace />}
        />
        <Route index path="dgn" element={<DamagedGoodsNoteWorkspace />} />
        <Route index path="san" element={<StockAdjustmentNoteWorkspace />} />
        <Route index path="ain" element={<AdditionalIssueNoteWorkspace />} />
        <Route
          index
          path="stock-movement-report"
          element={<StockMovementReportWorkspace />}
        />
        <Route
          index
          path="stock-movement-item"
          element={<StockMovementItemReportWorkspace />}
        />
        <Route index path="strn-print" element={<StrnPrintReportWorkspace />} />
        <Route
          index
          path="trim-sheet-report"
          element={<TrimSheetReportWorkspace />}
        />
        <Route
          index
          path="order-detail-report"
          element={<OrderDetailReportWorkspace />}
        />
        <Route
          index
          path="color-size-report"
          element={<ColorSizeReportWorkspace />}
        />
        <Route
          index
          path="purchase-order-list-report"
          element={<PurchaseOrderListReportWorkspace />}
        />
        <Route
          index
          path="outstanding-purchase-order-list-report"
          element={<OutstandingPurchaseOrderListReportWorkspace />}
        />
        <Route index path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
