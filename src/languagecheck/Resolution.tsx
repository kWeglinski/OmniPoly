import {
  Chip,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { LanguageToolResponse, Match } from "./API";

type Fix = (start: number, length: number, value: string, idx: number) => void;

const DisplayMatch = ({
  message,
  context,
  replacements,
  shortMessage,
  offset,
  length,
  fix,
  selected,
  setSelection,
  idx,
}: Match & {
  fix: Fix;
  selected: boolean;
  setSelection: () => void;
  idx: number;
}) => {
  return (
    <Accordion expanded={selected}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
        onClick={() => setSelection()}
      >
        <Typography component="span">
          {context.text.substr(context.offset, context.length)}
          {" - "}
          {shortMessage}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography
          gutterBottom
          sx={{ color: "text.secondary", fontSize: 14, fontStyle: "italic" }}
        >
          {context.text}
        </Typography>
        <Typography variant="body2">{message}</Typography>
        <Divider sx={{ mt: 2, mb: 2 }} />
        {replacements.map((repl: { value: string }) => (
          <Chip
            size="small"
            label={repl.value}
            onClick={() => fix(offset, length, repl.value, idx)}
            sx={{ marginRight: 1, marginBottom: 0.5, marginTop: 0.5 }}
          />
        ))}
      </AccordionDetails>
    </Accordion>
  );
};

export const Resolution = ({
  info,
  original,
  setQuestion,
  selection,
  setSelection,
  popAnswer,
}: {
  info: LanguageToolResponse | null;
  original: string;
  setQuestion: (t: string) => void;
  selection: number | null;
  setSelection: (i: number) => void;
  popAnswer: (i: number) => void;
}) => {
  if (!info) {
    return null;
  }
  const fix: Fix = (start, length, value, idx) => {
    const fixed = `${original.substring(0, start)}${value}${original.substring(
      start + length
    )}`;
    setQuestion(fixed);
    popAnswer(idx);
  };
  return (
    <div>
      {info.matches.map((data, i) => (
        <DisplayMatch
          key={i}
          {...data}
          fix={fix}
          selected={selection === i}
          setSelection={() => setSelection(i)}
          idx={i}
        />
      ))}
    </div>
  );
};
