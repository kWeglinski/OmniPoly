import { useCallback, useEffect, useState } from "react";
import { Divider, Stack } from "@mui/material";
import "./App.css";
import { useDebounce } from "../common/useDebounce";
import { TextBox } from "./Text";
import { useWindowSize } from "../common/useWindowSize";
import { API, LanguageToolResponse } from "./API";
import { Resolution } from "./Resolution";
import { SelectLanguage } from "../common/SelectLanguage";
import { LangChoice } from "../translate/types";

const autoLang = { name: "auto", code: "auto" };

function App() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState(
    localStorage.getItem("question") ?? ""
  );
  const [languages, setLanguages] = useState<LangChoice[]>([]);
  const clang = localStorage.getItem("lclang");
  const [language, setLanguage] = useState(
    clang ? JSON.parse(clang) : autoLang
  );
  const [selection, setSelection] = useState<number | null>(null);
  const [answer, setAnswer] = useState<LanguageToolResponse | null>(null);
  const q = useDebounce(question, 1000) as string;

  useEffect(() => {
    API()
      .getLangs()
      .then((data) => {
        setLanguages([autoLang, ...data]);
      });
  }, []);

  const questionSetter = useCallback((text: string) => {
    const standarisedQuestion = text.replace(/\t/g, "    ");
    localStorage.setItem("question", standarisedQuestion);
    setQuestion(standarisedQuestion);
  }, []);

  const check = useCallback((text: string, language: LangChoice) => {
    if (!text) {
      return;
    }
    setLoading(true);
    API()
      .getChecked(text, language)
      .then((data) => {
        setAnswer(data);
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const popAnswer = (idx: number) => {
    if (!answer) {
      return;
    }
    const newAnswer = {
      ...answer,
      matches: answer.matches.filter((_, i) => i !== idx),
    };
    setAnswer(newAnswer);
  };

  const langSetter = (lang: LangChoice) => {
    setLanguage(lang);
    localStorage.setItem("lclang", JSON.stringify(lang));
  };

  // const addWord = useCallback((word: string) => {
  //   API()
  //     .addToDict(word)
  //     .then(() => {
  //       check(q);
  //     });
  // }, []);

  useEffect(() => {
    if (q.length > 1 && language) {
      check(q, language);
    }
  }, [q, check, language]);

  const [windowWidth] = useWindowSize();

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <SelectLanguage
          label="language"
          languages={languages}
          setValue={langSetter}
          value={language}
        />
      </div>
      <Stack
        direction={windowWidth > 800 ? "row" : "column"}
        className="translation"
      >
        <div>
          <TextBox
            question={question}
            setQuestion={questionSetter}
            highlights={answer}
            selection={selection}
            setSelection={setSelection}
          />
        </div>
        <Divider orientation="vertical" flexItem />
        <div style={{ position: "relative" }}>
          <Resolution
            // addWord={addWord}
            error={error}
            loading={loading}
            selection={selection}
            setSelection={setSelection}
            info={answer}
            original={q}
            setQuestion={questionSetter}
            popAnswer={popAnswer}
          />
        </div>
      </Stack>
    </>
  );
}

export default App;
