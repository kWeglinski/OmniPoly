import { useEffect } from "react";
import { create } from "zustand";

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
          theme: data.THEME,
          disableDictionary: data.DISABLE_DICTIONARY
        });
      });
  }, []);
};

export type SystemStatus = {
  libreTranslate: boolean;
  libreTranslateAPIKey: string;
  languageTool: boolean;
  harper: boolean;
  ollama: boolean;
  theme:  "dark" | "light" | "pole";
};

export const useSystemStatus = create(() => ({
  libreTranslate: false,
  libreTranslateAPIKey: "",
  languageTool: false,
  harper: false,
  ollama: false,
  theme: "dark" as SystemStatus["theme"],
  disableDictionary: false,
}));
