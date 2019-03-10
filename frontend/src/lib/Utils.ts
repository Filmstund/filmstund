import { mapValues } from "lodash-es";

export function trim(params: string): string;
export function trim(params: string[]): string[];
export function trim<T extends Record<string, string>>(params: T): T;
export function trim(v: any): any {
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
}

export const capitalize = s => s[0].toUpperCase() + s.substring(1);
