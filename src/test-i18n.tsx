import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n';

const TestComponent = () => {
  const { t } = i18n;

  return <div>{t('welcome')}</div>;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <TestComponent />
    </I18nextProvider>
  </React.StrictMode>
);