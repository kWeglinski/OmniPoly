import { Chip, IconButton } from "@mui/material";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import { Lang, TranslationResponse } from "./types";
import styled from "styled-components";

const IconContainer = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 1;
`;

export const Source = ({
  question,
  setQuestion,
  answer,
  languages,
}: {
  question: string;
  setQuestion: (q: string) => void;
  answer: TranslationResponse;
  languages: Lang[];
}) => {
  const hasDl = answer.detectedLanguage;
  const dl =
    languages &&
    hasDl &&
    languages.find(
      (lang: Lang) => lang.code === answer?.detectedLanguage?.language
    );

  return (
    <>
      <div className="autosize" data-replicated-value={question}>
        <IconContainer>
          <IconButton
            onClick={() => setQuestion('')}
            aria-label="copy"
            size="small"
          >
            <ClearRoundedIcon fontSize="inherit" />
          </IconButton>
        </IconContainer>
        <textarea
          placeholder="Your text here..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        >
          {question}
        </textarea>
      </div>
      {hasDl && dl && <Chip label={`detected: ${dl.name}`} />}
    </>
  );
};
