import {
  createClient,
  dedupExchange,
  errorExchange,
  fetchExchange,
} from "urql";
import { BASE_GRAPHQL_URL } from "../lib/withBaseURL";
import { cacheExchange } from "@urql/exchange-graphcache";
import customScalarsExchange from "urql-custom-scalars-exchange";
import schema from "../__generated__/introspection.json";
import { Temporal } from "@js-temporal/polyfill";
import { Commandments } from "../__generated__/types";

export const urql = createClient({
  url: BASE_GRAPHQL_URL,
  exchanges: [
    dedupExchange,
    errorExchange({
      onError: (error, operation) => {
        console.log(error);
        if (error.response.status === 401) {
          if (window.location.pathname !== "/login") {
            window.location.pathname = "/login";
          }
        }
      },
    }),
    customScalarsExchange({
      schema: schema as any,
      scalars: {
        LocalDate(value: string) {
          return Temporal.PlainDate.from(value);
        },
        LocalTime(value: string) {
          return Temporal.PlainTime.from(value);
        },
        Time(value: string) {
          return Temporal.ZonedDateTime.from(value);
        },
      },
    }),
    cacheExchange({
      schema: schema as any,
      keys: {
        Commandments: (d) => String((d as unknown as Commandments).number),
      },
    }),
    fetchExchange,
  ],
  suspense: true,
});
