import { mapValues } from "lodash";

export const trim = v => {
  if (v === null) return v;
  if (Array.isArray(v)) {
    return v.map(item => trim(item));
  } else if (v === Object(v)) {
    return mapValues(v, trim);
  } else if (v.trim) {
    return v.trim();
  } else {
    return v;
  }
};

export const capitalize = s => s[0].toUpperCase() + s.substring(1);
