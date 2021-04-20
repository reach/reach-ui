import { HighlightWords } from "../src/utils";
import latinize from "latinize";

describe("<Combobox /> : utils", () => {
  describe("HighlightWords", () => {
    // Forked from https://github.com/bvaughn/highlight-words-core
    // Positions: 01234567890123456789012345678901234567
    const TEXT = "This is a string with words to search.";

    it("should handle empty `textToHighlight`", () => {
      let result = HighlightWords.findAll({
        searchWords: ["search"],
        textToHighlight: "",
      });
      expect(result.length).toBe(0);
    });

    it("should handle undefined `textToHighlight`", () => {
      let result = HighlightWords.findAll({
        searchWords: ["search"],
      });
      expect(result.length).toBe(0);
    });

    it("should highlight all occurrences of a word, regardless of capitalization", () => {
      let rawChunks = HighlightWords.findChunks({
        searchWords: ["th"],
        textToHighlight: TEXT,
      });
      expect(rawChunks).toEqual([
        { start: 0, end: 2, highlight: false },
        { start: 19, end: 21, highlight: false },
      ]);
    });

    it("should highlight words that partially overlap", () => {
      let combinedChunks = HighlightWords.combineChunks({
        chunks: HighlightWords.findChunks({
          searchWords: ["thi", "is"],
          textToHighlight: TEXT,
        }),
      });
      expect(combinedChunks).toEqual([
        { start: 0, end: 4, highlight: false },
        { start: 5, end: 7, highlight: false },
      ]);
    });

    it("should combine into the minimum number of marked and unmarked chunks", () => {
      let filledInChunks = HighlightWords.findAll({
        searchWords: ["thi", "is"],
        textToHighlight: TEXT,
      });
      expect(filledInChunks).toEqual([
        { start: 0, end: 4, highlight: true },
        { start: 4, end: 5, highlight: false },
        { start: 5, end: 7, highlight: true },
        { start: 7, end: 38, highlight: false },
      ]);
    });

    it("should handle unclosed parentheses when autoEscape prop is truthy", () => {
      let rawChunks = HighlightWords.findChunks({
        autoEscape: true,
        searchWords: ["text)"],
        textToHighlight: "(This is text)",
      });
      expect(rawChunks).toEqual([{ start: 9, end: 14, highlight: false }]);
    });

    it("should match terms without accents against text with accents", () => {
      let rawChunks = HighlightWords.findChunks({
        sanitize: latinize,
        searchWords: ["example"],
        textToHighlight: "ỆᶍǍᶆṔƚÉ",
      });
      expect(rawChunks).toEqual([{ start: 0, end: 7, highlight: false }]);
    });

    it("should support case sensitive matches", () => {
      let rawChunks = HighlightWords.findChunks({
        caseSensitive: true,
        searchWords: ["t"],
        textToHighlight: TEXT,
      });
      expect(rawChunks).toEqual([
        { start: 11, end: 12, highlight: false },
        { start: 19, end: 20, highlight: false },
        { start: 28, end: 29, highlight: false },
      ]);

      rawChunks = HighlightWords.findChunks({
        caseSensitive: true,
        searchWords: ["T"],
        textToHighlight: TEXT,
      });
      expect(rawChunks).toEqual([{ start: 0, end: 1, highlight: false }]);
    });

    it("should handle zero-length matches correctly", () => {
      let rawChunks = HighlightWords.findChunks({
        caseSensitive: true,
        searchWords: [".*"],
        textToHighlight: TEXT,
      });
      expect(rawChunks).toEqual([{ start: 0, end: 38, highlight: false }]);

      rawChunks = HighlightWords.findChunks({
        caseSensitive: true,
        searchWords: ["w?"],
        textToHighlight: TEXT,
      });
      expect(rawChunks).toEqual([
        { start: 17, end: 18, highlight: false },
        { start: 22, end: 23, highlight: false },
      ]);
    });

    it("should use custom findChunks", () => {
      let filledInChunks = HighlightWords.findAll({
        findChunks: (_: any) => [{ highlight: false, start: 1, end: 3 }],
        searchWords: ["xxx"],
        textToHighlight: TEXT,
      });
      expect(filledInChunks).toEqual([
        { start: 0, end: 1, highlight: false },
        { start: 1, end: 3, highlight: true },
        { start: 3, end: 38, highlight: false },
      ]);

      filledInChunks = HighlightWords.findAll({
        findChunks: () => [],
        searchWords: ["This"],
        textToHighlight: TEXT,
      });
      expect(filledInChunks).toEqual([{ start: 0, end: 38, highlight: false }]);
    });
  });
});
