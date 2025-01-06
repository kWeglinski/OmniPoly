import { CircularProgress, Divider, Stack } from "@mui/material";
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
  loading,
}: {
  loading: boolean;
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
        {loading ? (
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress size="3rem" />
          </div>
        ) : (
          <Translation answer={answer} />
        )}
      </div>
    </Stack>
  );
};
