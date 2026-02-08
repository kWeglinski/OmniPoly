import { create } from "zustand";
import { useEffect } from "react";
import { API, HarperResponse } from "../harper/API";
import { LangChoice } from "../translate/types";
import { useShared, setQuestion } from "./shared";

export const useInitialiseHarper = () => {
  useEffect(() => {
    API()
      .getLangs()
      .then((data) => {
        useHarper.setState({ languages: data });
      })
      .catch((e) => {
        console.error("[HARPER] Failed to load languages:", e);
      });
  }, []);
};

const autoLang = { name: "auto", code: "auto" };

const getLang = () => {
  const clang = localStorage.getItem("harper_lclang");
  return clang ? JSON.parse(clang) : autoLang;
};

type Harper = {
  loading: boolean;
  question: string;
  languages: LangChoice[];
  language: LangChoice;
  selection: number | null;
  answer: HarperResponse | null;
  error: string;
  touched: boolean;
};

export const useHarper = create<Harper>(() => ({
  loading: false,
  question: useShared.getState().question,
  languages: [],
  language: getLang(),
  selection: null,
  answer: null,
  error: "",
  touched: false,
}));

// Subscribe to shared question changes
useShared.subscribe((state) => {
  useHarper.setState({ question: state.question });
});

export const actions = {
  setQuestion: (text: Harper["question"]) => {
    const standarisedQuestion = text.replace(/\t/g, "    ");
    setQuestion(standarisedQuestion);
    useHarper.setState({ touched: true });
  },
  setTouched: (touched: Harper["touched"]) => {
    useHarper.setState({ touched });
  },
  setLoading: (loading: Harper["loading"]) => {
    useHarper.setState({ loading, answer: null });
  },
  swapLangs: () => {
    useHarper.setState({ loading: true });
  },
  setAnswer: (value: Harper["answer"]) => {
    useHarper.setState({
      answer: value,
      touched: false,
      loading: false,
      ...(value ? { error: "" } : {}),
    });
  },
  setLanguage: (value: Harper["language"]) => {
    localStorage.setItem("harper_lclang", JSON.stringify(value));
    useHarper.setState({ language: value });
  },
  setError: (error: Harper["error"]) => {
    useHarper.setState({ error, loading: false });
  },
  setSelection: (value: Harper["selection"]) => {
    useHarper.setState({ selection: value });
  },
  popAnswer: (idx: number) => {
    const { answer } = useHarper.getState();
    if (!answer) {
      return;
    }
    const newAnswer = {
      ...answer,
      matches: answer.matches.filter((_, i) => i !== idx),
    };
    useHarper.setState({ answer: newAnswer });
  },
  fixPos: (value: string, index: number) => {
    const { question, answer } = useHarper.getState();
    const match = answer?.matches[index];
    const offset = match?.offset || 0;
    const nCount =
      question.substring(0, offset).match(/\\[ntrvf]/g)?.length ?? 0;
    const start = offset + nCount;
    const fixed = `${question.substring(0, start)}${value}${question.substring(
      start + (match?.length || 0)
    )}`;
    actions.setQuestion(fixed);
    actions.popAnswer(index);
  },
};
