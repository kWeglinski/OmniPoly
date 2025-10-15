import { useCallback, useEffect } from "react";
import { Autocomplete, Divider, Stack, TextField } from "@mui/material";
import "./App.css";
import { useDebounce } from "../common/useDebounce";
import { useWindowSize } from "../common/useWindowSize";
import { API } from "./API";
import { Resolution } from "./Resolution";
import { LangChoice } from "../translate/types";
import { actions, useGrammar, useInitialiseGrammar } from "../store/grammar";
import { Content } from "./Content";

export const SelectLanguage = ({ label }: { label?: string }) => {
  const { languages, language } = useGrammar();
  const [windowWidth] = useWindowSize();
  if (!languages) {
    return null;
  }

  return (
    <Stack spacing={3} sx={{ width: windowWidth < 600 ? "100%" : 200 }}>
      <Autocomplete
        id="tags-standard"
        options={languages}
        size="small"
        getOptionLabel={(option) =>
          option.longCode ? `${option.name} - ${option.longCode}` : option.name
        }
        //@ts-expect-error: this is fine for now
        onChange={(e, value) => actions.setLanguage(value)}
        value={language}
        renderInput={(params) => <TextField {...params} label={label} />}
      />
    </Stack>
  );
};

function App() {
  useInitialiseGrammar();
  const { question, language } = useGrammar();
  const q = useDebounce(question, 1000) as string;

  const check = useCallback((text: string, language: LangChoice) => {
    console.log("check");
    if (!text) {
      return;
    }
    actions.setLoading(true);
    API()
      .getChecked(text, language)
      .then((data) => {
        actions.setAnswer(data);
      })
      .catch((e) => actions.setError(e.message));
  }, [actions, API]);

  useEffect(() => {
    if (q.length > 1 && language) {
      check(q, language);
    }
  }, [q, check, language]);

  const [windowWidth] = useWindowSize();

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <SelectLanguage label="language" />
      </div>
      <Stack
        direction={windowWidth > 800 ? "row" : "column"}
        className="translation"
      >
        <div>
          <Content />
        </div>
        <Divider orientation="vertical" flexItem />
        <div style={{ position: "relative" }}>
          <Resolution />
        </div>
      </Stack>
    </>
  );
}

export default App;
