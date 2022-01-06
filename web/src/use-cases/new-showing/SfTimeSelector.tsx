import { faSpinner } from "@fortawesome/free-solid-svg-icons/faSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { formatYMD } from "../../lib/dateTools";
import Field from "../common/ui/Field";
import { SmallHeader } from "../common/ui/Header";
import SelectBox from "../common/ui/SelectBox";
import { FilmstadenShowingFragment } from "../../__generated__/types";

interface Props {
  filmstadenShowings: Record<string, FilmstadenShowingFragment[]> | null;
  selectedValue?: string;
  onSelect: (v: FilmstadenShowingFragment) => void;
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
