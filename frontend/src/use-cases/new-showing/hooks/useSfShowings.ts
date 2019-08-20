import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Dictionary } from "lodash";
import { groupBy } from "lodash-es";
import { useMemo } from "react";
import { formatYMD } from "../../../lib/dateTools";
import {
  SfShowingsQuery,
  SfShowingsQuery_movie_showings,
  SfShowingsQueryVariables
} from "./__generated__/SfShowingsQuery";

export const useSfShowings = (
  movieId: string,
  city: string
): [Dictionary<SfShowingsQuery_movie_showings[]> | null, boolean] => {
  const { data, loading } = useQuery<SfShowingsQuery, SfShowingsQueryVariables>(
    gql`
      query SfShowingsQuery($movieId: UUID!, $city: String) {
        movie(id: $movieId) {
          showings: filmstadenShowings(city: $city) {
            cinemaName
            screen {
              filmstadenId
              name
            }
            timeUtc
            tags
            filmstadenRemoteEntityId
          }
        }
      }
    `,
    {
      fetchPolicy: "no-cache",
      variables: {
        city,
        movieId
      }
    }
  );

  const showings: SfShowingsQuery_movie_showings[] =
    data && data.movie ? data.movie.showings : [];

  const sfdates = useMemo(
    () => groupBy(showings, s => formatYMD(s.timeUtc || "")),
    [showings]
  );
  return [sfdates, loading];
};
