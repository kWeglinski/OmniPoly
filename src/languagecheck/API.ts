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
  const urlParams = new URLSearchParams(window.location.search);
  const languageCheckerUrl = urlParams.get("ltapi");

  const baseUrl =
    //@ts-expect-error: window
    languageCheckerUrl ?? window._lturl ?? "http://localhost:5000";

  const getChecked = (text: string) =>
    fetch(`${baseUrl}/v2/check`, {
      method: "POST",
      //@ts-expect-error: it's not void
      body: new FormData().append("text", text).append("language", "auto"),
      // No need to set Content-Type header manually for FormData
    }).then((data) => {
      return data.json();
    });

  return {
    getChecked,
  };
};
