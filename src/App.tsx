import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
// Inside your Routes.tsx or App.tsx
import { useLocation, useNavigate } from "react-router-dom";
import GlobalRouter from "./auth/globalRouter";

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
import EndOfProductionConfirmation from "./components/production/end-of-production-confirmation/end-of-production-confirmation.component";
import MainMenu from "./navigation/main-menu.component";
import SignInForm from "./sign-in/sign-in-form.component";
import SignupForm from "./sign-up/sign-up-form.component";

import Country from "./components/references/country/country.component";
import Currencies from "./components/references/currency-tanstack/currencies.component";
import GarmentTypes from "./components/references/garment-type-tanstack/garment-type.component";
import Bank from "./components/references/bank-tan-stack/bank.component";
import Units from "./components/references/unit-tanstack/unit.component";
import Buyers from "./components/references/buyer-tanstack/buyer.component";
import PortDestinations from "./components/references/port-destination-tanstack/port-destination.component";
import Basises from "./components/references/basis-tanstack/basis.component";
import Seasons from "./components/references/season-tanstack/season.component";
import OrderConfirmationRoutine from "./components/order-management/order-confirmation.component";
import MaterialConsumption from "./components/material-consumption/material-consumption.component";
import CompanyAddressSetupPage from "./components/import-export/company-address-setup.component";
import CommercialInvoiceListPage from "./components/import-export/commercial-invoice-list.component";
import LetterOfCreditPage from "./components/import-export/letter-of-credit.component";
import CustomsDeclarationPage from "./components/import-export/customs-declaration.component";
import ClearanceOfficePage from "./components/import-export/clearance-office.component";
import PaymentTermPage from "./components/import-export/payment-term.component";
import TransportModePage from "./components/import-export/transport-mode.component";
import DutyTaxCodePage from "./components/import-export/duty-tax-code.component";
import TaxBaseCodePage from "./components/import-export/tax-base-code.component";
import AgreementCodePage from "./components/import-export/agreement-code.component";
import CommodityCodePage from "./components/import-export/commodity-code.component";
import CustomsProcedureCodePage from "./components/import-export/customs-procedure-code.component";
import DocumentTypePage from "./components/import-export/document-type.component";
import SupplierPurchaseOrderWorkspace from "./components/supplier-purchase-order-management/supplier-purchase-order-workspace";
import StylewiseEventsWorkspace from "./components/stylewise-events/stylewise-events-workspace";
import TrimSheetApprovalWorkspace from "./components/order-management/trim-sheet-approval/trim-sheet-approval-workspace";
// import StyleShippingSummaryCard from "./components/part-shipment/style-shipping-summary-card";
// import PartShipmentsWorkspace from "./components/part-shipment/part-shipments-workspace";
import StoresRequisitionWorkspace from "./components/orderwise-inventory/stores-requisition-workspace";
import GeneralStoresRequisitionWorkspace from "./components/general-inventory/stores-requisition-workspace";
import GoodsIssueNoteWorkspace from "./components/orderwise-inventory/goods-issue-note-workspace";
import GeneralGoodsIssueNoteWorkspace from "./components/general-inventory/goods-issue-note-workspace";
import GeneralGinPrintReportWorkspace from "./components/reports/general-inventory/gin/general-gin-print-report-workspace";
import GoodsIssueNoteCascadeWorkspace from "./components/orderwise-inventory/goods-issue-note-cascade-workspace";
import GoodsReceivedNoteWorkspace from "./components/orderwise-inventory/goods-received-note-workspace";
import GeneralGoodsReceivedNoteWorkspace from "./components/general-inventory/goods-received-note-workspace";
import GeneralGrnPrintReportWorkspace from "./components/reports/general-inventory/grn/general-grn-print-report-workspace";
import GoodsReceivedNoteCascadeWorkspace from "./components/orderwise-inventory/goods-received-note-cascade-workspace";
import GoodsReturnNoteWorkspace from "./components/orderwise-inventory/goods-return-note-workspace";
import GoodsTransferNoteWorkspace from "./components/orderwise-inventory/goods-transfer-note-workspace";
import GeneralGoodsTransferNoteWorkspace from "./components/general-inventory/goods-transfer-note-workspace";
import GeneralGtnPrintReportWorkspace from "./components/reports/general-inventory/gtn/general-gtn-print-report-workspace";
import OrderGoodsTransferNoteWorkspace from "./components/general-inventory/order-goods-transfer-note-workspace";
import GeneralOgtnPrintReportWorkspace from "./components/reports/general-inventory/ogtn/general-ogtn-print-report-workspace";
import GeneralGoodsReturnNoteWorkspace from "./components/general-inventory/goods-return-note-workspace";
import GeneralRtnPrintReportWorkspace from "./components/reports/general-inventory/rtn/general-rtn-print-report-workspace";
import GeneralDamagedGoodsNoteWorkspace from "./components/general-inventory/damaged-goods-note-workspace";
import GeneralDgnPrintReportWorkspace from "./components/reports/general-inventory/dgn/general-dgn-print-report-workspace";
import GeneralSupplierReturnNoteWorkspace from "./components/general-inventory/supplier-return-note-workspace";
import GeneralSrtnPrintReportWorkspace from "./components/reports/general-inventory/srtn/general-srtn-print-report-workspace";
import GeneralPoWorkspace from "./components/general-inventory/general-po-workspace";
import GeneralStockStatusReportWorkspace from "./components/reports/general-inventory/general-stock-status-report-workspace";
import GeneralStockMovementReportWorkspace from "./components/reports/general-inventory/general-stock-movement-report-workspace";
import GeneralStockValuationReportWorkspace from "./components/reports/general-inventory/general-stock-valuation-report-workspace";
import GeneralStockReorderReportWorkspace from "./components/reports/general-inventory/general-stock-reorder-report-workspace";
import GeneralTransactionListReportWorkspace from "./components/reports/general-inventory/general-transaction-list-report-workspace";
import GeneralPurchaseOrderListReportWorkspace from "./components/reports/general-inventory/general-purchase-order-list-report-workspace";
import GeneralStockSummaryReportWorkspace from "./components/reports/general-inventory/general-stock-summary-report-workspace";
import GeneralGrnListingReportWorkspace from "./components/reports/general-inventory/general-grn-listing-report-workspace";
import GeneralPoPrintReportWorkspace from "./components/reports/general-inventory/po/general-po-print-report-workspace";
import GeneralStockMasterWorkspace from "./components/general-inventory/general-stock-master-workspace";
import GeneralSanWorkspace from "./components/general-inventory/general-san-workspace";
import GeneralSanPrintReportWorkspace from "./components/reports/general-inventory/san/general-san-print-report-workspace";
import SupplierReturnNoteWorkspace from "./components/orderwise-inventory/supplier-return-note-workspace";
import DamagedGoodsNoteWorkspace from "./components/orderwise-inventory/damaged-goods-note-workspace";
import StockAdjustmentNoteWorkspace from "./components/orderwise-inventory/stock-adjustment-note-workspace";
import AdditionalIssueNoteWorkspace from "./components/orderwise-inventory/additional-issue-note-workspace";
import AdditionalGoodsReceiptNoteWorkspace from "./components/orderwise-inventory/additional-goods-receipt-note-workspace";
import AinPrintReportWorkspace from "./components/reports/orderwise-inventory/ain/ain-print-report-workspace";
import ArnPrintReportWorkspace from "./components/reports/orderwise-inventory/arn/arn-print-report-workspace";
import StockValuationReportWorkspace from "./components/reports/orderwise-inventory/stock-valuation-report-workspace";
import StockValuationMonthlyReportWorkspace from "./components/reports/orderwise-inventory/stock-valuation-monthly-report-workspace";
import OrderwiseStockStatusReportWorkspace from "./components/reports/orderwise-inventory/stock-status-report-workspace";
import OrderwiseTransactionListReportWorkspace from "./components/reports/orderwise-inventory/transaction-list-report-workspace";
import ItemWiseStockBalanceWorkspace from "./components/reports/orderwise-inventory/item-wise-stock-balance-workspace";
import RawMaterialControlSheetWorkspace from "./components/reports/orderwise-inventory/raw-material-control-sheet-workspace";
import OrderwiseStockSummaryReportWorkspace from "./components/reports/orderwise-inventory/stock-summary-report-workspace";
import OrderwiseGrnListingReportWorkspace from "./components/reports/orderwise-inventory/grn-listing-report-workspace";
import StockMovementReportWorkspace from "./components/orderwise-inventory/stock-movement-report-workspace";
import StockMovementItemReportWorkspace from "./components/orderwise-inventory/stock-movement-item-report-workspace";

