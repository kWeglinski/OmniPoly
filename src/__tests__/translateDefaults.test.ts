const translateLsMock = (function() {
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

Object.defineProperty(global, 'localStorage', { value: translateLsMock });

type Lang = {
  name: string;
  code: string;
  targets: string[];
};

const getDefaultTargetLanguage = (
  languages: Lang[],
  defaultTargetLang: string,
  existingTarget: Lang | null
): Lang | null => {
  if (existingTarget && existingTarget.code) {
    return existingTarget;
  }
  
  if (defaultTargetLang) {
    const found = languages.find((lang) => lang.code === defaultTargetLang);
    if (found) {
      return found;
    }
  }
  
  return null;
};

describe('getDefaultTargetLanguage', () => {
  const mockLanguages: Lang[] = [
    { name: 'English', code: 'en', targets: ['es', 'fr'] },
    { name: 'Spanish', code: 'es', targets: ['en'] },
    { name: 'French', code: 'fr', targets: ['en'] },
    { name: 'German', code: 'de', targets: ['en'] },
  ];

  beforeEach(() => {
    translateLsMock.clear();
  });

  describe('existing target precedence', () => {
    it('should return existing target if set', () => {
      const existing = { name: 'French', code: 'fr', targets: ['en'] };

      const result = getDefaultTargetLanguage(mockLanguages, 'es', existing);

      expect(result).toEqual(existing);
    });

    it('should use default when existing target has empty code', () => {
      const existing = { name: '', code: '', targets: [] };

      const result = getDefaultTargetLanguage(mockLanguages, 'es', existing);

      expect(result).toEqual({ name: 'Spanish', code: 'es', targets: ['en'] });
    });
  });

  describe('DEFAULT_TARGET_LANGUAGE', () => {
    it('should return language matching DEFAULT_TARGET_LANGUAGE', () => {
      const result = getDefaultTargetLanguage(mockLanguages, 'es', null);

      expect(result).toEqual({ name: 'Spanish', code: 'es', targets: ['en'] });
    });

    it('should return German when DEFAULT_TARGET_LANGUAGE is de', () => {
      const result = getDefaultTargetLanguage(mockLanguages, 'de', null);

      expect(result).toEqual({ name: 'German', code: 'de', targets: ['en'] });
    });

    it('should return null when DEFAULT_TARGET_LANGUAGE code not found', () => {
      const result = getDefaultTargetLanguage(mockLanguages, 'xx', null);

      expect(result).toBeNull();
    });

    it('should return null when DEFAULT_TARGET_LANGUAGE is empty', () => {
      const result = getDefaultTargetLanguage(mockLanguages, '', null);

      expect(result).toBeNull();
    });
  });

  describe('no defaults', () => {
    it('should return null when no existing target and no default', () => {
      const result = getDefaultTargetLanguage(mockLanguages, '', null);

      expect(result).toBeNull();
    });
  });
});
