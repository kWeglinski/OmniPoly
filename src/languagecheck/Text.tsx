import { LanguageToolResponse, Match } from "./API";

const HighlightText = ({
  text,
  highlights,
  onChange,
  setSelection,
  selection,
}: {
  text: string;
  highlights: Match[];
  onChange: (t: string) => void;
  setSelection: (i: number) => void;
  selection: number | null;
}) => {
  let lastIndex = 0;
  const renderedHighlights = [];

  for (let i = 0; i < highlights.length; i++) {
    const { offset, length } = highlights[i];

    if (offset > lastIndex) {
      // Add the text before the current highlight
      renderedHighlights.push(text.substring(lastIndex, offset));
    }

    // Wrap the highlighted segment with a <span> tag
    const highlightedText = (
      <span
        key={i}
        style={{
          background: selection === i ? "rgba(255,0,0,1)" : "rgba(255,0,0,0.5",
        }}
        onClick={() => setSelection(i)}
      >
        {text.substring(offset, offset + length)}
      </span>
    );
    renderedHighlights.push(highlightedText);

    // Update lastIndex to the end of the current highlight
    lastIndex = offset + length;
  }

  // Add any remaining text after the last highlight
  if (lastIndex < text.length) {
    renderedHighlights.push(text.substring(lastIndex));
  }

  return (
    //@ts-expect-error: event
    <div className="textarea" contentEditable onInput={onChange}>
      {renderedHighlights}
    </div>
  );
};

export const TextBox = ({
  question,
  setQuestion,
  highlights,
  selection,
  setSelection,
}: {
  highlights: LanguageToolResponse | null;
  question: string;
  setQuestion: (q: string) => void;
  selection: number | null;
  setSelection: (i: number) => void;
}) => {
  return (
    <>
      <div className="autosize" data-replicated-value={question}>
        <HighlightText
          //@ts-expect-error: event
          onChange={(e) => setQuestion(e.target.textContent)}
          text={question}
          highlights={highlights?.matches || []}
          selection={selection}
          setSelection={setSelection}
        />
      </div>
    </>
  );
};
