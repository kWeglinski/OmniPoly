import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { useWindowSize } from "./useWindowSize";
import { Lang, LangChoice } from "../translate/types";

export const SelectLanguage = ({
  languages,
  value,
  setValue,
}: {
  languages: Lang[];
  value: LangChoice;
  setValue: (value: LangChoice) => void;
}) => {
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
        onChange={(e, value) => setValue(value)}
        value={value}
        renderInput={(params) => <TextField {...params} />}
      />
    </Stack>
  );
};
