import { useTranslation } from 'react-i18next';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { LIBRETRANSLATE_LANGUAGES } from '../config';

export const LanguageSelector = () => {
  const { t, i18n } = useTranslation();

  const handleChange = (event: SelectChangeEvent) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <FormControl fullWidth size="small" sx={{ minWidth: 120 }}>
      <InputLabel>{t('language')}</InputLabel>
      <Select
        value={i18n.language}
        label={t('language')}
        onChange={handleChange}
      >
        {LIBRETRANSLATE_LANGUAGES?.map((lang) => (
          <MenuItem key={lang.code} value={lang.code}>
            {t(lang.name)}  {/* Translate language names */}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};