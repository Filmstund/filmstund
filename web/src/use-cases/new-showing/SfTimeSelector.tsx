import { faSpinner } from "@fortawesome/free-solid-svg-icons/faSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { formatYMD } from "../../lib/dateTools";
import Field from "../common/ui/Field";
import { SmallHeader } from "../common/ui/Header";
import SelectBox from "../common/ui/SelectBox";
import { SfShowingsQuery_movie_showings } from "./hooks/__generated__/SfShowingsQuery";
import { GroupedFilmstadenShowings } from "./hooks/useSfShowings";

interface Props {
  filmstadenShowings: GroupedFilmstadenShowings | null;
  selectedValue?: string;
  onSelect: (v: SfShowingsQuery_movie_showings) => void;
  date: string;
}

export const SfTimeSelector: React.FC<Props> = ({
  filmstadenShowings,
  date,
  selectedValue,
  onSelect,
}) => {
  if (!filmstadenShowings) {
    return <FontAwesomeIcon icon={faSpinner} spin />;
  }

  const sfTimes = filmstadenShowings[date];

  if (!sfTimes || sfTimes.length === 0) {
    return <div>Inga tider från Filmstaden för {formatYMD(date)}</div>;
  } else {
    return (
      <div>
        <SmallHeader>Välj tid från Filmstaden</SmallHeader>
        <Field text="Tid:">
          <SelectBox
            options={sfTimes}
            onChange={onSelect}
            selectedValue={selectedValue}
          />
        </Field>
      </div>
    );
  }
};
