import { faSpinner } from "@fortawesome/free-solid-svg-icons/faSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { formatYMD } from "../../lib/dateTools";
import Field from "../common/ui/Field";
import { SmallHeader } from "../common/ui/Header";
import SelectBox from "../common/ui/SelectBox";
import { SfShowingsQuery_movie_sfShowings } from "./hooks/__generated__/SfShowingsQuery";
import { useSfShowings } from "./hooks/useSfShowings";

export const SfTimeSelector: React.FC<{
  city: string;
  movieId: string;
  onSelect: (v: SfShowingsQuery_movie_sfShowings) => void;
  date: string;
}> = ({ city, movieId, date, onSelect }) => {
  const [sfDates] = useSfShowings(movieId, city);

  if (!sfDates) {
    return <FontAwesomeIcon icon={faSpinner} spin />;
  }

  const sfTimes = sfDates[date];

  if (!sfTimes || sfTimes.length === 0) {
    return <div>Inga tider från SF för {formatYMD(date)}</div>;
  } else {
    return (
      <div>
        <SmallHeader>Välj tid från SF</SmallHeader>
        <Field text="Tid:">
          <SelectBox
            options={sfTimes}
            onChange={onSelect}
          />
        </Field>
      </div>
    );
  }
};
