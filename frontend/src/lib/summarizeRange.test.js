import { groupRange, formatRange } from "./summarizeRange";

describe("summarizeRange", () => {
  describe("groupRange", () => {
    it("should group ranges", () => {
      expect(groupRange([0, 1, 2, 4, 5, 7])).toEqual([[0, 1, 2], [4, 5], [7]]);
    });
    it("should group ranges", () => {
      expect(groupRange([4, 5, 6, 8, 9, 11])).toEqual([
        [4, 5, 6],
        [8, 9],
        [11]
      ]);
    });
    it("should group ranges", () => {
      expect(groupRange([0, 2, 3, 4, 6, 8, 9])).toEqual([
        [0],
        [2, 3, 4],
        [6],
        [8, 9]
      ]);
    });
    it("should not fail on empty array as input", () => {
      expect(groupRange([])).toEqual([]);
    });
  });

  describe("formatRange", () => {
    it("should format ranges", () => {
      expect(formatRange([[0, 1, 2], [4, 5], [7]])).toEqual([
        "0-2",
        "4-5",
        "7"
      ]);
    });
    it("should group ranges", () => {
      expect(formatRange([[0], [2, 3, 4], [6], [8, 9]])).toEqual([
        "0",
        "2-4",
        "6",
        "8-9"
      ]);
    });
    it("should not fail on empty array as input", () => {
      expect(formatRange([])).toEqual([]);
    });
  });
});
