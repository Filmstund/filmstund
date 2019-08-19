import { useQuery } from "react-apollo";
import gql from "graphql-tag";
import {
  SfShowings,
  SfShowingsVariables,
  SfShowings_movie_sfShowings
} from "./__generated__/SfShowings";
import { groupBy } from "lodash-es";
import { formatYMD } from "../../../lib/dateTools";
import { useMemo } from "react";
import SelectBox from "../../common/ui/SelectBox";
import { SmallHeader } from "../../common/ui/Header";
import Field from "../../common/ui/Field";

const query = gql`
  query SfShowings($movieId: UUID!, $city: String!) {
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
`;

export const useSfShowings = (
  movieId: string,
  city: string
): [SfShowings_movie_sfShowings[], boolean] => {
  const { data, loading } = useQuery<SfShowings, SfShowingsVariables>(query, {
    variables: {
      city,
      movieId
    }
  });

  return [
    data && data.movie && data.movie ? data.movie.sfShowings : [],
    loading
  ];
};

const groupByDate = (sfShowings: SfShowings_movie_sfShowings[]) =>
  groupBy(sfShowings, s => formatYMD(s.timeUtc || ""));

interface Props {
  movieId: string;
  city: string;
  selectedDate: string;
  onSelectDate: () => void;
  onSelectShowingTime: () => void;
}

export const SfShowingSelector: React.FC<Props> = ({
  city,
  movieId,
  selectedDate,
  onSelectShowingTime
}) => {
  const [sfShowings, loading] = useSfShowings(movieId, city);

  const groupedShowings = useMemo(() => groupByDate(sfShowings), [sfShowings]);

  const sfTimes = groupedShowings[selectedDate];

  if (loading) {
    return null;
  } else if (!sfTimes || sfTimes.length === 0) {
    return <div>Inga tider från SF för {formatYMD(selectedDate)}</div>;
  } else {
    return (
      <div>
        <SmallHeader>Välj tid från SF</SmallHeader>
        <Field text="Tid:">
          <SelectBox options={sfTimes} onChange={onSelectShowingTime} />
        </Field>
      </div>
    );
  }
};
