import { useCallback, useEffect } from "react";
import "./App.css";
import { useDebounce } from "../common/useDebounce";
import { Settings } from "./Settings";
import { API } from "./API";
import { TransBox } from "./TransBox";
import {
  actions,
  useInitialiseTranslate,
  useTranslate,
} from "../store/translate";

function App() {
  useInitialiseTranslate();

  const { useAI, question, source, target } = useTranslate();
  const q = useDebounce(question, 1000) as string;

  const translate = useCallback(() => {
    const { source, target, question, useAI } = useTranslate.getState();
    if (!source || !target) {
      return;
    }
    actions.setLoading(true);
    const api = API();
    api[useAI ? "getOllamaTranslation" : "getTranslation"](
      source,
      target,
      question
    )
      .then((data) => {
        actions.setAnswer(data);
      })
      .finally(() => actions.setLoading(false));
  }, []);

  useEffect(() => {
    if (q.length > 1) {
      translate();
    }
  }, [q, source, target, translate, useAI]);

  return (
    <>
      <Settings />
      <TransBox />
    </>
  );
}

export default App;
