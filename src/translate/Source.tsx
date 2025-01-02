import { Chip } from "@mui/material";
import { Lang, TranslationResponse } from "./types";

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
