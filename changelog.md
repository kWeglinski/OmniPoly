### 0.14.3

- Fix: during the creation of improved fix tooltip I've introduced a bug that completely broke position where text is fixed. This is fixed now. 
- Feat: added picky level in language tool (use an ENV to enable it)
- Feat: added DEBUG mode to log all requests

### 0.14.2

- Chore: suggest different backend for languagetool. Apparently the one in readme wasn't the best.

### 0.14.1

- Fix: when user wanted to use only libretranslate the whole app crashed due to invalid tab choices.

### 0.14.0

- Fix: enforce font color (chrome bug) on text-area, based on theme. No more dark text on dark bg
- Feat: moved to rich-textarea library to not re-invent the wheel on text area styling.
    This also allowed:
    - Better styling for error highliht
    - Additional tooltip with quick peek of the issue and and quick (up to 4) click to fix resolutions (sidebar gives more options if language tool provides)

### 0.12.0

- Introduced a new environment variable `DISABLE_DICTIONARY`. When this variable is set to true, the functionality for adding words to the dictionary is disabled.
- **Enhanced Text Interaction:** In the language tool, highlighted text segments are now interactive. Clicking on these segments opens sidebar suggestion.
- **Improved Editing Experience:** During the editing process in the language tool, the highlight automatically disappears as it becomes invalid once modifications have been initiated.

### 0.11.0 

- chore: Added nightly builds on develop branch
- secops: dependabot - bump vite to 6 (resolves 6 dependabot warnings)
- chore: Github actions updated to create github release and tags 
- chore: added PR validation GH action
- feature: file upload
- feature: download translation as a file
- feature: tooltips all around

### 0.10.4

- fix: z-index

### 0.10.3

- dockerfile fix

### 0.10.1

- dockerfile fix

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