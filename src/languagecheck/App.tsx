import { useCallback, useEffect, useState } from "react";
import { Divider, Stack } from "@mui/material";
import "./App.css";
import { useDebounce } from "../common/useDebounce";
import { TextBox } from "./Text";
import { useWindowSize } from "../common/useWindowSize";
import { API, LanguageToolResponse } from "./API";
import { Resolution } from "./Resolution";

function App() {
  const [question, setQuestion] = useState(
    localStorage.getItem("question") ?? ""
  );
  const [selection, setSelection] = useState<number | null>(null);
  const [answer, setAnswer] = useState<LanguageToolResponse | null>(null);
  const q = useDebounce(question, 1000) as string;

  const questionSetter = useCallback((text: string) => {
    const standarisedQuestion = text.replace(/\t/g, "    ");
    localStorage.setItem("question", standarisedQuestion);
    setQuestion(standarisedQuestion);
  }, []);
  const check = useCallback((text: string) => {
    if (!text) {
      return;
    }
    API()
      .getChecked(text)
      .then((data) => {
        console.log({ data });
        setAnswer(data);
      })
      .catch((e) => console.log({ e }));
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

  // const addWord = useCallback((word: string) => {
  //   API()
  //     .addToDict(word)
  //     .then(() => {
  //       check(q);
  //     });
  // }, []);

  useEffect(() => {
    if (q.length > 1) {
      check(q);
      // translate(source, target, q);
    }
  }, [q, check]);

  const [windowWidth] = useWindowSize();

  return (
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
          selection={selection}
          setSelection={setSelection}
          info={answer}
          original={q}
          setQuestion={questionSetter}
          popAnswer={popAnswer}
        />
      </div>
    </Stack>
  );
}

export default App;
