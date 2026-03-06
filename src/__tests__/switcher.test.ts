const switcherLsMock = (function() {
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

Object.defineProperty(global, 'localStorage', { value: switcherLsMock });

const ToolMap: { [key: string]: number } = {
  translate: 0,
  "language-check": 1,
  harper: 2,
};

const ToolIndexToKey: { [key: number]: string } = {
  0: "libreTranslate",
  1: "languageTool",
  2: "harper",
};

const getInitTab = (
  defaultTab: string,
  tools: Record<string, boolean>
) => {
  if (defaultTab && ToolMap[defaultTab] !== undefined && tools[ToolIndexToKey[ToolMap[defaultTab]]]) {
    return ToolMap[defaultTab];
  }

  const browserTab = parseInt(localStorage.getItem("tab") ?? "-1");
  if (browserTab >= 0 && browserTab <= 2 && tools[ToolIndexToKey[browserTab]]) {
    return browserTab;
  }

  if (tools.libreTranslate) {
    localStorage.setItem("tab", "0");
    return 0;
  } else if (tools.languageTool) {
    localStorage.setItem("tab", "1");
    return 1;
  } else if (tools.harper) {
    localStorage.setItem("tab", "2");
    return 2;
  }
  localStorage.setItem("tab", "0");
  return 0;
};

describe('getInitTab', () => {
  beforeEach(() => {
    switcherLsMock.clear();
  });

  describe('DEFAULT_TAB precedence', () => {
    it('should return translate tab when DEFAULT_TAB is set to translate', () => {
      const tools = { libreTranslate: true, languageTool: true, harper: true };
      switcherLsMock.setItem('tab', '1');

      const result = getInitTab('translate', tools);

      expect(result).toBe(0);
    });

    it('should return language-check tab when DEFAULT_TAB is set to language-check', () => {
      const tools = { libreTranslate: true, languageTool: true, harper: true };
      switcherLsMock.setItem('tab', '0');

      const result = getInitTab('language-check', tools);

      expect(result).toBe(1);
    });

    it('should return harper tab when DEFAULT_TAB is set to harper', () => {
      const tools = { libreTranslate: true, languageTool: true, harper: true };
      switcherLsMock.setItem('tab', '0');

      const result = getInitTab('harper', tools);

      expect(result).toBe(2);
    });

    it('should ignore DEFAULT_TAB if tool is not available', () => {
      const tools = { libreTranslate: true, languageTool: false, harper: false };
      switcherLsMock.setItem('tab', '0');

      const result = getInitTab('language-check', tools);

      expect(result).toBe(0);
    });
  });

  describe('localStorage fallback', () => {
    it('should use localStorage when no DEFAULT_TAB set', () => {
      const tools = { libreTranslate: true, languageTool: true, harper: true };
      switcherLsMock.setItem('tab', '1');

      const result = getInitTab('', tools);

      expect(result).toBe(1);
    });

    it('should use localStorage when DEFAULT_TAB is undefined', () => {
      const tools = { libreTranslate: true, languageTool: true, harper: true };
      switcherLsMock.setItem('tab', '2');

      const result = getInitTab(undefined as unknown as string, tools);

      expect(result).toBe(2);
    });
  });

  describe('first available tool fallback', () => {
    it('should return 0 (translate) when no localStorage and libreTranslate available', () => {
      const tools = { libreTranslate: true, languageTool: true, harper: true };

      const result = getInitTab('', tools);

      expect(result).toBe(0);
    });

    it('should return 1 (language-check) when only languageTool available', () => {
      const tools = { libreTranslate: false, languageTool: true, harper: false };

      const result = getInitTab('', tools);

      expect(result).toBe(1);
    });

    it('should return 2 (harper) when only harper available', () => {
      const tools = { libreTranslate: false, languageTool: false, harper: true };

      const result = getInitTab('', tools);

      expect(result).toBe(2);
    });

    it('should return 0 as final fallback when no tools available', () => {
      const tools = { libreTranslate: false, languageTool: false, harper: false };

      const result = getInitTab('', tools);

      expect(result).toBe(0);
    });
  });

  describe('invalid localStorage handling', () => {
    it('should fallback to first available when localStorage has invalid tab', () => {
      const tools = { libreTranslate: true, languageTool: true, harper: true };
      switcherLsMock.setItem('tab', '99');

      const result = getInitTab('', tools);

      expect(result).toBe(0);
    });

    it('should fallback when localStorage tool is disabled', () => {
      const tools = { libreTranslate: false, languageTool: true, harper: true };
      switcherLsMock.setItem('tab', '0');

      const result = getInitTab('', tools);

      expect(result).toBe(1);
    });
  });
});
