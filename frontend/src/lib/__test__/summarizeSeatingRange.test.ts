import {
  formatSeatingRange,
  groupSeatingRange
} from "../summarizeSeatingRange";

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
    describe("real world examples", () => {
      it("1, 2, 3", () => {
        expect(groupSeatingRange([1, 2, 3])).toEqual([[1, 2, 3]]);
      });

      it("8, 9, 10, 11", () => {
        expect(groupSeatingRange([8, 9, 10, 11])).toEqual([[8, 9, 10, 11]]);
      });

      it("19, 20, 21, 22", () => {
        expect(groupSeatingRange([19, 20, 21, 22])).toEqual([[19, 20, 21, 22]]);
      });
      it("29, 30, 31", () => {
        expect(groupSeatingRange([29, 30, 31])).toEqual([[29, 30, 31]]);
      });
      it("39, 40", () => {
        expect(groupSeatingRange([39, 40])).toEqual([[39, 40]]);
      });
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
