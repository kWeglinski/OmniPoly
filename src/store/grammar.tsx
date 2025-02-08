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
};

export const useGrammar = create<Grammar>(() => ({
  loading: false,
  question: localStorage.getItem("question") ?? "",
  languages: [],
  language: getLang(),
  selection: null,
  answer: null,
  error: "",
}));

export const actions = {
  setQuestion: (text: Grammar["question"]) => {
    const standarisedQuestion = text.replace(/\t/g, "    ");
    localStorage.setItem("question", standarisedQuestion);
    useGrammar.setState({ question: standarisedQuestion });
  },
  setLoading: (loading: Grammar["loading"]) => {
    useGrammar.setState({ loading });
  },
  swapLangs: () => {
    useGrammar.setState({ loading: true });
  },
  setAnswer: (value: Grammar["answer"]) => {
    useGrammar.setState({
      answer: value,
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
};
