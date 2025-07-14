

import { justLangData, moveToTop, getFromLS } from '../translate/utils';
import { LangChoice } from '../translate/types';

// Mock localStorage for testing
const localStorageMock = (function() {
  let store: { [key: string]: string } = {};

  return {
    getItem: function(key: string) {
      return store[key] || null;
    },
    setItem: function(key: string, value: string) {
      store[key] = value.toString();
    },
    clear: function() {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('translate utils', () => {
  describe('justLangData', () => {
    it('should extract basic language data from LangChoice', () => {
      const langChoice: LangChoice = {
        name: 'English',
        code: 'en',
        targets: ['es', 'fr'],
        history: [{ name: 'Spanish', code: 'es', targets: [] }],
      };

      const result = justLangData(langChoice);

      expect(result).toEqual({
        name: 'English',
        code: 'en',
        targets: ['es', 'fr'],
      });
    });

    it('should handle empty targets array', () => {
      const langChoice: LangChoice = {
        name: 'Spanish',
        code: 'es',
        targets: [],
        history: [],
      };

      const result = justLangData(langChoice);

      expect(result).toEqual({
        name: 'Spanish',
        code: 'es',
        targets: [],
      });
    });
  });

  describe('moveToTop', () => {
    it('should move existing item to top of array', () => {
      const array = [1, 2, 3, 4];
      const result = moveToTop(array, 3);

      expect(result).toEqual([3, 1, 2, 4]);
    });

    it('should handle item not in array', () => {
      const array = [1, 2, 3];
      const result = moveToTop(array, 4);

      expect(result).toEqual([4, 1, 2, 3]);
    });

    it('should handle empty array', () => {
      const array: number[] = [];
      const result = moveToTop(array, 1);

      expect(result).toEqual([1]);
    });
  });

  describe('getFromLS', () => {
    it('should return parsed value from localStorage', () => {
      localStorage.setItem('testKey', JSON.stringify({ name: 'test' }));

      const result = getFromLS('testKey');

      expect(result).toEqual({ name: 'test' });
    });

    it('should return empty string when key does not exist', () => {
      const result = getFromLS('nonExistentKey');

      expect(result).toBe('');
    });

    it('should return empty string when localStorage is null', () => {
      localStorage.clear();

      const result = getFromLS('testKey');

      expect(result).toBe('');
    });
  });
});

