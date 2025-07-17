import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

const i18n = i18next
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    backend: {
      loadPath: '/api/i18n/{{lng}}'
    }
  });

export default i18n;