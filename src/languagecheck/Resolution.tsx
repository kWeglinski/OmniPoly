import {
  Chip,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  Stack,
  Button,
} from "@mui/material";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import CheckIcon from "@mui/icons-material/Check";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { API, Match } from "./API";
import { actions, useGrammar } from "../store/grammar";
import { useSystemStatus } from "../store/status";

const DisplayMatch = ({
  message,
  context,
  replacements,
  shortMessage,
  selected,
  setSelection,
  idx,
  rule,
}: Match & {
  selected: boolean;
  setSelection: () => void;
  idx: number;
}) => {
  const { disableDictionary } = useSystemStatus();
  
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
            key={repl.value}
            size="small"
            label={repl.value}
            onClick={() => {
              actions.fixPos(repl.value, idx)
            }}
            sx={{ marginRight: 1, marginBottom: 0.5, marginTop: 0.5 }}
          />
        ))}
        {!disableDictionary && rule.category.id === "TYPOS" && (
          <>
            <Divider sx={{ mt: 2, mb: 2 }} />
            <Stack sx={{ justifyContent: "center", alignItems: "center" }}>
              <Button
                startIcon={<LibraryBooksOutlinedIcon />}
                size="small"
                variant="outlined"
                sx={{ margin: "auto" }}
                onClick={() => {
                  API().addWord(
                    context.text.substr(context.offset, context.length)
                  );
                }}
              >
                Add To Dictionary
              </Button>
            </Stack>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export const Resolution = () => {
  const {
    loading,
    error,
    selection,
    answer: info,
  } = useGrammar();
  if (loading) {
    return (
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
    );
  }
  return (
    <div style={{ paddingTop: "20px" }}>
      {error?.length > 0 && (
        <Alert icon={<ErrorOutlineIcon fontSize="inherit" />} severity="error">
          {error}
        </Alert>
      )}
      {info?.matches?.length === 0 && (
        <Alert icon={<CheckIcon fontSize="inherit" />} severity="success">
          All good!
        </Alert>
      )}
      {info?.matches?.map((data, i) => (
        <DisplayMatch
          key={i}
          {...data}
          selected={selection === i}
          setSelection={() => actions.setSelection(i)}
          idx={i}
        />
      ))}
    </div>
  );
};
