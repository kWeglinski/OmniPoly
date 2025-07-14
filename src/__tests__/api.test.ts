

import { API } from '../translate/API';
import { LangChoice } from '../translate/types';

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ translatedText: 'Hello World', alternatives: ['Hi World'] }),
  } as Response)
);

describe('API module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTranslation', () => {
    it('should call fetch with correct parameters', async () => {
      const source: LangChoice = { name: 'English', code: 'en', targets: [] };
      const target: LangChoice = { name: 'Spanish', code: 'es', targets: [] };
      const text = 'Hello';

      const api = API();
      await api.getTranslation(source, target, text);

      expect(fetch).toHaveBeenCalledWith('/api/libretranslate/translate', {
        method: 'POST',
        body: JSON.stringify({
          q: text,
          source: source.code,
          target: target.code,
          format: 'text',
          alternatives: 3,
          api_key: '',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should return parsed response', async () => {
      const source: LangChoice = { name: 'English', code: 'en', targets: [] };
      const target: LangChoice = { name: 'Spanish', code: 'es', targets: [] };
      const text = 'Hello';

      const api = API();
      const result = await api.getTranslation(source, target, text);

      expect(result).toEqual({ translatedText: 'Hello World', alternatives: ['Hi World'] });
    });

    it('should handle fetch errors', async () => {
      (fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.reject(new Error('Network error'))
      );

      const source: LangChoice = { name: 'English', code: 'en', targets: [] };
      const target: LangChoice = { name: 'Spanish', code: 'es', targets: [] };
      const text = 'Hello';

      const api = API();

      await expect(api.getTranslation(source, target, text)).rejects.toThrow('Network error');
    });
  });

  describe('getOllamaTranslation', () => {
    beforeEach(() => {
      (fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ response: JSON.stringify({
            translation: 'Hola Mundo',
            "notable words": [
              { word: "Mundo (World)", explanation: "Test explanation" }
            ]
          }) }),
        } as Response)
      );
    });

    it('should call fetch with correct parameters', async () => {
      const source: LangChoice = { name: 'English', code: 'en', targets: [] };
      const target: LangChoice = { name: 'Spanish', code: 'es', targets: [] };
      const text = 'Hello';

      const api = API();
      await api.getOllamaTranslation(source, target, text);

      expect(fetch).toHaveBeenCalledWith('/api/ollama/generate', expect.any(Object));
      const call = (fetch as jest.Mock).mock.calls[0];
      expect(call[1].body).toContain(text);
      expect(call[1].body).toContain(target.name);
    });

    it('should return parsed response with notable words', async () => {
      const source: LangChoice = { name: 'English', code: 'en', targets: [] };
      const target: LangChoice = { name: 'Spanish', code: 'es', targets: [] };
      const text = 'Hello';

      const api = API();
      const result = await api.getOllamaTranslation(source, target, text);

      expect(result).toEqual({
        translatedText: 'Hola Mundo',
        notableWords: [
          { word: "Mundo (World)", explanation: "Test explanation" }
        ]
      });
    });
  });

  describe('getLanguages', () => {
    beforeEach(() => {
      (fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve([{ code: 'en', name: 'English' }]),
        } as Response)
      );
    });

    it('should call fetch with correct parameters', async () => {
      const api = API();
      await api.getLanguages();

      expect(fetch).toHaveBeenCalledWith('/api/libretranslate/languages');
    });

    it('should return parsed response', async () => {
      const api = API();
      const result = await api.getLanguages();

      expect(result).toEqual([{ code: 'en', name: 'English' }]);
    });
  });
});

