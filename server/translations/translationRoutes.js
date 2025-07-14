


import express from 'express';
import { ensureTranslation, getAllTranslations, getNamespaceTranslations, writeTranslations } from './translationService.js';

const router = express.Router();

router.get('/:lang/:namespace/:key', async (req, res) => {
  try {
    const { lang, namespace, key } = req.params;
    const translation = await ensureTranslation(lang, namespace, key);
    res.json({ key, translation });
  } catch (error) {
    console.error('Error getting translation:', error);
    res.status(500).json({ error: 'Failed to get translation' });
  }
});

router.get('/:lang', (req, res) => {
  try {
    const { lang } = req.params;
    const translations = getAllTranslations(lang);
    if (!translations) {
      console.error(`No translations found for language: ${lang}`);
      res.status(404).json({ error: `No translations found for language: ${lang}` });
      return;
    }
    res.json(translations);
  } catch (error) {
    console.error('Error getting translations:', error);
    res.status(500).json({ error: 'Failed to get translations' });
  }
});

router.get('/:lang/:namespace', (req, res) => {
  try {
    const { lang, namespace } = req.params;
    const translations = getNamespaceTranslations(lang, namespace);
    if (!translations) {
      console.error(`No translations found for language: ${lang} and namespace: ${namespace}`);
      res.status(404).json({ error: `No translations found for language: ${lang} and namespace: ${namespace}` });
      return;
    }
    res.json(translations);
  } catch (error) {
    console.error('Error getting translations:', error);
    res.status(500).json({ error: 'Failed to get translations' });
  }
});

router.post('/:lang/:namespace/:key', async (req, res) => {
  try {
    const { lang, namespace, key } = req.params;
    const { value } = req.body;
    let translations = getAllTranslations(lang);
    if (!translations) {
      translations = {};
    }
    if (!translations[namespace]) {
      translations[namespace] = {};
    }
    translations[namespace][key] = value;
    writeTranslations({ [lang]: translations });
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving translation:', error);
    res.status(500).json({ error: 'Failed to save translation' });
  }
});

export default router;


