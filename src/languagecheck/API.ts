import { actions } from "../store/snack";
import { LangChoice } from "../translate/types";

export interface LanguageToolResponse {
  software: SoftwareInfo;
  warnings: Warnings;
  language: LanguageInfo;
  matches: Match[];
  sentenceRanges: number[][];
  extendedSentenceRanges: ExtendedSentenceRange[];
}

interface SoftwareInfo {
  name: string;
  version: string;
  buildDate: string;
  apiVersion: number;
  premium: boolean;
  premiumHint: string;
  status: string;
}

interface Warnings {
  [key: string]: unknown; // Placeholder for any warnings, can be expanded if specific keys are known
}

interface LanguageInfo {
  name: string;
  code: string;
  detectedLanguages: DetectedLanguage[];
  confidence?: number;
}

interface DetectedLanguage {
  language: string;
  rate: number;
}

export interface Match {
  message: string;
  shortMessage: string;
  replacements: Replacement[];
  offset: number;
  length: number;
  context: Context;
  sentence: string;
  rule: RuleInfo;
  type: Type;
  ignoreForIncompleteSentence: boolean;
  contextForSureMatch?: number;
}

interface Replacement {
  value: string;
}

interface Context {
  text: string;
  offset: number;
  length: number;
}

interface RuleInfo {
  id: string;
  subId?: string;
  sourceFile?: string;
  description: string;
  issueType: string;
  category: Category;
}

interface Category {
  id: string;
  name: string;
}

interface Type {
  typeName: string;
}

interface ExtendedSentenceRange {
  from: number;
  to: number;
  detectedLanguages: DetectedLanguage[];
}

export const API = () => {
  const getChecked = (text: string, lang: LangChoice) => {
    return fetch("/api/languagetool/check", {
      method: "POST",
      body: JSON.stringify({
        text,
        language: lang.longCode ?? lang.code,
      }),
      headers: { "Content-Type": "application/json" },
    }).then((data) => data.json());
  };

  const addWord = (word: string) => {
    return fetch("/api/languagetool/add", {
      method: "POST",
      body: JSON.stringify({
        word,
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then(() => {
        actions.showSnack("Word added to dictionary.");
      })
      .catch(() => {
        actions.showSnack("[Error] Can't add word to dictionary");
      });
  };

  const getLangs = () => {
    return fetch(`api/languagetool/languages`, {
      method: "GET",
    }).then((data) => {
      return data.json();
    });
  };

  return {
    getChecked,
    addWord,
    getLangs,
  };
};
