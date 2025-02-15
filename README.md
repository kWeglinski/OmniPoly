# Latest Features:

- Added ability to upload files for translation
- Added ability to download translations
- Added clear button to clear text boxes
- Added auto full display alternative for shorter translations
- Added option to add words to dictionary for grammar checks
- Added language filters
- Support for language tool
- Ollama for translation and interesting sentences extraction

# OmniPoly

Welcome to a solution for translation and language enhancement tool. This project integrates Libre Translate for accurate translations, LanguageTool for grammar and style checks, and AI Translation for modern touch of sentiment analysis and interesting sentences extraction.

Key features include:
- Translation: Text translation across multiple languages (see: [libretranslate](https://github.com/LibreTranslate/LibreTranslate)).
- Grammar Checking: Ensures your text is not only translated but also reads well with proper grammar and style (see: [languagetool](https://github.com/languagetool-org/languagetool)).
- AI-Powered Insights: Utilizes Large Language Models to analyze sentiments and extract interesting sentences, adding depth to your translations (see: [ollama](https://github.com/ollama/ollama)).

The project started with the fact that I didn't like the standard app coming with Libre Translate (i.e. it didn't remember my previous choices). So I've decided to make my own. Eventually I've found out about self-hosted LanguageTool, and then I've learned that it does not have any frontend...

<p align="center">
  <img src="docs/screenshot.png" alt="pole_translate" align="center">
</p>

<p align="center">
  <img src="docs/with_errors.png" alt="pole_translate" align="center">
</p>
<p align="center">
  <img src="docs/without_errors.png" alt="pole_translate" align="center">
</p>

## How to run: Docker

The most recommended way to start it up is to use Docker.

Here's a sample docker compose:

```
  OmniPoly:
    restart: unless-stopped
    environment:
      LANGUAGE_TOOL: https://your.languagetool.instance
      LIBRETRANSLATE: https://your.libretranslate.instance
      LIBRETRANSLATE_API_KEY: 'your_API_key' # use if your instance requires API key.
      OLLAMA: https://your.ollama.instance
      OLLAMA_MODEL: model_name
      # pick one of: 'pole' | 'light' | 'dark' 
      THEME: 'dark'
      # To limit language options for translations provide an array of ISO 639 language codes
      LIBRETRANSLATE_LANGUAGES=["pl","en"] # optional
      # To limit language options for text check provide an array of long tags (ISO 639/ISO-3166) also known as language-Region code.
      LANGUAGE_TOOL_LANGUAGES=["pl-PL","en-GB"] # optional
    ports:
      - 80:80
    image: kweg/omnipoly:latest
```

### Disabling Specific Systems

If you prefer not to use any of the following systems—AI, LanguageTool, or LibreTranslate—for any reason, you can easily disable them by omitting their respective environment variables during configuration.

The project is designed in such a way that it will not display features that are unconfigured. This means if an environment variable for a particular system is not provided, the corresponding feature will be automatically hidden from view and will not be available for use.

### On running backends

#### Libre translate

```
services:
  libretranslate:
    tty: true
    stdin_open: true
    ports:
      - PORT:5000
    environment:
      - host=your.libretranslate.instance
    image: libretranslate/libretranslate
```

#### Language tool

```
services:
  languagetool:
      restart: unless-stopped
      image: elestio/languagetool:latest
      ports:
      - PORT:8010
      environment:
      - langtool_languageModel=/ngrams
      - Java_Xms=512m
      - Java_Xmx=1g
      volumes:
        - ~/ngramsDir:/ngrams
```

# Running and building locally

- Copy `.env.sample` as `.env`
- Fill in all fields and add `DEV=true`
- `npm i`
- `npm run dev`
- voila! the app should be served at localhost:80

# Roadmap:

- Text workflow - The goal is to have a feeling of single text input across all modules. So we can translate and adjust the same text.
  - ability to switch between translated text and input text in language tool
  - AI tab to prompt AI to modify the input/translated text
  - Sample flow (goal is to be able to follow any order multiple times) - type email in language A -> translate it to language B -> adjust text with help of AI (i.e. "make it more official") -> verify grammar
