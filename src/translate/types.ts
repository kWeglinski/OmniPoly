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

export type NotableWord = {
  word: string;
  explanation: string;
}

export type TranslationResponse = {
  alternatives: string[];
  translatedText: string;
  notableWords?: NotableWord[];
  detectedLanguage?: {
    language: string;
  };
};
