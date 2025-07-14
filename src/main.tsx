

import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Body } from "./body";
import "./i18n/i18n";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense fallback="loading">
      <Body />
    </Suspense>
  </React.StrictMode>
);

