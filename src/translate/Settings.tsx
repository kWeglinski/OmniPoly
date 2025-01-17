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
import { AUTOMATIC, withHistory } from "./utils";
import { SelectLanguage } from "../common/SelectLanguage";
import { PrevChoices } from "./PrevChoices";
import { Lang, LangChoice } from "./types";

export const Settings = ({
  languages,
  source,
  setSource,
  target,
  swapLangs,
  setTarget,
  useAi,
  setUseAi,
  ollama,
}: {
  languages: Lang[];
  source: LangChoice;
  setSource: React.Dispatch<React.SetStateAction<unknown>>;
  target: LangChoice;
  swapLangs: (source: LangChoice, target: LangChoice) => void;
  setTarget: React.Dispatch<React.SetStateAction<unknown>>;
  useAi: boolean;
  setUseAi: (val: boolean) => void;
  ollama: boolean;
}) => {
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
              checked={useAi}
              onChange={() => setUseAi(!useAi)}
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
            setValue={withHistory("source", setSource)}
            languages={languages}
          />
          {windowWidth > 600 && (
            <Chip
              variant="outlined"
              color="primary"
              onClick={() => withHistory("source", setSource)(AUTOMATIC)}
              label={AUTOMATIC.name}
            />
          )}
          <PrevChoices
            setState={withHistory("source", setSource)}
            history={source?.history ?? []}
          />
        </Stack>
        <div>
          <IconButton
            disabled={source.code === AUTOMATIC.code}
            onClick={() => swapLangs(source, target)}
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
            value={target}
            setValue={withHistory("target", setTarget)}
            languages={filteredTargets}
          />
          <PrevChoices
            setState={withHistory("target", setTarget)}
            history={target?.history ?? []}
          />
        </Stack>
      </div>
    </div>
  ) : (
    <Skeleton />
  );
};
