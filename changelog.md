### 0.10.0 

- Added clear button to clear text boxes
- Updated development setup for ease of use
- Added auto full display alternative for shorter translations
- Added option to add words to dictionary for grammar checks

### 0.9.0

- State migrated from context to Zustand
- Improvements in AI translation prompt
- Added copy button for grammar checking
- Added SnackBar to inform of action sucess

### 0.8.0

- Added `LIBRETRANSLATE_LANGUAGES` and `LANGUAGE_TOOL_LANGUAGES` env variables to specify supported languages for LibreTranslate and LanguageTool respectively.

### 0.7.0

- Docker tagged releases

### 0.6.1

- Fix: silly mistake, added check on string masking

### 0.6.0

- Added `LIBRETRANSLATE_API_KEY` env variable to support API key authentication for LibreTranslate. [#3](https://github.com/kWeglinski/OmniPoly/issues/3)
- Fixed theme setting [#2](https://github.com/kWeglinski/OmniPoly/issues/2)

### 0.5.1

- Prevent crash on no language selected in language tool.