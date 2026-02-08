import { LangChoice } from "../translate/types";

export interface HarperResponse {
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
  [key: string]: unknown;
}

interface LanguageInfo {
  name: string;
  code: string;
  detectedLanguages: DetectedLanguage[];
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
    return fetch("/api/harper/check", {
      method: "POST",
      body: JSON.stringify({
        text,
        language: lang.longCode ?? lang.code,
      }),
      headers: { "Content-Type": "application/json" },
    }).then((data) => data.json());
  };

  const getLangs = () => {
    return fetch(`api/harper/languages`, {
      method: "GET",
    }).then((data) => data.json());
  };

  return {
    getChecked,
    getLangs,
  };
};
