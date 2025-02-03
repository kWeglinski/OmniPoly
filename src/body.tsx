import { useEffect, useState } from "react";

import "./index.css";
import { Switcher } from "./switcher";
import { theme } from "./common/Theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Footer } from "./common/Footer";

const useStatus = () => {
  const [status, setStatus] = useState({
    libreTranslate: false,
    libreTranslateAPIKey: "",
    languageTool: false,
    ollama: false,
    theme: "dark",
  });

  useEffect(() => {
    fetch("/api/status")
      .then((data) => data.json())
      .then((data) => {
        setStatus({
          libreTranslate: data.LIBRETRANSLATE,
          libreTranslateAPIKey: data.LIBRETRANSLATE_API_KEY,
          languageTool: data.LANGUAGE_TOOL,
          ollama: data.OLLAMA,
          theme: data.THEME,
        });
      });
  }, []);

  return status;
};

export const Body = () => {
  const status = useStatus();

  return (
    <ThemeProvider theme={theme(status.theme as "dark" | "light" | "pole")}>
      <CssBaseline />
      <div className="layout">
        <Switcher status={status} />
        <Footer />
      </div>
    </ThemeProvider>
  );
};
