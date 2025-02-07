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
    // const nCount = text.substring(0, offset).match(/\n/g)?.length ?? 0;
    const nCount = text.substring(0, offset).match(/\\[ntrvf]/g)?.length ?? 0;
    const nOffset = nCount;
    if (offset > lastIndex) {
      // Add the text before the current highlight
      renderedHighlights.push(text.substring(lastIndex, offset + nOffset));
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
        {text.substring(nOffset + offset, nOffset + offset + length)}
      </span>
    );
    renderedHighlights.push(highlightedText);

    // Update lastIndex to the end of the current highlight
    lastIndex = offset + length + nOffset;
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
          onChange={(e) => {
            //@ts-expect-error: event
            setQuestion(e.target.textContent);
          }}
          text={question}
          highlights={highlights?.matches || []}
          selection={selection}
          setSelection={setSelection}
        />
        <textarea
          placeholder="Your text here..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ position: "absolute", top: 0, left: 0 }}
          spellCheck="false"
        >
          {question}
        </textarea>
      </div>
    </>
  );
};
