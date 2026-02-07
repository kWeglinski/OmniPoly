import { create } from "zustand";
import {
  AUTOMATIC,
  getFromLS,
  justLangData,
  moveToTop,
} from "../translate/utils";
import { History, Lang, LangChoice } from "../translate/types";
import { useEffect } from "react";
import { API } from "../translate/API";
import { useShared, setQuestion } from "./shared";

export const useInitialiseTranslate = () => {
  useEffect(() => {
    const state = useTranslate.getState();
    API()
      .getLanguages()
      .then((data) => {
        const newState = {
          ...(!state.source ? { source: data[0] } : {}),
          ...(!state.target ? { target: data[0] } : {}),
          languages: [...data, AUTOMATIC],
        };
        useTranslate.setState(newState);
      });
  }, []);
};

// Subscribe to shared question changes
useShared.subscribe((state) => {
  useTranslate.setState({ question: state.question });
});

export const withHistory =
  (key: string, store: LangChoice) => (value: Lang) => {
    if (!value) {
      return;
    }
    const isAuto = value.code === AUTOMATIC.code;
    const history = isAuto
      ? (store?.history || []).slice(0, 3)
      : moveToTop(store?.history ?? [], value);

    const newValue: LangChoice = {
      ...(value as Lang),
      //@ts-expect-error: will resolve later
      history: history as unknown as History[],
    };

    localStorage.setItem(key, JSON.stringify(newValue));
    return newValue;
  };

export type Translate = {
  loading: boolean;
  question: string;
  answer: {
    translatedText: string;
    alternatives: string[];
  };
  languages: Lang[];
  source: LangChoice;
  target: LangChoice;
  useAI: boolean;
};

export const useTranslate = create<Translate>(() => ({
  loading: false,
  question: useShared.getState().question,
  answer: {
    translatedText: "",
    alternatives: [],
  },
  languages: [],
  source: getFromLS("source"),
  target: getFromLS("target"),
  useAI: false,
}));

export const actions = {
  setSource: (value: Translate["source"]) => {
    const state = useTranslate.getState();

    const source = withHistory("source", state.source)(justLangData(value));
    useTranslate.setState({ source });
  },
  setTarget: (value: Translate["target"]) => {
    const state = useTranslate.getState();
    const target = withHistory("target", state.target)(justLangData(value));
    useTranslate.setState({ target });
  },
  setUseAI: (val: boolean) => useTranslate.setState({ useAI: val }),
  setLoading: (loading: boolean) => useTranslate.setState({ loading }),
  setQuestion: (q: string) => {
    setQuestion(q);
    useTranslate.setState({ question: q });
  },
  setLanguages: (languages: Translate["languages"]) =>
    useTranslate.setState({ languages }),
  setAnswer: (answer: Translate["answer"]) => {
    useTranslate.setState({ answer });
  },
  swapLangs: () => {
    const { source: prevSource, target: prevTarget } = useTranslate.getState();
    if (prevSource.code === AUTOMATIC.code) {
      return;
    }
    const state = useTranslate.getState();

    const source = withHistory(
      "source",
      state.source
    )(justLangData(prevTarget));
    const target = withHistory(
      "target",
      state.target
    )(justLangData(prevSource));
    useTranslate.setState({ source, target });
  },
};
