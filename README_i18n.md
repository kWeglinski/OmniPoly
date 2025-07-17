# Internationalization (i18n) Implementation

This project uses `react-i18next` for internationalization, providing support for multiple languages.

## Directory Structure

```
public/
├── locales/                  # Locale files
│   ├── en/
│   │   └── translation.json
│   ├── es/
│   │   └── translation.json
│   └── fr/                   # Add more languages as needed
│       └── translation.json

src/
├── i18n/                     # i18n configuration
│   ├── i18n.ts               # Main i18n configuration
│   └── types.ts              # Type definitions for translations
```

## Configuration

### i18n.ts

The main i18n configuration file sets up the internationalization system:

```typescript
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

const i18n = i18next
  .use(Backend)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    backend: {
      loadPath: '/locales/{{lng}}/translation.json'
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

### types.ts

Type definitions for translation resources:

```typescript
export interface TranslationResources {
  language: string;
  welcome: string;
  settings: string;
  sourceLanguage: string;
  targetLanguage: string;
  translate: string;
  history: string;
}
```

## Locale Files

Locale files are JSON objects containing key-value pairs for translations:

```json
{
  "language": "Language",
  "welcome": "Welcome to our application!",
  "settings": "Settings",
  "sourceLanguage": "Source Language",
  "targetLanguage": "Target Language",
  "translate": "Translate",
  "history": "History"
}
```

## Component Integration

### LanguageSelector

The `LanguageSelector` component allows users to change the application language:

```typescript
import { useTranslation } from 'react-i18next';
// ... other imports

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
```

### SelectLanguage

The `SelectLanguage` component also supports translations:

```typescript
import { useTranslation } from 'react-i18next';
// ... other imports

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
  // ... existing code

  return (
    <Stack spacing={3} sx={{ width: windowWidth < 600 ? "100%" : 200 }}>
      <Autocomplete
        id="tags-standard"
        options={languages}
        size="small"
        getOptionLabel={(option) =>
          option.longCode ? `${t(option.name)} - ${option.longCode}` : t(option.name)
        }
        onChange={(e, value) => setValue(value)}
        value={value}
        renderInput={(params) => <TextField {...params} label={t(label || 'language')} />}
      />
    </Stack>
  );
};
```

## Build Process

### Vite Configuration

The Vite configuration includes settings for i18n:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    hmr: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
      }
    }
  },
  resolve: {
    alias: {
      '@i18n': '/src/i18n'
    }
  },
  assetsInclude: ['**/locales/**']
});
```

### Package.json Scripts

Added script for string extraction:

```json
"scripts": {
  "dev": "concurrently \"npm run node\" \"vite\"",
  "build": "tsc && vite build",
  "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
  "preview": "vite preview",
  "node": "nodemon --env-file=.env index.js",
  "test": "echo \"No tests available yet.\"",
  "extract-i18n": "i18next-scanner --config i18next-scanner.config.js"
}
```

## String Extraction

### i18next-scanner Configuration

The scanner helps identify all translatable strings in the codebase:

```javascript
module.exports = {
  input: [
    'src/**/*.{js,ts,tsx}',
    '!src/i18n/**', // Ignore i18n config files
    '!**/node_modules/**'
  ],
  output: './',
  options: {
    debug: true,
    func: {
      list: ['t', 'i18n.t'],
      extensions: ['.js', '.ts', '.tsx']
    },
    trans: false,
    img: false,
    lvl: 99
  }
};
```

## Usage

1. **Add New Translations**: Update the locale JSON files with new translation keys
2. **Use in Components**: Import `useTranslation` and use the `t()` function to wrap translatable strings
3. **Extract Strings**: Run `npm run extract-i18n` to identify all translatable content
4. **Test Translations**: Change languages using the LanguageSelector component

## Best Practices

- Use consistent naming conventions for translation keys
- Group related strings logically within locale files
- Keep a reference of all used keys to avoid duplicates
- Test translations in different languages regularly

This i18n implementation provides a solid foundation for multilingual support while maintaining code quality and performance.