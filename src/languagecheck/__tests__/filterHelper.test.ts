 // @ts-expect-error missing type declarations for filterHelper
import { filterResult } from "../../../filterHelper";
// Mock the lookupWord function used inside filterHelper
jest.mock("../../../server/words.js", () => ({
  lookupWord: jest.fn(),
}));

 
const { lookupWord } = require("../../../server/words.js");

describe("filterResult", () => {
  beforeEach(() => {
    // Reset mock calls and implementations before each test
     
    (lookupWord as unknown as jest.Mock).mockReset();
  });

  it("preserves all top‑level fields of the result object", () => {
    const input = {
      language: "en",
      matches: [],
      software: { name: "LanguageTool", version: "5.7" },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const output = filterResult(input) as any;

    expect(output.language).toBe("en");
    expect(output.software).toEqual({ name: "LanguageTool", version: "5.7" });
  });

  it("removes typo matches that exist in the custom dictionary", () => {
    // Simulate a word that is present in the custom dictionary
     
    (lookupWord as unknown as jest.Mock).mockReturnValueOnce(true);

    const input = {
      matches: [
        {
          rule: { category: { id: "TYPOS" } },
          context: { text: "teh", offset: 0, length: 3 },
        },
        {
          // Non‑typo match should stay untouched
          rule: { category: { id: "GRAMMAR" } },
          context: { text: "example", offset: 0, length: 7 },
        },
      ],
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const output = filterResult(input) as any;

    // The typo match should be filtered out
    expect(output.matches).toHaveLength(1);
    expect(output.matches[0].rule.category.id).toBe("GRAMMAR");
  });

  it("keeps typo matches when the word is not in the custom dictionary", () => {
     
    (lookupWord as unknown as jest.Mock).mockReturnValueOnce(false);

    const input = {
      matches: [
        {
          rule: { category: { id: "TYPOS" } },
          context: { text: "teh", offset: 0, length: 3 },
        },
      ],
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const output = filterResult(input) as any;

    expect(output.matches).toHaveLength(1);
    expect(output.matches[0].rule.category.id).toBe("TYPOS");
  });

  it("handles missing matches array gracefully", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const input = { language: "en" } as any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const output = filterResult(input) as any;

    // Should not throw and should return an object with empty matches
    expect(output.matches).toEqual([]);
  });
});