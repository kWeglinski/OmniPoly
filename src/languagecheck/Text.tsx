import styled from "styled-components";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import { actions, useGrammar } from "../store/grammar";
import { IconButton, Tooltip } from "@mui/material";
import { copyToClipboard } from "../common/utils";

const HighlightText = () => {
  const { selection, question: text, answer, touched, loading } = useGrammar();
  if (loading || touched) {
    return;
  }
  const highlights = answer?.matches || [];
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
      <>
        <span
          key={i}
          style={{
            position: "relative",
          }}
          onClick={() => actions.setSelection(i)}
        >
          <div
            key={i}
            style={{
              background:
                selection === i ? "rgba(255,0,0,1)" : "rgba(255,0,0,0.5",
              position: "absolute",
              zIndex: selection === i ? 0 : 900,
              color: "#fff",
              left: 0,
              top: 0,
              borderRadius: "4px",
              cursor: 'pointer'
            }}
            contentEditable="false"
            onClick={() => actions.setSelection(i)}
          >
            {text.substring(nOffset + offset, nOffset + offset + length)}
          </div>
          {text.substring(nOffset + offset, nOffset + offset + length)}
        </span>
      </>
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
    <div
      className="textarea"
      contentEditable
      onInput={(e) => {
        //@ts-expect-error: event type
        actions.setQuestion(e.target.textContent);
      }}
    >
      {renderedHighlights}
    </div>
  );
};

const IconContainer = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 1;
`;

export const TextBox = () => {
  const { question } = useGrammar();

  return (
    <>
      <div className="autosize" data-replicated-value={question}>
        <IconContainer>
          <Tooltip title="Clear text">
            <IconButton
              onClick={() => actions.setQuestion("")}
              aria-label="clear"
              size="small"
            >
              <ClearRoundedIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy text">
            <IconButton
              onClick={() => copyToClipboard(question)}
              aria-label="copy"
              size="small"
            >
              <ContentCopyRoundedIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </IconContainer>
        <HighlightText />
        <textarea
          placeholder="Your text here..."
          value={question}
          onChange={(e) => actions.setQuestion(e.target.value)}
          style={{ position: "absolute", top: 0, left: 0 }}
          spellCheck="false"
        >
          {question}
        </textarea>
      </div>
    </>
  );
};
