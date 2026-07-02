import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";

import "./index.css";
import App from "./App.tsx";
import { store } from "./sagaStore/sagaStore.ts";
import { blueTheme } from "./themes/themes.ts";
import { ThemeProvider } from "@mui/material";
import { ToastContainer } from "react-toastify";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider theme={blueTheme}>
            {/* FIXED: Single, globally shared notification container portal */}
            <ToastContainer
              hideProgressBar
              // stacked
              position="top-right"
              autoClose={3000}
              theme="colored"
            />
            <App />
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    </QueryClientProvider>
  </StrictMode>,
);
