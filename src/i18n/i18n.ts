




import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import translationBackend from './translationBackend';

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(translationBackend)
  .init({
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false
    },
    backend: {
      loadPath: '/api/translations/{{lng}}'
    },
    react: {
      useSuspense: false
    },
    detection: {
      order: ['querystring', 'cookie'],
      caches: ['cookie']
    },
    saveMissing: true,
    missingKeyHandler: (lngs, namespace, key, fallbackValue) => {
      // This will be called when a translation is missing
      console.log(`Missing translation for key: ${key} in namespace: ${namespace}`);
    }
  });

export default i18n;




