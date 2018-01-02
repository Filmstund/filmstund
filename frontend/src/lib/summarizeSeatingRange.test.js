import { groupSeatingRange, formatSeatingRange } from "./summarizeSeatingRange";

describe("summarizeSeatingRange", () => {
  describe("groupSeatingRange", () => {
    it("should group ranges", () => {
      expect(groupSeatingRange([0, 1, 2, 4, 5, 7])).toEqual([
        [0, 1, 2],
        [4, 5],
        [7]
      ]);
    });
    it("should group ranges", () => {
      expect(groupSeatingRange([4, 5, 6, 8, 9, 11])).toEqual([
        [4, 5, 6],
        [8, 9],
        [11]
      ]);
    });
    it("should group ranges", () => {
      expect(groupSeatingRange([0, 2, 3, 4, 6, 8, 9])).toEqual([
        [0],
        [2, 3, 4],
        [6],
        [8, 9]
      ]);
    });
    it("should not fail on empty array as input", () => {
      expect(groupSeatingRange([])).toEqual([]);
    });
  });

  describe("formatSeatingRange", () => {
    it("should format ranges", () => {
      expect(formatSeatingRange([[0, 1, 2], [4, 5], [7]])).toEqual([
        "0-2",
        "4-5",
        "7"
      ]);
    });
    it("should group ranges", () => {
      expect(formatSeatingRange([[0], [2, 3, 4], [6], [8, 9]])).toEqual([
        "0",
        "2-4",
        "6",
        "8-9"
      ]);
    });
    it("should not fail on empty array as input", () => {
      expect(formatSeatingRange([])).toEqual([]);
    });
  });
});
