import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Dictionary } from "lodash";
import { groupBy } from "lodash-es";
import { useMemo } from "react";
import { formatYMD } from "../../../lib/dateTools";
import { CreateShowingQuery_movie_sfShowings } from "../__generated__/CreateShowingQuery";
import {
  SfShowingsQuery,
  SfShowingsQuery_movie_sfShowings,
  SfShowingsQueryVariables
} from "../__generated__/SfShowingsQuery";

export const useSfShowings = (
  movieId: string,
  city: string
): [Dictionary<SfShowingsQuery_movie_sfShowings[]> | null, boolean] => {
  const { data, loading } = useQuery<SfShowingsQuery, SfShowingsQueryVariables>(
    gql`
      query SfShowingsQuery($movieId: UUID!, $city: String) {
        movie(id: $movieId) {
          sfShowings(city: $city) {
            cinemaName
            screen {
              sfId
              name
            }
            timeUtc
            tags
          }
        }
      }
    `,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        city,
        movieId
      }
    }
  );

  const sfShowingsQueryMovieSfShowings: CreateShowingQuery_movie_sfShowings[] =
    data && data.movie ? data.movie.sfShowings : [];

  const sfdates = useMemo(
    () =>
      groupBy(sfShowingsQueryMovieSfShowings, s => formatYMD(s.timeUtc || "")),
    [sfShowingsQueryMovieSfShowings]
  );
  return [sfdates, loading];
};
