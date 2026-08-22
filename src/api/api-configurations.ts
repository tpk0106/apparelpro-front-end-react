export const APPARELPRO_ENDPOINTS = {
  REFERENCE_SECTION: {
    CURRENCY: {
      GET: "api/currency/list",
      GET_BY_PAGINATION: "api/currency/list",
      DOES_CURRENCY_EXIST: "api/currency/list/does-currency-exist/",
      GET_COUNTRY_BY_PAGE_NUMBER: "api/currency/list/paging/",
      GETBY_CODE: "api/currency/list/",
      POST: "api/currency",
      DELETE: "api/currency/",
      PUT: "api/currency/",
      PATCH: "api/currency",
    },
    COUNTRY: {
      GET_BY_PAGINATION: "api/country/list",
      GETBY_CODE: "api/country/list/",
      DOES_COUNTRY_EXIST: "api/country/list/does-country-exist/",
      POST: "api/country",
      DELETE: "api/country/",
      PUT: "api/country/",
      PATCH: "api/country",
    },
    BUYER: {
      GET_BY_PAGINATION: "api/buyer/list",
      GET_BY_BUYER_ORDER_TYPE_STYLE: "api/buyer/list/",
      POST: "api/buyer",
      DELETE: "api/buyer/",
      PUT: "api/buyer/",
      PATCH: "api/buyer",
    },
    GARMENT_TYPE: {
      GET_BY_PAGINATION: "api/garmentType/list",
      GET_ALL_GARMENT_TYPES: "api/garmentType/list/all",
      GETBY_TYPECODE: "api/garmentType/list/",
      POST: "api/garmentType",
      DELETE: "api/garmentType/",
      PUT: "api/garmentType/",
      PATCH: "api/garmentTypes",
    },
    UNIT: {
      GET: "api/unit/list",
      GET_BY_PAGINATION: "api/unit/list",
      //GETBY_TYPECODE: "api/unit/list/",
      DOES_UNIT_EXIST: "api/unit/list/does-unit-exist/",
      POST: "api/unit",
      DELETE: "api/unit/",
      PUT: "api/unit/",
      PATCH: "api/unit",
    },
    DEPARTMENT: {
      GET_BY_PAGINATION: "api/department/list",
      GET_ALL: "api/department/lookup",
    },
    UNITCONVERSION: {
      GET: "api/unit-conversions/list",
      GET_BY_PAGINATION: "api/unit-conversions/list",
    },
    BASIS: {
      GET: "api/basis/list",
      GET_BY_PAGINATION: "api/basis/list",
      GETBY_TYPECODE: "api/basis/list/",
      POST: "api/basis",
      DELETE: "api/basis/",
      PUT: "api/basis/",
      PATCH: "api/basis",
    },
    PRODUCTION_LINE: {
      GET_BY_PAGINATION: "api/production-line/list",
      GETBY_CODE: "api/production-line/list/",
      POST: "api/production-line",
      DELETE: "api/production-line/",
      PUT: "api/production-line",
    },
    OPERATION: {
      GET_BY_PAGINATION: "api/operation/list",
      GETBY_CODE: "api/operation/list/",
      POST: "api/operation",
      DELETE: "api/operation/",
      PUT: "api/operation",
    },
    NON_PRODUCTIVE_HOUR_CODE: {
      GET_BY_PAGINATION: "api/non-productive-hour-code/list",
      GETBY_CODE: "api/non-productive-hour-code/list/",
      POST: "api/non-productive-hour-code",
      DELETE: "api/non-productive-hour-code/",
      PUT: "api/non-productive-hour-code",
    },
    MACHINE_TYPE: {
      GET_BY_PAGINATION: "api/machine-type/list",
      GETBY_CODE: "api/machine-type/list/",
      POST: "api/machine-type",
      DELETE: "api/machine-type/",
      PUT: "api/machine-type",
    },
    GARMENT_COMPONENT: {
      GET_BY_PAGINATION: "api/garment-component/list",
      GETBY_CODE: "api/garment-component/list/",
      POST: "api/garment-component",
      DELETE: "api/garment-component/",
      PUT: "api/garment-component",
    },
    EMPLOYEE: {
      GET_BY_PAGINATION: "api/employee/list",
      GETBY_CODE: "api/employee/list/",
      POST: "api/employee",
      DELETE: "api/employee/",
      PUT: "api/employee",
    },
    STYLE_COMPONENT_BREAKDOWN: {
      GET_BY_STYLE: "api/style-component-breakdown/by-style",
      BULK_SAVE: "api/style-component-breakdown/bulk-save",
    },
    STYLE_OPERATION_BREAKDOWN: {
      GET_BY_STYLE: "api/style-operation-breakdown/by-style",
      SEED_FROM_TEMPLATE: "api/style-operation-breakdown/seed-from-template",
      BULK_SAVE: "api/style-operation-breakdown/bulk-save",
    },
    HOLIDAY: {
      GET_BY_PAGINATION: "api/holiday/list",
      POST: "api/holiday",
      DELETE: "api/holiday/",
    },
    PRODUCTION_LINE_ALLOCATION: {
      GET_BY_SHIPMENT: "api/production-line-allocation/by-shipment",
      GET_BY_LINE: "api/production-line-allocation/by-line",
      MANUAL: "api/production-line-allocation/manual",
      AUTOMATIC: "api/production-line-allocation/automatic",
      DELETE: "api/production-line-allocation",
    },
    ESTIMATED_PRODUCTION_LINE_ALLOCATION: {
      GET: "api/estimated-production-line-allocation",
      MANUAL: "api/estimated-production-line-allocation/manual",
      AUTOMATIC: "api/estimated-production-line-allocation/automatic",
      DELETE: "api/estimated-production-line-allocation",
    },
    DAILY_PRODUCTION_TIME_TICKET: {
      GET: "api/daily-production-time-ticket",
      BULK_SAVE: "api/daily-production-time-ticket/bulk-save",
    },
    ESTIMATED_PRODUCTION_ENTRY: {
      GET_BY_LINE: "api/estimated-production-entry/by-line",
      BULK_SAVE: "api/estimated-production-entry/bulk-save",
    },
    DAILY_PRODUCTION_ENTRY: {
      GET_BY_DATE: "api/daily-production-entry/by-date",
      BULK_SAVE: "api/daily-production-entry/bulk-save",
    },
    SECTION: {
      LIST_ALL: "api/section/list/all",
    },
    PRODUCTION_SUMMARY_DAILY_REPORT: {
      GET: "api/production-summary-daily-report",
      PDF: "api/production-summary-daily-report/pdf",
    },
    PRODUCTION_SCHEDULE_REPORT: {
      GET: "api/production-schedule-report",
      PDF: "api/production-schedule-report/pdf",
    },
    PRODUCTION_SUMMARY_MONTHLY_REPORT: {
      GET: "api/production-summary-monthly-report",
      PDF: "api/production-summary-monthly-report/pdf",
    },
    PRODUCTION_SUMMARY_MONTHLY_OVERVIEW_REPORT: {
      GET: "api/production-summary-monthly-overview-report",
      PDF: "api/production-summary-monthly-overview-report/pdf",
    },
    PRODUCTION_SUMMARY_STYLE_WISE_REPORT: {
      GET: "api/production-summary-style-wise-report",
      PDF: "api/production-summary-style-wise-report/pdf",
    },
    PRODUCTION_SUMMARY_STYLE_WISE_DETAILED_REPORT: {
      GET: "api/production-summary-style-wise-detailed-report",
      PDF: "api/production-summary-style-wise-detailed-report/pdf",
    },
    LINE_PRODUCTION_SUMMARY_REPORT: {
      GET: "api/line-production-summary-report",
      PDF: "api/line-production-summary-report/pdf",
    },
    OPERATION_BREAKDOWN_REPORT: {
      GET: "api/operation-breakdown-report",
      PDF: "api/operation-breakdown-report/pdf",
    },
    MANPOWER_REQUIREMENT_REPORT: {
      GET: "api/manpower-requirement-report",
      PDF: "api/manpower-requirement-report/pdf",
    },
    DAILY_EMPLOYEE_EFFICIENCY_REPORT: {
      GET: "api/daily-employee-efficiency-report",
      PDF: "api/daily-employee-efficiency-report/pdf",
    },
    MONTHLY_EMPLOYEE_EFFICIENCY_REPORT: {
      GET: "api/monthly-employee-efficiency-report",
      PDF: "api/monthly-employee-efficiency-report/pdf",
    },
    LINE_EFFICIENCY_REPORT: {
      GET: "api/line-efficiency-report",
      PDF: "api/line-efficiency-report/pdf",
    },
    ESTIMATED_PRODUCTION_SCHEDULE_REPORT: {
      GET: "api/estimated-production-schedule-report",
      PDF: "api/estimated-production-schedule-report/pdf",
    },
    PRODUCTION_ANALYSIS_SUMMARY_REPORT: {
      GET: "api/production-analysis-summary-report",
      PDF: "api/production-analysis-summary-report/pdf",
    },
    PRODUCTION_PROGRESS_GRAPH: {
      GET: "api/production-progress-graph",
    },
    DASHBOARD: {
      CURRENT_STYLE: "api/dashboard/current-style",
      PRODUCTION_PROGRESS: "api/dashboard/production-progress",
      DAILY_TREND: "api/dashboard/daily-trend",
      DAILY_TREND_ALL_SECTIONS: "api/dashboard/daily-trend-all-sections",
      ORDER_MANAGEMENT_SUMMARY: "api/dashboard/order-management-summary",
      ORDERWISE_INVENTORY_SUMMARY: "api/dashboard/orderwise-inventory-summary",
    },
    SUBSCRIPTION: {
      GET: "api/subscription/list",
      POST: "api/subscription",
    },
    CURRENCY_EXCHANGE: {
      GET: "api/currencyExchange/list",
      GET_BY_PAGINATION: "api/currencyExchange/list",
      GET_BY_DATE: "api/currencyExchange/list/byDate",
      GET_CURRENCY_EXCHANGES_BY_BASE_CURRENCY:
        "api/currencyExchange/list/baseCurrency",
      GET_CURRENCY_EXCHANGES_BY_BASE_CURRENCY_AND_QUOTE_CURRENCY_ON_DATE:
        "api/list/{baseCurrency}/{quoteCurrency}/{date}",
      POST: "api/currencyExchange",
      PUT: "api/currencyExchange/",
      DELETE: "api/currencyExchange/",
    },
    CURRENCY_CONVERSION: {
      // Rebuilt 2026-08-09 to match the real CurrencyConversionController - no
      // date dimension (that was copy-pasted from Currency Exchange). PUT takes
      // From/To straight from the request body, so there's no query-param
      // variant needed here.
      GET: "api/currencyConversion/list",
      GET_BY_PAGINATION: "api/currencyConversion/list",
      GET_BY_FROM_TO: "api/currencyConversion/list/",
      POST: "api/currencyConversion",
      PUT: "api/currencyConversion",
      DELETE: "api/currencyConversion/",
    },
    BANK: {
      GET_BY_PAGINATION: "api/bank/list",
      GET_BY_BANK_CODE: "api/bank/list/",
      DOES_BANK_EXIST: "api/bank/list/does-bank-exist/",
      POST: "api/bank",
      DELETE: "api/bank/",
      PUT: "api/bank/",
      PATCH: "api/bank",
    },
    SUPPLIER: {
      GET_BY_PAGINATION: "api/supplier/list",
      GET_BY_SUPPLIER_CODE: "api/supplier/list/",
      DOES_SUPPLIER_EXIST: "api/supplier/list/does-supplier-exist/",
      SUPPLIERS_LOOKUP: "api/supplier/suppliers-lookup",
      SUPPLIER_PO: "api/supplier-po/unfulfilled-budget",
      SAVE_SUPPLIER_PO: "api/supplier-po/save-supplier-po",
      POST: "api/supplier",
      DELETE: "api/supplier/",
      PUT: "api/supplier/",
      PATCH: "api/supplier",
    },
    ADDRESS: {
      GET_BY_PAGINATION: "api/address/list",
      GET_BY_ADDRESS_ID_PAGINATION: "api/address/list/byAddressId/",
      GET_BY_ADDRESS_ID: "api/address/list/addressId/",
      GET_BY_BUYER_CODE: "api/address/list/buyerCode/",
      GET_BY_BANK_CODE: "api/address/list/bankCode/",
      DOES_BANK_EXIST: "api/address/list/does-bank-exist/",
      POST: "api/address",
      DELETE: "api/address/",
      UPDATE_BY_BUYER_CODE_AND_ADDRESS_ID: "api/address/buyerCode/addressId",
      UPDATE_BY_BANK_CODE_AND_ADDRESS_ID: "api/address/bank",
      PUT: "api/address/buyerCode/addressId",
      PATCH: "api/address",
    },
    DESTINATION: {
      GET_BY_PAGINATION: "api/portDestination/list",
      GET_PORT_BY_COUNTRY_AND_DESTINATION_ID:
        "api/portDestination/list/countryCode/id",
      GET_ALL_PORTS_BY_COUNTRY_CODE: "api/portDestination/list/countryCode",
      POST: "api/portDestination",
      DELETE: "api/portDestination/",
      PUT: "api/portDestination/",
      PATCH: "api/portDestination",
    },
    ITEM_FEATURE: {
      GET: "api/item-feature/list",
      GET_BY_PAGINATION: "api/item-feature/list",
      DOES_UNIT_EXIST: "api/item-feature/list/does-unit-exist/",
      POST: "api/item-feature",
      DELETE: "api/item-feature/",
      PUT: "api/item-feature",
      PATCH: "api/item-feature",
    },
    ORDER_ITEM_FEATURE: {
      GET_BY_PAGINATION: "api/order-item-feature/list",
      POST: "api/order-item-feature",
      PUT: "api/order-item-feature",
      DELETE: "api/order-item-feature",
    },
    GARMENT_TYPE_ITEMS: {
      GET_BY_TYPE: "api/garment-type-items/list",
      POST: "api/garment-type-items",
      DELETE: "api/garment-type-items",
    },
    ADDITIONAL_COST: {
      GET_BY_PAGINATION: "api/additional-cost/list",
      POST: "api/additional-cost",
      PUT: "api/additional-cost",
      DELETE: "api/additional-cost",
    },
    // Sub Contractor (2026-08-09) - minimal Code+Name reference, built to resolve
    // the AIN (Additional Issue Note) Zero-Assumption gap: od_scref had no modern
    // entity anywhere in the app. Backed by SubContractorController.
    SUB_CONTRACTOR: {
      GET_BY_PAGINATION: "api/sub-contractor/list",
      GETBY_CODE: "api/sub-contractor/list/",
      DOES_SUB_CONTRACTOR_EXIST: "api/sub-contractor/list/does-exist/",
      POST: "api/sub-contractor",
      DELETE: "api/sub-contractor",
      PUT: "api/sub-contractor",
    },
    STOCK: {
      GET_BY_PAGINATION: "api/stock/list",
      POST: "api/stock",
      PUT: "api/stock",
      DELETE: "api/stock",
    },
    ORDER_ITEM_CATALOG: {
      GET_BY_PAGINATION: "api/order-item-catalog/list",
      POST: "api/order-item-catalog",
      PUT: "api/order-item-catalog",
      DELETE: "api/order-item-catalog",
    },
  },
  REGISTRATION: {
    USER: {
      GET_ALL: "api/user/list",
      GET_BY_EMAIL: "api/user/list/",
      POST: "api/user/register",
      LOGIN: "api/user/login",
      PUT: "api/user/",
      PATCH: "api/user",
      DELETE: "api/user/",
      // Users & Groups admin screen (2026-08-06) - reads AspNetUsers directly,
      // unlike GET_ALL above which reads the legacy disconnected Users table.
      LIST_WITH_GROUPS: "api/user/list-with-groups",
      // Base path only - callers append `${userId}/groups/${groupId}` for the
      // POST (assign) and DELETE (remove) calls.
      USER_GROUP_BASE: "api/user/",
    },
    GROUP: {
      GET: "api/groups",
      POST: "api/groups",
      DELETE: "api/groups/",
    },
  },
  TOKEN: {
    REFRESH: "api/security/refresh-token",
    REVOKE: "api/security/revoke-token",
  },
  ORDER_MANAGEMENT: {
    PO: {
      GET: "api/po/list",
      GET_PO_BY_BUYER_AND_ORDER: "api/po/list/buyer/order",
      GET_ALL_POS_BY_BUYER_CODE: "api/po/list/buyer",
      POST: "api/po",
      DELETE: "api/po/",
      PUT: "api/po/",
      PATCH: "api/po",
    },
    STYLE_DETAILS: {
      GET_BY_PAGINATION: "api/styleDetails/list",
      GET_STYLE_DETAILS_BY_BUYER_AND_ORDER: "api/styleDetails/list/buyer/order",
      GET_STYLE_DETAILS_BY_BUYER_AND_ORDER_AND_TYPE:
        "api/styleDetails/list/styles",
      DOES_STYLE_EXIST: "api/styleDetails/list/does-style-exist/",
      GETBY_PONO: "api/styleDetails/list/",
      GET_STYLE_TOTALS: "api/styleDetails/list/buyer/order/totals",
      POST: "api/styleDetails",
      DELETE: "api/styleDetails/",
      PUT: "api/styleDetails/",
      PATCH: "api/styleDetails",
    },
    COLOR_SIZE_DETAILS: {
      GET_COLOR_SIZE_DETAILS_BY_BUYER_AND_ORDER_AND_TYPE_AND_STYLE:
        "api/colorSizeBreakdownDetails/singleOrDefault-By-Style/buyer/order/type/style",
      GET_COLOR_AND_SIZE_ONLY_DETAILS_BY_STYLE:
        "api/colorSizeBreakdownDetails/style-dimensions",
      GET_COLOR_SIZE_MATRIX: "api/colorSizeBreakdownDetails/color-size-matrix",
      POST: "api/colorSizeBreakdownDetails/bulk-save",
      DELETE: "api/colorSizeBreakdownDetails/",
    },
    MATERIAL_CONSUMPTION: {
      GET_AVAILABLE_MATERIALS: "api/material-consumption/items-lookup",
      GET_ALL_MATERIAL_CONSUMPTIONS_BY_STYLE:
        "api/material-consumption/by-style",
      GET_DYNAMIC_FEATURE_HEADERS: "api/material-consumption/feature-headers",
      CALCULATE_CONSUMPTION: "api/material-consumption/calculate-consumption",
      SAVE_ENTRY: "api/material-consumption/save-entry",
      DELETE_ENTRY: "api/material-consumption/delete-entry",
      GET_MATERIAL_CATALOG: "api/material-consumption/catalog",
      COPY_FROM_STYLE: "api/material-consumption/copy-from-style",
    },
    // Additional Costs per Garment (Order Management -> Material Consumption ->
    // Additional Costs per Garment). Backed by GarmentAdditionalCostController.
    GARMENT_ADDITIONAL_COST: {
      GET_BY_STYLE: "api/garment-additional-cost/list",
      SAVE_ENTRY: "api/garment-additional-cost",
      DELETE_ENTRY: "api/garment-additional-cost",
      GET_REPORT: "api/garment-additional-cost/report/details",
      GET_REPORT_PDF: "api/garment-additional-cost/report/pdf",
    },
    // Sub Contracts (Order Management -> D. Sub Contracts). Backed by
    // SubContractController. Legacy od_subc1.dbf, single flat per-Style list -
    // no report/PDF phase yet.
    SUB_CONTRACT: {
      GET_BY_STYLE: "api/sub-contract/list",
      SAVE_ENTRY: "api/sub-contract",
      DELETE_ENTRY: "api/sub-contract",
    },
    STYLE_WISE_EVENTS: {
      GET_STYLE_WISE_EVENTS_REPORT: "api/stylewise-reports/print-report",
    },
    // "Approve Trim Sheet" (Order Management -> Material Consumption ->
    // Approve Trim Sheet). Backed by StyleApprovalController - see
    // src/components/trim-sheet-approval/*.
    STYLE_APPROVAL: {
      GET_DETAILS: "api/style-approval/details",
      APPROVE_TRIM_SHEET: "api/style-approval/approve-trim-sheet",
    },
    // Order Detail Report (Reports -> Order Management -> Order Detail). Backed by
    // OrderDetailReportController - see src/components/order-detail-report/*.
    ORDER_DETAIL_REPORT: {
      GET_DETAILS: "api/order-detail-report/details",
      GET_PDF: "api/order-detail-report/pdf",
    },
    // Colour/Size Report (Reports -> Order Management -> Colour/Size). Backed by
    // ColorSizeReportController - see src/components/reports/order-management/color-size-report/*.
    COLOR_SIZE_REPORT: {
      GET_DETAILS: "api/color-size-report/details",
      GET_PDF: "api/color-size-report/pdf",
    },
    // Trim Sheet Report (Reports -> Order Management -> Trim Sheet). Backed by
    // TrimSheetReportController - see src/components/trim-sheet-report/*.
    TRIM_SHEET_REPORT: {
      GET_DETAILS: "api/trim-sheet-report/details",
      GET_PDF: "api/trim-sheet-report/pdf",
    },
    // Purchase Order List Report (Reports -> Order Management -> List of P/O's).
    // Backed by PurchaseOrderListReportController - see
    // src/components/reports/order-management/purchase-order-list-report/*.
    PURCHASE_ORDER_LIST_REPORT: {
      GET_PO_NUMBERS: "api/purchase-order-list-report/po-numbers",
      GET_DETAILS: "api/purchase-order-list-report/details",
      GET_PDF: "api/purchase-order-list-report/pdf",
    },
    // Outstanding Purchase Order List Report (Reports -> Order Management -> List of
    // Outstanding P/O's). Backed by OutstandingPurchaseOrderListReportController - see
    // src/components/reports/order-management/outstanding-purchase-order-list-report/*.
    OUTSTANDING_PURCHASE_ORDER_LIST_REPORT: {
      GET_DETAILS: "api/outstanding-purchase-order-list-report/details",
      GET_PDF: "api/outstanding-purchase-order-list-report/pdf",
    },
  },
  ORDER_WISE_INVENTORY: {
    STRN: {
      VERIFY_STOCK: "api/orderwise-inventory-strn/verify-stock",
      POST: "api/orderwise-inventory-strn/commit",
      AVAILABLE_CHOICES: "api/orderwise-inventory-strn/available-choices",
      PRINT: "api/orderwise-inventory-strn/print",
      PRINT_PDF: "api/orderwise-inventory-strn/print/pdf",
    },
    GIN: {
      ISSUABLE_LINES: "api/orderwise-inventory-gin/issuable-lines",
      COMMIT: "api/orderwise-inventory-gin/commit",
      PENDING_STRNS: "api/orderwise-inventory-gin/pending-strns",
    },
    GRN: {
      RECEIVABLE_LINES: "api/orderwise-inventory-grn/receivable-lines",
      COMMIT: "api/orderwise-inventory-grn/commit",
      PENDING_POS: "api/orderwise-inventory-grn/pending-pos",
    },
    RTN: {
      RETURNABLE_STOCK: "api/orderwise-inventory-rtn/returnable-stock",
      COMMIT: "api/orderwise-inventory-rtn/commit",
    },
    GTN: {
      TRANSFERABLE_STOCK: "api/orderwise-inventory-gtn/transferable-stock",
      COMMIT: "api/orderwise-inventory-gtn/commit",
    },
    SRN: {
      RETURNABLE_STOCK: "api/orderwise-inventory-srn/returnable-stock",
      COMMIT: "api/orderwise-inventory-srn/commit",
    },
    DGN: {
      DAMAGEABLE_STOCK: "api/orderwise-inventory-dgn/damageable-stock",
      COMMIT: "api/orderwise-inventory-dgn/commit",
    },
    SAN: {
      ADJUSTABLE_STOCK: "api/orderwise-inventory-san/adjustable-stock",
      COMMIT: "api/orderwise-inventory-san/commit",
    },
    // Additional Issue Note (2026-08-09) - built from legacy IN_AIN3.PRG. Backed by
    // AINController. GetIssuableStock only takes buyerCode/order (no note-specific
    // filter server-side) - Sub Contractor + Additional Process are validated on commit.
    AIN: {
      ISSUABLE_STOCK: "api/orderwise-inventory-ain/issuable-stock",
      COMMIT: "api/orderwise-inventory-ain/commit",
    },
    STOCK_MOVEMENT_REPORT: {
      HEADER: "api/stock-movement-reports/header",
      LINES: "api/stock-movement-reports/lines",
      PDF: "api/stock-movement-reports/pdf",
    },
    STOCK_MOVEMENT_ITEM_REPORT: {
      ITEMS: "api/stock-movement-item-reports/items",
      HEADER: "api/stock-movement-item-reports/header",
      LINES: "api/stock-movement-item-reports/lines",
      PDF: "api/stock-movement-item-reports/pdf",
    },
  },
  SYSTEM_CONFIGURATION: {
    SYSTEM_PARAMETER: {
      GET: "api/system-parameters/list",
      PUT: "api/system-parameters/",
    },
  },
  PERMISSIONS: {
    CATALOG: "api/permissions/catalog",
    MATRIX: "api/permissions/matrix",
    UPDATE_ROLE: "api/permissions/role",
  },
  URLS: {
    BASEURL: import.meta.env.VITE_API_BASE_URL || "https://localhost:5000/",
  },
};
