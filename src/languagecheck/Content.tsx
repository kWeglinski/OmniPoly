import { RichTextarea } from "rich-textarea";
import { actions, useGrammar } from "../store/grammar";
import { Options } from "./Options";

const HighlightText = () => {
  const { selection, answer, question: text } = useGrammar();
  const highlights = answer?.matches || [];
  let lastIndex = 0;
  const renderedHighlights = [];
  let counter = 0;

  for (let i = 0; i < highlights.length; i++) {
    const { offset, length, replacements } = highlights[i];
    const nCount = text.substring(0, offset).match(/\\[ntrvf]/g)?.length ?? 0;
    const nOffset = nCount;
    if (offset > lastIndex) {
      // Add the text before the current highlight
      renderedHighlights.push(
        <span key={counter}>{text.substring(lastIndex, offset + nOffset)}</span>
      );
      counter = counter + 1;
    }

    renderedHighlights.push(
      <Options
        key={counter}
        replacements={replacements}
        isSelected={selection === i}
        text={text.substring(nOffset + offset, nOffset + offset + length)}
        context={highlights[i]}
        index={i}
      />
    );
    counter = counter + 1;

    // Update lastIndex to the end of the current highlight
    lastIndex = offset + length + nOffset;
  }

  // Add any remaining text after the last highlight
  if (lastIndex < text.length) {
    renderedHighlights.push(
      <span key={counter}>{text.substring(lastIndex)}</span>
    );
    counter = counter + 1;
  }
  return <div>{renderedHighlights}</div>;
};

export const Content = () => {
  const { question } = useGrammar();

  return (
    <RichTextarea
      value={question}
      style={{ width: "600px", height: "400px" }}
      onChange={(e) => actions.setQuestion(e.target.value)}
    >
      {() => <HighlightText />}
    </RichTextarea>
  );
};
