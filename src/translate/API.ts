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
        api_key: "",
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

First, you will provide a translation of the provided text and highlight any notable words or phrases from the source language within the translation using square brackets [].

For each highlighted word or phrase, provide a brief explanation of its significance, context, or usage. Ensure that these explanations are in ${target.name} language.

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
  notable words:
  [
    {
      word: "urgentes (pressing issues)",
      explanation: "Pressing issues" are problems that require immediate attention and action. In this context, it emphasizes the urgency of addressing climate change.
    },
    {
      word: "productividad agrícola (agricultural productivity)",
      explanation: "Agricultural productivity" refers to the efficiency of agricultural output relative to input. Climate change can significantly affect crop yields and food security, making this a crucial area of concern.
    }
  ]
}
        `,
        format: {
          type: "object",
          properties: {
            translation: {
              type: "string",
            },
            "notable words": {
              type: "array",
              items: {
                type: "object",
                properties: {
                  word: {
                    type: "string",
                  },
                  explanation: {
                    type: "string",
                  },
                },
                required: ["word", "explanation"],
              },
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
        console.log({ res });
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
