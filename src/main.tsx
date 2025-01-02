import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import { Switcher } from "./switcher";
import { theme } from "./common/Theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Footer } from "./common/Footer";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* @ts-expect-error: theme in window */}
    <ThemeProvider theme={theme(window._theme)}>
      <CssBaseline />
      <div className="layout">
        <Switcher />
        <Footer />
      </div>
    </ThemeProvider>
  </React.StrictMode>
);
