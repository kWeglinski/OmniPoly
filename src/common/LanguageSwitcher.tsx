




import { useTranslation } from 'react-i18next';
import { MenuItem, Select, FormControl, InputLabel, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [preloading, setPreloading] = useState(true);

  const handleChange = async (event: any) => {
    const lang = event.target.value;
    setLoading(true);
    try {
      await i18n.changeLanguage(lang);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Preload translations for all available languages
    const preloadTranslations = async () => {
      const availableLangs = ['en', 'es']; // Add more languages as needed
      for (const lang of availableLangs) {
        if (lang !== i18n.language) {
          await fetch(`/api/translations/${lang}`);
        }
      }
      setPreloading(false);
    };
    preloadTranslations();
  }, [i18n.language]);

  if (preloading) {
    return <CircularProgress size={24} />;
  }

  return (
    <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
      <InputLabel id="language-select-label">{t('languageSwitcher.label')}</InputLabel>
      <Select
        labelId="language-select-label"
        id="language-select"
        value={i18n.language}
        onChange={handleChange}
        label={t('languageSwitcher.label')}
        disabled={loading}
      >
        <MenuItem value={'en'}>{t('languageSwitcher.english')}</MenuItem>
        <MenuItem value={'es'}>{t('languageSwitcher.spanish')}</MenuItem>
      </Select>
    </FormControl>
  );
};




