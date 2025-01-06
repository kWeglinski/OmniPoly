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
  const urlParams = new URLSearchParams(window.location.search);
  const languageCheckerUrl = urlParams.get("ltapi");

  const baseUrl =
    //@ts-expect-error: window
    languageCheckerUrl ?? window._lturl ?? "http://localhost:5000";

  const getChecked = (text: string, lang: LangChoice) => {
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    };

    const formData = new URLSearchParams();
    formData.append("text", text);
    formData.append("language", lang.longCode ?? lang.code);
    return fetch(`${baseUrl}/v2/check`, {
      method: "POST",
      headers: headers,
      body: formData.toString(),
    }).then((data) => {
      return data.json();
    });
  };

  const addToDict = (word: string) => {
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    };

    // Define the form data
    const formData = new URLSearchParams();
    formData.append("word", word);
    formData.append("username", "test");

    // Make the POST request using fetch
    fetch(`${baseUrl}/v2/words/add`, {
      method: "POST",
      headers: headers,
      body: formData.toString(),
    })
      .then((response) => response.json()) // Parse the JSON response
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  // fetch(`${baseUrl}/v2/words/add?word=${fixedEncodeURIComponent(word)}`, {
  //   method: "POST",
  // }).then(() => {});

  const getLangs = () => {
    return fetch(`${baseUrl}/v2/languages`, {
      method: "GET",
    }).then((data) => {
      return data.json();
    });
  };

  return {
    getChecked,
    addToDict,
    getLangs
  };
};
