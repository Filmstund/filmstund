import { toTemporalInstant } from "@js-temporal/polyfill";

Date.prototype.toTemporalInstant = toTemporalInstant;

declare global {
  interface Date {
    toTemporalInstant: typeof toTemporalInstant;
  }
}