import ColorSizeReportWorkspace from "./components/reports/order-management/color-size-report/color-size-report-workspace";
import PurchaseOrderListReportWorkspace from "./components/reports/order-management/purchase-order-list-report/purchase-order-list-report-workspace";
import OutstandingPurchaseOrderListReportWorkspace from "./components/reports/order-management/outstanding-purchase-order-list-report/outstanding-purchase-order-list-report-workspace";
import ScheduledShipmentsReportWorkspace from "./components/reports/order-management/scheduled-shipments-report/scheduled-shipments-report-workspace";
import OrderDetailReportWorkspace from "./components/reports/order-management/order-detail-report/order-detail-report-workspace";
import ShipmentStatusReportWorkspace from "./components/reports/order-management/shipment-status-report/shipment-status-report-workspace";
import YearSeasonOrdersReportWorkspace from "./components/reports/order-management/year-season-orders-report/year-season-orders-report-workspace";
import PendingEventsReportWorkspace from "./components/reports/order-management/pending-events-report/pending-events-report-workspace";
import StockArrivalStatusReportWorkspace from "./components/reports/order-management/stock-arrival-status-report/stock-arrival-status-report-workspace";
import CostOfProductionReportWorkspace from "./components/reports/order-management/cost-of-production-report/cost-of-production-report-workspace";
import OrderQuotaDetailReportWorkspace from "./components/reports/order-management/order-quota-detail-report/order-quota-detail-report-workspace";
import PostOrderCostSheetReportWorkspace from "./components/reports/order-management/post-order-cost-sheet-report/post-order-cost-sheet-report-workspace";
import MonthlyActualShipmentsReportWorkspace from "./components/reports/order-management/monthly-actual-shipments-report/monthly-actual-shipments-report-workspace";
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
import GinPrintReportWorkspace from "./components/reports/orderwise-inventory/gin/gin-print-report-workspace";
import GrnPrintReportWorkspace from "./components/reports/orderwise-inventory/grn/grn-print-report-workspace";
import RtnPrintReportWorkspace from "./components/reports/orderwise-inventory/rtn/rtn-print-report-workspace";
import GtnPrintReportWorkspace from "./components/reports/orderwise-inventory/gtn/gtn-print-report-workspace";
import SrnPrintReportWorkspace from "./components/reports/orderwise-inventory/srn/srn-print-report-workspace";
import DgnPrintReportWorkspace from "./components/reports/orderwise-inventory/dgn/dgn-print-report-workspace";
import SanPrintReportWorkspace from "./components/reports/orderwise-inventory/san/san-print-report-workspace";
import DtnPrintReportWorkspace from "./components/reports/orderwise-inventory/dtn/dtn-print-report-workspace";
import DirectTransferNoteWorkspace from "./components/orderwise-inventory/direct-transfer-note-workspace";
import GeneralStrnPrintReportWorkspace from "./components/reports/general-inventory/strn/general-strn-print-report-workspace";
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
  const navigate = useNavigate();
  // Look at the routing memory state right inside the router
  const userToEdit = location.state;

  // AxiosInterceptor (axiosClient.ts) redirects to the sign-in page on
  // session expiry / failed token refresh, but it lives outside React and
  // has no access to a router hook - it calls GlobalRouter.navigate instead,
  // which stays null until something wires it up. Without this, a stale
  // session silently clears its tokens and leaves the user stuck on the
  // current (now permanently 401ing) page instead of being sent to sign in.
  useEffect(() => {
    GlobalRouter.navigate = navigate;
  }, [navigate]);

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
        <Route
          index
          path="order-item-feature"
          element={<OrderItemFeatures />}
        />
        <Route index path="garment-type-items" element={<GarmentTypeItems />} />
        <Route index path="stock-reference" element={<StockReference />} />
        <Route
          index
          path="order-item-catalog"
          element={<OrderItemCatalogPage />}
        />
        <Route
          index
          path="currency-conversion"
          element={<CurrencyConversionPage />}
        />
        <Route index path="additional-cost" element={<AdditionalCosts />} />
        <Route index path="sub-contractor" element={<SubContractors />} />
        <Route
          index
          path="additional"
          element={<GarmentAdditionalCostPage />}
        />
        <Route index path="subcont" element={<SubContractPage />} />
        <Route index path="buyers" element={<Buyers />} />
        <Route
          index
          path="port-destination"
          element={<PortDestinations />}
        />
        <Route index path="garment-type" element={<GarmentTypes />} />
        <Route index path="basis" element={<Basises />} />
        <Route index path="season" element={<Seasons />} />
        <Route index path="production-line" element={<ProductionLines />} />
        <Route index path="operation" element={<Operations />} />
        <Route
          index
          path="non-productive-hour-code"
          element={<NonProductiveHourCodes />}
        />
        <Route index path="machine-type" element={<MachineTypes />} />
        <Route index path="garment-component" element={<GarmentComponents />} />
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
        <Route
          index
          path="end-of-production-confirmation"
          element={<EndOfProductionConfirmation />}
        />
        <Route index path="supplier" element={<Suppliers />} />
        <Route index path="po" element={<OrderConfirmationRoutine />} />
        <Route index path="ie-company-setup" element={<CompanyAddressSetupPage />} />
        <Route index path="commercial-invoice" element={<CommercialInvoiceListPage />} />
        <Route index path="letter-of-credit" element={<LetterOfCreditPage />} />
        <Route index path="customs-declaration" element={<CustomsDeclarationPage />} />
        <Route index path="clearance-office" element={<ClearanceOfficePage />} />
        <Route index path="payment-term" element={<PaymentTermPage />} />
        <Route index path="transport-mode" element={<TransportModePage />} />
        <Route index path="document-type" element={<DocumentTypePage />} />
        <Route index path="duty-tax-code" element={<DutyTaxCodePage />} />
        <Route index path="tax-base-code" element={<TaxBaseCodePage />} />
        <Route index path="agreement-code" element={<AgreementCodePage />} />
        <Route index path="commodity-code" element={<CommodityCodePage />} />
        <Route index path="customs-procedure-code" element={<CustomsProcedureCodePage />} />
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
        <Route
          index
          path="general-srn"
          element={<GeneralStoresRequisitionWorkspace />}
        />
        <Route index path="gin" element={<GoodsIssueNoteWorkspace />} />
        <Route
          index
          path="general-gin"
          element={<GeneralGoodsIssueNoteWorkspace />}
        />
        <Route
          index
          path="general-gin-print"
          element={<GeneralGinPrintReportWorkspace />}
        />
        <Route
          index
          path="gin-cascade"
          element={<GoodsIssueNoteCascadeWorkspace />}
        />
        <Route index path="grn" element={<GoodsReceivedNoteWorkspace />} />
        <Route
          index
          path="general-grn"
          element={<GeneralGoodsReceivedNoteWorkspace />}
        />
        <Route
          index
          path="general-grn-print"
          element={<GeneralGrnPrintReportWorkspace />}
        />
        <Route
          index
          path="grn-cascade"
          element={<GoodsReceivedNoteCascadeWorkspace />}
        />
        <Route index path="rtn" element={<GoodsReturnNoteWorkspace />} />
        <Route index path="gtn" element={<GoodsTransferNoteWorkspace />} />
        <Route index path="dtn" element={<DirectTransferNoteWorkspace />} />
        <Route
          index
          path="general-gtn"
          element={<GeneralGoodsTransferNoteWorkspace />}
        />
        <Route
          index
          path="general-gtn-print"
          element={<GeneralGtnPrintReportWorkspace />}
        />
        <Route
          index
          path="general-ogtn"
          element={<OrderGoodsTransferNoteWorkspace />}
        />
        <Route
          index
          path="general-ogtn-print"
          element={<GeneralOgtnPrintReportWorkspace />}
        />
        <Route
          index
          path="general-rtn"
          element={<GeneralGoodsReturnNoteWorkspace />}
        />
        <Route
          index
          path="general-rtn-print"
          element={<GeneralRtnPrintReportWorkspace />}
        />
        <Route
          index
          path="general-dgn"
          element={<GeneralDamagedGoodsNoteWorkspace />}
        />
        <Route
          index
          path="general-dgn-print"
          element={<GeneralDgnPrintReportWorkspace />}
        />
        <Route
          index
          path="general-srtn"
          element={<GeneralSupplierReturnNoteWorkspace />}
        />
        <Route
          index
          path="general-srtn-print"
          element={<GeneralSrtnPrintReportWorkspace />}
        />
        <Route index path="general-po" element={<GeneralPoWorkspace />} />
        <Route
          index
          path="general-po-print"
          element={<GeneralPoPrintReportWorkspace />}
        />
        <Route
          index
          path="general-stock-master"
          element={<GeneralStockMasterWorkspace />}
        />
        <Route index path="general-san" element={<GeneralSanWorkspace />} />
        <Route
          index
          path="general-san-print"
          element={<GeneralSanPrintReportWorkspace />}
        />
        <Route
          index
          path="general-stock-status-report"
          element={<GeneralStockStatusReportWorkspace />}
        />
        <Route
          index
          path="general-stock-movement-report"
          element={<GeneralStockMovementReportWorkspace />}
        />
        <Route
          index
          path="general-stock-valuation-report"
          element={<GeneralStockValuationReportWorkspace />}
        />
        <Route
          index
          path="general-stock-reorder-report"
          element={<GeneralStockReorderReportWorkspace />}
        />
        <Route
          index
          path="general-transaction-list-report"
          element={<GeneralTransactionListReportWorkspace />}
        />
        <Route
          index
          path="general-purchase-order-list-report"
          element={<GeneralPurchaseOrderListReportWorkspace />}
        />
        <Route
          index
          path="general-stock-summary-report"
          element={<GeneralStockSummaryReportWorkspace />}
        />
        <Route
          index
          path="general-grn-listing-report"
          element={<GeneralGrnListingReportWorkspace />}
        />
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
          path="arn"
          element={<AdditionalGoodsReceiptNoteWorkspace />}
        />
        <Route index path="ain-print" element={<AinPrintReportWorkspace />} />
        <Route index path="arn-print" element={<ArnPrintReportWorkspace />} />
        <Route
          index
          path="stock-valuation-report"
          element={<StockValuationReportWorkspace />}
        />
        <Route
          index
          path="stock-valuation-monthly-report"
          element={<StockValuationMonthlyReportWorkspace />}
        />
        <Route
          index
          path="orderwise-stock-status-report"
          element={<OrderwiseStockStatusReportWorkspace />}
        />
        <Route
          index
          path="orderwise-transaction-list-report"
          element={<OrderwiseTransactionListReportWorkspace />}
        />
        <Route
          index
          path="item-wise-stock-balance-report"
          element={<ItemWiseStockBalanceWorkspace />}
        />
        <Route
          index
          path="raw-material-control-sheet-report"
          element={<RawMaterialControlSheetWorkspace />}
        />
        <Route
          index
          path="orderwise-stock-summary-report"
          element={<OrderwiseStockSummaryReportWorkspace />}
        />
        <Route
          index
          path="orderwise-grn-listing-report"
          element={<OrderwiseGrnListingReportWorkspace />}
        />
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
        <Route index path="gin-print" element={<GinPrintReportWorkspace />} />
        <Route index path="grn-print" element={<GrnPrintReportWorkspace />} />
        <Route index path="rtn-print" element={<RtnPrintReportWorkspace />} />
        <Route index path="gtn-print" element={<GtnPrintReportWorkspace />} />
        <Route index path="srn-print" element={<SrnPrintReportWorkspace />} />
        <Route index path="dgn-print" element={<DgnPrintReportWorkspace />} />
        <Route index path="san-print" element={<SanPrintReportWorkspace />} />
        <Route index path="dtn-print" element={<DtnPrintReportWorkspace />} />
        <Route
          index
          path="general-strn-print"
          element={<GeneralStrnPrintReportWorkspace />}
        />
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
          path="scheduled-shipments-report"
          element={<ScheduledShipmentsReportWorkspace />}
        />
        <Route
          index
          path="shipment-status-report"
          element={<ShipmentStatusReportWorkspace />}
        />
        <Route
          index
          path="year-season-orders-report"
          element={<YearSeasonOrdersReportWorkspace />}
        />
        <Route
          index
          path="pending-events-report"
          element={<PendingEventsReportWorkspace />}
        />
        <Route
          index
          path="stock-arrival-status-report"
          element={<StockArrivalStatusReportWorkspace />}
        />
        <Route
          index
          path="cost-of-production-report"
          element={<CostOfProductionReportWorkspace />}
        />
        <Route
          index
          path="order-quota-detail-report"
          element={<OrderQuotaDetailReportWorkspace />}
        />
        <Route
          index
          path="post-order-cost-sheet-report"
          element={<PostOrderCostSheetReportWorkspace />}
        />
        <Route
          index
          path="monthly-actual-shipments-report"
          element={<MonthlyActualShipmentsReportWorkspace />}
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
