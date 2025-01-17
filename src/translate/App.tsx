import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { useDebounce } from "../common/useDebounce";
import { AUTOMATIC, getFromLS, justLangData, withHistory } from "./utils";
import { Settings } from "./Settings";
import { API } from "./API";
import { TransBox } from "./TransBox";
import { Lang, LangChoice, TranslationResponse } from "./types";

function App({ ollama }: { ollama: boolean }) {
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState(
    localStorage.getItem("question") ?? ""
  );
  const [answer, setAnswer] = useState<TranslationResponse>({
    translatedText: "",
    alternatives: [],
  });
  const q = useDebounce(question, 1000) as string;
  const [languages, setLanguages] = useState<Lang[]>([]);
  const [source, setSource] = useState(getFromLS("source"));
  const [target, setTarget] = useState(getFromLS("target"));
  const [useAI, setUseAi] = useState(false);

  const questionSetter = (q: string) => {
    localStorage.setItem("question", q);
    setQuestion(q);
  };

  const translate = useCallback(
    (source: LangChoice, target: LangChoice, text: string) => {
      if (!source || !target) {
        return;
      }
      setLoading(true);
      const api = API();
      api[useAI ? "getOllamaTranslation" : "getTranslation"](
        source,
        target,
        text
      )
        .then((data) => {
          setAnswer(data);
        })
        .finally(() => setLoading(false));
    },
    [useAI]
  );

  const getLanguages = useCallback(() => {
    API()
      .getLanguages()
      .then((data) => {
        setLanguages([...data, AUTOMATIC]);
        if (!source) {
          setSource(data[0]);
        }
        if (!target) {
          setTarget(data[0]);
        }
      });
  }, [source, target]);

  useEffect(() => {
    if (q.length > 1) {
      translate(source, target, q);
    }
  }, [q, source, target, translate, useAI]);

  useEffect(() => {
    if (languages.length < 1) {
      getLanguages();
    }
  }, [languages.length, getLanguages]);

  const swapLangs = (prevSource: LangChoice, prevTarget: LangChoice) => {
    if (prevSource.code === AUTOMATIC.code) {
      return;
    }
    withHistory("source", setSource)(justLangData(prevTarget));
    withHistory("target", setTarget)(justLangData(prevSource));
  };

  return (
    <>
      <Settings
        swapLangs={swapLangs}
        languages={languages}
        source={source}
        setSource={setSource}
        target={target}
        setTarget={setTarget}
        ollama={ollama}
        useAi={useAI}
        setUseAi={setUseAi}
      />

      <TransBox
        loading={loading}
        question={question}
        questionSetter={questionSetter}
        source={source}
        languages={languages}
        answer={answer}
      />
    </>
  );
}

export default App;
