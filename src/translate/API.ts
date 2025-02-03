import { LangChoice } from "./types";

export const API = () => {
  const getTranslation = (
    source: LangChoice,
    target: LangChoice,
    text: string
  ) =>
    fetch(`/api/libretranslate/translate`, {
      method: "POST",
      body: JSON.stringify({
        q: text,
        source: source.code,
        target: target.code,
        format: "text",
        alternatives: 3,
        api_key: import.meta.env.VITE_LIBRETRANSLATE_APIKEY,
      }),
      headers: { "Content-Type": "application/json" },
    }).then((data) => data.json());

  const getOllamaTranslation = (
    _source: LangChoice,
    target: LangChoice,
    text: string
  ) =>
    fetch(`/api/ollama/generate`, {
      method: "POST",
      body: JSON.stringify({
        prompt: `
        You are an advanced language model tasked with translating the provided text into ${target.name}. 

        First you will provide translation of provided text and highlight any notable words or phrases in the source language within translation. 

        For each highlighted word or phrase, provide a brief explanation of its significance, context, or usage.
        Make sure the explanations are in ${target.name} language.

        ### Text to Translate:
        ${text}
        
        ### Example:
       
        #### Input:
        **Text to Translate:**
        "Climate change is one of the most pressing issues of our time. It affects everything from weather patterns to agricultural productivity."
        
        **Target Language:**
        Spanish
        
        #### Output:
        { 
        translation: "Cambio climático es uno de los problemas más urgentes[1] de nuestra época. Afecta todo, desde los patrones climáticos hasta la productividad agrícola[2].",
        "notable words": 
        1. urgentes (pressing issues) - "Pressing issues" are problems that require immediate attention and action. In this context, it emphasizes the urgency of addressing climate change. \n
        2. productividad agrícola (agricultural productivity) - "Agricultural productivity" refers to the efficiency of agricultural output relative to input. Climate change can significantly affect crop yields and food security, making this a crucial area of concern.
        }
        `,
        format: {
          type: "object",
          properties: {
            translation: {
              type: "string",
            },
            "notable words": {
              type: "string",
            },
          },
          required: ["translation", "notable words"],
        },
        stream: false,
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((data) => data.json())
      .then((data) => {
        const res = JSON.parse(data.response);
        return {
          translatedText: res.translation,
          notableWords: res["notable words"],
        };
      });

  const getLanguages = () =>
    fetch(`/api/libretranslate/languages`).then((data) => data.json());

  return {
    getTranslation,
    getLanguages,
    getOllamaTranslation,
  };
};
