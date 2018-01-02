export const groupRange = nums =>
  nums.reduce(
    ({ groups, lastElement }, curr) => {
      if (curr !== lastElement + 1) {
        groups.push([curr]);
      } else {
        groups[groups.length - 1].push(curr);
      }
      return { groups, lastElement: curr };
    },
    { groups: [], lastElement: undefined }
  ).groups;

export const formatRange = ranges =>
  ranges.map(range => {
    if (range.length === 1) {
      return String(range[0]);
    } else {
      return range[0] + "-" + range[range.length - 1];
    }
  });

export const formatRow = row => formatRange(groupRange(row)).join(", ");
