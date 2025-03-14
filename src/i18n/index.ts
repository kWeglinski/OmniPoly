import { useSystemStatus } from "../store/status";

const translations = {
  pl: {
    automatic: "automatyczny",
    "Upload file": "Wyślij plik",
    "supported file types:": "wspierane formaty:",
    "Download as file": "Pobierz jako plik",
    "Copy to clipboard": "Skopiuj do schowka",
    detected: "wykryto",
    "Clear text": "Wyczyść",
    language: "język",
    translate: "tłumacz",
    grammar: "pisownia",
  },
};

export const i18n = (text: string) => {
  const lang = useSystemStatus.getState().language;
  console.log({ lang })
  if (lang === "en") {
    return text;
  }

  if (!translations[lang]) {
    return text;
  }
  return translations[lang][text] ?? text;
};
