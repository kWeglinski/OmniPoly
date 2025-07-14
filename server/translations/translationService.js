





import fs from 'fs';
import path from 'path';
import axios from 'axios';

const translationsFilePath = path.join(process.cwd(), 'server', 'translations', 'translations.json');

const readTranslations = () => {
  try {
    const data = fs.readFileSync(translationsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading translations file:', err);
    return {};
  }
};

const writeTranslations = (translations) => {
  try {
    const data = JSON.stringify(translations, null, 2);
    fs.writeFileSync(translationsFilePath, data, 'utf8');
  } catch (err) {
    console.error('Error writing translations file:', err);
  }
};

const getTranslation = (lang, namespace, key) => {
  const translations = readTranslations();
  return translations[lang]?.[namespace]?.[key];
};

const setTranslation = (lang, namespace, key, value) => {
  const translations = readTranslations();
  if (!translations[lang]) {
    translations[lang] = {};
  }
  if (!translations[lang][namespace]) {
    translations[lang][namespace] = {};
  }
  translations[lang][namespace][key] = value;
  writeTranslations(translations);
};

const translateText = async (text, targetLang) => {
  try {
    // Use LibreTranslate API to translate text
    const response = await axios.post(`${process.env.LIBRETRANSLATE_URL}/translate`, {
      q: text,
      source: 'en',
      target: targetLang,
      format: 'text'
    });
    return response.data.translatedText;
  } catch (error) {
    console.error('Error translating text:', error);
    return text; // Return original text if translation fails
  }
};

const ensureTranslation = async (lang, namespace, key) => {
  let translation = getTranslation(lang, namespace, key);

  if (!translation) {
    // Get English text as source
    const sourceText = getTranslation('en', namespace, key);
    if (sourceText) {
      // Translate to target language
      translation = await translateText(sourceText, lang);
      // Store the new translation
      setTranslation(lang, namespace, key, translation);
    } else {
      console.error(`No source text found for key: ${key} in namespace: ${namespace}`);
      return key; // Return the key as fallback
    }
  }

  return translation;
};

const addMissingTranslation = (lang, namespace, key, value) => {
  const translations = readTranslations();
  if (!translations[lang]) {
    translations[lang] = {};
  }
  if (!translations[lang][namespace]) {
    translations[lang][namespace] = {};
  }
  translations[lang][namespace][key] = value;
  writeTranslations(translations);
};

const getAllTranslations = (lang) => {
  const translations = readTranslations();
  return translations[lang] || {};
};

const getNamespaceTranslations = (lang, namespace) => {
  const translations = readTranslations();
  return translations[lang]?.[namespace] || {};
};

export { getTranslation, setTranslation, ensureTranslation, readTranslations, addMissingTranslation, getAllTranslations, getNamespaceTranslations, writeTranslations };





