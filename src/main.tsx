import React from "react";
import ReactDOM from "react-dom/client";
import { I18nextProvider } from 'react-i18next';
import "./index.css";
import { Body } from "./body";
import i18n from './i18n';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <Body />
    </I18nextProvider>
  </React.StrictMode>
);
