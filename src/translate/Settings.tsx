import {
  Chip,
  FormControlLabel,
  IconButton,
  Skeleton,
  Stack,
  Switch,
} from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { useWindowSize } from "../common/useWindowSize";
import { AUTOMATIC } from "./utils";
import {
  SelectLanguage,
} from "../common/SelectLanguage";
import { PrevChoices } from "./PrevChoices";
import { actions, useTranslate } from "../store/translate";
import { useSystemStatus } from "../store/status";
import { LangChoice } from "./types";

export const Settings = () => {
  const { source, target, languages, useAI } = useTranslate();
  const ollama = useSystemStatus((store) => store.ollama);
  const targets =
    source.code === AUTOMATIC.code
      ? languages.map((lang) => lang.code)
      : languages.find((lang) => lang.code === source.code)?.targets;

  const filteredTargets = targets
    ? languages.filter((lang) => targets.includes(lang.code))
    : languages;
  const [windowWidth] = useWindowSize();
  const langLoaded = languages.length > 0;

  return langLoaded ? (
    <div>
      {ollama && (
        <FormControlLabel
          sx={{ float: "right" }}
          control={
            <Switch
              checked={useAI}
              onChange={() => actions.setUseAI(!useAI)}
              size="small"
            />
          }
          label={
            <Stack
              direction="row"
              sx={{ justifyContent: "center", alignItems: "center" }}
            >
              <span style={{ fontSize: "12px" }}>AI</span>
            </Stack>
          }
        />
      )}
      <div className="settings">
        <Stack
          direction={windowWidth > 800 ? "row" : "column"}
          style={{ flex: 1 }}
          spacing={1}
          alignItems="center"
        >
          <SelectLanguage
            value={source}
            setValue={actions.setSource}
            languages={languages}
          />
          {windowWidth > 600 && (
            <Chip
              variant="outlined"
              color="primary"
              onClick={() => actions.setSource(AUTOMATIC as LangChoice)}
              label={AUTOMATIC.name}
            />
          )}
          <PrevChoices
            setState={actions.setSource}
            history={source?.history ?? []}
          />
        </Stack>
        <div>
          <IconButton
            disabled={source.code === AUTOMATIC.code}
            onClick={() => actions.swapLangs()}
          >
            <SwapHorizIcon />
          </IconButton>
        </div>
        <Stack
          style={{ flex: 1 }}
          spacing={1}
          direction={windowWidth > 800 ? "row" : "column"}
          alignItems="center"
        >
          <SelectLanguage
            value={target as LangChoice}
            setValue={actions.setTarget}
            languages={filteredTargets}
          />
          <PrevChoices
            setState={actions.setTarget}
            history={target?.history ?? []}
          />
        </Stack>
      </div>
    </div>
  ) : (
    <Skeleton />
  );
};
