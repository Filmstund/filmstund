import { gql, useQuery } from "@apollo/client";
import { groupBy } from "lodash";
import { useMemo } from "react";
import { formatYMD } from "../../../lib/dateTools";
import {
  FilmstadenShowing,
  QueryFilmstadenShowingsArgs,
} from "../../../__generated__/types";

export type GroupedFilmstadenShowings = {
  [date: string]: FilmstadenShowing[];
};

export const useSfShowings = (
  movieID: string,
  city: string
): [GroupedFilmstadenShowings | null, boolean] => {
  const { data, loading } = useQuery<
    FilmstadenShowing[],
    QueryFilmstadenShowingsArgs
  >(
    gql`
      query FsShowingsQuery($movieID: UUID!, $city: String) {
        filmstadenShowings(movieID: $movieID, city: $city) {
          cinemaName
          screen {
            filmstadenID
            name
          }
          timeUtc
          tags
          filmstadenRemoteEntityID
        }
      }
    `,
    {
      fetchPolicy: "no-cache",
      variables: {
        city,
        movieID,
      },
    }
  );

  const sfdates = useMemo(() => {
    return groupBy(data ?? [], (s) => formatYMD(s.timeUtc || ""));
  }, [data]);

  return [sfdates, loading];
};
