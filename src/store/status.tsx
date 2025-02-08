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
          ollama: data.OLLAMA,
          theme: data.THEME,
        });
      });
  }, []);
};

export type SystemStatus = {
  libreTranslate: boolean;
  libreTranslateAPIKey: string;
  languageTool: boolean;
  ollama: boolean;
  theme:  "dark" | "light" | "pole";
};

export const useSystemStatus = create(() => ({
  libreTranslate: false,
  libreTranslateAPIKey: "",
  languageTool: false,
  ollama: false,
  theme: "dark" as SystemStatus["theme"],
}));
