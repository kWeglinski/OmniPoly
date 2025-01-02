import { Divider, Stack } from "@mui/material";
import { Source } from "./Source";
import { Translation } from "./Translation";
import { useWindowSize } from "../common/useWindowSize";
import { AUTOMATIC } from "./utils";
import { Lang, LangChoice, TranslationResponse } from "./types";

export const TransBox = ({
  question,
  questionSetter,
  source,
  languages,
  answer,
}: {
  question: string;
  questionSetter: (q: string) => void;
  source: LangChoice;
  languages: Lang[];
  answer: TranslationResponse;
}) => {
  const [windowWidth] = useWindowSize();
  return (
    <Stack
      direction={windowWidth > 800 ? "row" : "column"}
      className="translation"
    >
      <div>
        <Source
          question={question}
          setQuestion={questionSetter}
          answer={
            source?.code === AUTOMATIC.code
              ? answer
              : { alternatives: [], translatedText: "" }
          }
          languages={languages}
        />
      </div>
      <Divider orientation="vertical" flexItem />
      <div style={{ position: "relative" }}>
        <Translation answer={answer} />
      </div>
    </Stack>
  );
};
