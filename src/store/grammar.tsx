import { create } from "zustand";
import { useEffect } from "react";
import { API, LanguageToolResponse } from "../languagecheck/API";
import { LangChoice } from "../translate/types";

export const useInitialiseGrammar = () => {
  useEffect(() => {
    API()
      .getLangs()
      .then((data) => {
        useGrammar.setState({ languages: data });
        //setstate
      });
  }, []);
};

const autoLang = { name: "auto", code: "auto" };

const getLang = () => {
  const clang = localStorage.getItem("lclang");
  return clang ? JSON.parse(clang) : autoLang;
};

type Grammar = {
  loading: boolean;
  question: string;
  languages: LangChoice[];
  language: LangChoice;
  selection: number | null;
  answer: LanguageToolResponse | null;
  error: string;
  touched: boolean;
};

export const useGrammar = create<Grammar>(() => ({
  loading: false,
  question: localStorage.getItem("question") ?? "",
  languages: [],
  language: getLang(),
  selection: null,
  answer: null,
  error: "",
  touched: false,
}));

export const actions = {
  setQuestion: (text: Grammar["question"]) => {
    const standarisedQuestion = text.replace(/\t/g, "    ");
    localStorage.setItem("question", standarisedQuestion);
    useGrammar.setState({ question: standarisedQuestion, touched: true });
  },
  setTouched: (touched: Grammar["touched"]) => {
    useGrammar.setState({ touched });
  },
  setLoading: (loading: Grammar["loading"]) => {
    useGrammar.setState({ loading, answer: null });
  },
  swapLangs: () => {
    useGrammar.setState({ loading: true });
  },
  setAnswer: (value: Grammar["answer"]) => {
    useGrammar.setState({
      answer: value,
      touched: false,
      loading: false,
      ...(value ? { error: "" } : {}),
    });
  },
  setLanguage: (value: Grammar["language"]) => {
    localStorage.setItem("lclang", JSON.stringify(value));
    useGrammar.setState({ language: value });
  },
  setError: (error: Grammar["error"]) => {
    useGrammar.setState({ error, loading: false });
  },
  setSelection: (value: Grammar["selection"]) => {
    useGrammar.setState({ selection: value });
  },
  popAnswer: (idx: number) => {
    const { answer } = useGrammar.getState();
    if (!answer) {
      return;
    }
    const newAnswer = {
      ...answer,
      matches: answer.matches.filter((_, i) => i !== idx),
    };
    useGrammar.setState({ answer: newAnswer });
  },
  fixPos: (value: string, index?: number) => {
    const { question, answer, selection } = useGrammar.getState();
    const target = index ?? selection;
    if (!answer || target === null) {
      return;
    }

    const match = answer.matches[target];
    if (!match) {
      return;
    }

    // Count newline-like characters (\n, \t, \r, \v, \f) before the offset
    const nCount =
      question.substring(0, match.context.offset).match(/\\[ntrvf]/g)?.length ??
      0;
    const adjustedStart = match.context.offset + nCount;

    // Apply the fix to the question text
    const fixedQuestion = `${question.substring(
      0,
      adjustedStart
    )}${value}${question.substring(adjustedStart + match.context.length)}`;

    // Update the state
    actions.setQuestion(fixedQuestion);
    actions.popAnswer(target);
  },
};
