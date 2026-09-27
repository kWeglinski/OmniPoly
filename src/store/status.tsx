import { useEffect } from "react";
import { create } from "zustand";

const THEME_KEY = "theme";

// saved client choice wins over server default
const getSavedTheme = (fallback: SystemStatus["theme"]) => {
  const saved = localStorage.getItem(THEME_KEY);
  return saved === "dark" || saved === "light" || saved === "pole"
    ? saved
    : fallback;
};

export const useInitialiseSystemStatus = () => {
  useEffect(() => {
    fetch("/api/status")
      .then((data) => data.json())
      .then((data) => {
        useSystemStatus.setState({
          libreTranslate: data.LIBRETRANSLATE,
          libreTranslateAPIKey: data.LIBRETRANSLATE_API_KEY,
          languageTool: data.LANGUAGE_TOOL,
          harper: data.HARPER,
          ollama: data.OLLAMA,
          theme: getSavedTheme(data.THEME),
          disableDictionary: data.DISABLE_DICTIONARY,
          defaultTab: data.DEFAULT_TAB,
          defaultTargetLanguage: data.DEFAULT_TARGET_LANGUAGE,
        });
      })
      .catch(() => {});
  }, []);
};

export type SystemStatus = {
  libreTranslate: boolean;
  libreTranslateAPIKey: string;
  languageTool: boolean;
  harper: boolean;
  ollama: boolean;
  theme:  "dark" | "light" | "pole";
  defaultTab: string;
  defaultTargetLanguage: string;
};

export const useSystemStatus = create(() => ({
  libreTranslate: false,
  libreTranslateAPIKey: "",
  languageTool: false,
  harper: false,
  ollama: false,
  theme: "dark" as SystemStatus["theme"],
  disableDictionary: false,
  defaultTab: "",
  defaultTargetLanguage: "",
}));

export const actions = {
  setTheme: (theme: SystemStatus["theme"]) => {
    localStorage.setItem(THEME_KEY, theme);
    useSystemStatus.setState({ theme });
  },
};
