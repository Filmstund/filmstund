export const groupSeatingRange = (nums: number[]): number[][] =>
  nums.reduce<{ groups: number[][]; lastElement: number | undefined }>(
    ({ groups, lastElement }, curr) => {
      if (lastElement === undefined || curr !== lastElement + 1) {
        groups.push([curr]);
      } else {
        groups[groups.length - 1].push(curr);
      }
      return { groups, lastElement: curr };
    },
    { groups: [], lastElement: undefined }
  ).groups;

export const formatSeatingRange = (ranges: number[][]): string[] =>
  ranges.map((range) => {
    if (range.length === 1) {
      return String(range[0]);
    } else {
      return range[0] + "-" + range[range.length - 1];
    }
  });

export const formatSeatingRow = (row: number[]): string =>
  formatSeatingRange(groupSeatingRange(row)).join(", ");
