import { LangChoice } from "./types";

export const API = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const libreUrl = urlParams.get("api");

  //@ts-expect-error: window
  const baseUrl = libreUrl ?? window._libreurl ?? "http://localhost:5000";
  const getTranslation = (
    source: LangChoice,
    target: LangChoice,
    text: string
  ) =>
    fetch(`${baseUrl}/translate`, {
      method: "POST",
      body: JSON.stringify({
        q: text,
        source: source.code,
        target: target.code,
        format: "text",
        alternatives: 3,
        api_key: "",
      }),
      headers: { "Content-Type": "application/json" },
    }).then((data) => data.json());

  const getLanguages = () =>
    fetch(`${baseUrl}/languages`).then((data) => data.json());

  return {
    getTranslation,
    getLanguages,
  };
};
