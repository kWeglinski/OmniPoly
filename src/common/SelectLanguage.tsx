import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { useWindowSize } from "./useWindowSize";
import { Lang, LangChoice } from "../translate/types";
import { useTranslation } from 'react-i18next';

export const SelectLanguage = ({
  languages,
  value,
  setValue,
  label,
}: {
  languages: Lang[];
  value: LangChoice;
  setValue: (value: LangChoice) => void;
  label?: string;
}) => {
  const { t } = useTranslation();
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
          option.longCode ? `${t(option.name)} - ${option.longCode}` : t(option.name)
        }
        //@ts-expect-error: this is fine for now
        onChange={(e, value) => setValue(value)}
        value={value}
        renderInput={(params) => <TextField {...params} label={t(label || 'language')} />}
      />
    </Stack>
  );
};