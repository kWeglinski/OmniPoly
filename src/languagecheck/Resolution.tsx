import {
  Chip,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
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
  // addWord,
  original,
}: Match & {
  fix: Fix;
  selected: boolean;
  setSelection: () => void;
  idx: number;
  original: string;
}) => {
  const fixPos = (value: string) => {
    const nCount = original.substring(0, offset).match(/\n/g)?.length ?? 0;
    fix(offset + nCount, length, value, idx);
  };
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
            onClick={() => fixPos(repl.value)}
            sx={{ marginRight: 1, marginBottom: 0.5, marginTop: 0.5 }}
          />
        ))}
        {/* {rule.category.id === "TYPOS" && (
          <>
            <Divider sx={{ mt: 2, mb: 2 }} />
            <Stack sx={{ justifyContent: "center", alignItems: "center" }}>
              <Button
                startIcon={<LibraryBooksOutlinedIcon />}
                size="small"
                variant="outlined"
                sx={{ margin: "auto" }}
                onClick={() =>
                  addWord(context.text.substr(context.offset, context.length))
                }
              >
                Add To Dictionary
              </Button>
            </Stack>
          </>
        )} */}
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
  // addWord,
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
      {info.matches.length === 0 && (
        <Alert icon={<CheckIcon fontSize="inherit" />} severity="success">
          All good!
        </Alert>
      )}
      {info.matches.map((data, i) => (
        <DisplayMatch
          key={i}
          {...data}
          fix={fix}
          selected={selection === i}
          setSelection={() => setSelection(i)}
          idx={i}
          original={original}
          // addWord={addWord}
        />
      ))}
    </div>
  );
};
