import { Chip } from "@mui/material";
import { useWindowSize } from "../common/useWindowSize";
import { Lang, LangChoice } from "./types";
import { actions } from "../store/translate";

export const PrevChoices = ({
  history,
  setState,
}: {
  history: Lang[];
  setState: typeof actions.setSource | typeof actions.setTarget;
}) => {
  const [windowWidth] = useWindowSize();
  if (windowWidth < 600) {
    return null;
  }
  return (
    <>
      {history
        .filter(
          (value, index, self) =>
            index === self.findIndex((obj) => obj.code === value.code) &&
            value.code !== "auto"
        )
        .slice(0, 3)
        .map((elem) => (
          <Chip
            key={elem.code}
            onClick={() => setState(elem as LangChoice)}
            label={elem.name}
          />
        ))}
    </>
  );
};
