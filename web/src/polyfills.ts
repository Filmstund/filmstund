import { toTemporalInstant } from "@js-temporal/polyfill";

// eslint-disable-next-line no-extend-native
Date.prototype.toTemporalInstant = toTemporalInstant;

declare global {
  interface Date {
    toTemporalInstant: typeof toTemporalInstant;
  }
}
