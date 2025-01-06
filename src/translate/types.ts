export type Lang = {
  code: string;
  name: string;
  targets: string[];
  longCode?: string;
};

export type History = {
  history: Lang[];
};

export type LangChoice = Lang & History;

export type TranslationResponse = {
  alternatives: string[];
  translatedText: string;
  detectedLanguage?: {
    language: string;
  };
};
