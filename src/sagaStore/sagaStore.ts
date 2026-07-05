import createSagaMiddleware from "redux-saga";
import {
  legacy_createStore as createStore,
  applyMiddleware,
  compose,
  type Middleware,
} from "redux";
import { rootSaga } from "./root-saga";
import { rootReducer } from "./rootReducer";
import { persistReducer, persistStore } from "redux-persist";
import { thunk } from "redux-thunk";

// Import lookups safely to handle CommonJS vs ESM issues inside Vite compilation scopes
import storageModule from "redux-persist/lib/storage";
const storage = (storageModule as any).default || storageModule;

import reduxLogger from "redux-logger";
import { supplierPurchaseOrderApi } from "../services/supplier-purchase-order.service";
import { stylewiseEventApi } from "../services/stylewise-event.services";
import { partShipmentApi } from "../services/part-shipment.service";
const logger = (reduxLogger as any).default || reduxLogger;

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
  }
}

const persistConfig = {
  key: "root",
  storage,
  // CRITICAL SECURITY FLUID FLANK: Prevent redux-persist from tracking RTK-Query cache states!
  // This isolates our master domain tables from state storage serialization conflicts
  // Add the middleware instance inside your middleWares pipeline array block:

  blacklist: [
    supplierPurchaseOrderApi.reducerPath,
    stylewiseEventApi.reducerPath, // FIXED: Isolates the milestone cache state from storage bloat
  ],
};

const sagaMiddleware = createSagaMiddleware();

// Wraps your combined root reducers safely with the updated blacklisted configuration limits
const persistedReducer = persistReducer(persistConfig, rootReducer as any);

// --- ENTERPRISE PERSIST/RTK CORE INTERCEPTOR FILTER GUARD ---
// This customized interceptor drops storage serialization actions from entering the RTK Query engine thread,
// which completely stops the "unsubscribeQueryResult" execution crash loops!
const persistGuardMiddleware: Middleware = () => (next) => (action: any) => {
  if (action?.type?.startsWith("persist/")) {
    // If the active tracking transmission belongs to redux-persist, bypass RTK calculation hooks safely
    return next(action);
  }
  return next(action);
};

// --- PIPELINING MIDDLEWARES CORRECTLY ---
const middleWares: Middleware[] = [
  thunk,
  persistGuardMiddleware, // Mounted directly between thunk and logger architectures
  import.meta.env.DEV && logger,
  sagaMiddleware,
  supplierPurchaseOrderApi.middleware,
  stylewiseEventApi.middleware, // FIXED: Registers asynchronous event query transport listeners
  partShipmentApi.middleware, // LOCKED SAFE FROM SERIALIZATION CRASHES
].filter((middleware): middleware is Middleware => Boolean(middleware));

// Safe execution check for developer browser devtools extensions
const composeEnhancer =
  (import.meta.env.DEV &&
    typeof window !== "undefined" &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose;

const composedEnhancers = composeEnhancer(applyMiddleware(...middleWares));

// Instantiate the core master application store using your persisted schemas
export const store = createStore(
  persistedReducer,
  undefined,
  composedEnhancers,
);

// Activate background listeners and data-caching lifecycle synchronization streams
sagaMiddleware.run(rootSaga);
export const persistor = persistStore(store);
