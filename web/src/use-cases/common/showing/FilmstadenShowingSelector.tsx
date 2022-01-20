import parseISO from "date-fns/parseISO";
import { groupBy, keys } from "lodash";
import React, { lazy } from "react";
import {
  formatDateInstantInStockholmTz,
  formatYMD,
} from "../../../lib/dateTools";
import {
  FilmstadenShowingFragment,
  useFilmstadenShowingsQuery,
} from "../../../__generated__/types";
import { SfTimeSelector } from "../../new-showing/SfTimeSelector";
import Field from "../ui/Field";

const DatePicker = lazy(() => import("../ui/date-picker/DatePicker"));

const today = new Date();

interface FilmstadenShowingSelectorProps {
  date: string;
  filmstadenRemoteEntityId: string | null | undefined;
  onChangeDate: (value: string) => void;
  onSelectShowing: (sfShowing: FilmstadenShowingFragment) => void;
  city: string;
  movieID: string;
}

export const FilmstadenShowingSelector: React.FC<
  FilmstadenShowingSelectorProps
> = ({
  city,
  movieID,
  date,
  filmstadenRemoteEntityId,
  onChangeDate,
  onSelectShowing,
}) => {
  const [{ data }] = useFilmstadenShowingsQuery({
    variables: { movieID, city },
  });

  const sfDates = groupBy(data?.filmstadenShowings, (showing) =>
    formatDateInstantInStockholmTz(showing.timeUtc)
  );

  const handleChange = (date: Date) => {
    onChangeDate(formatYMD(date));
  };

  return (
    <>
      <Field text="Datum:">
        <DatePicker
          value={parseISO(date)}
          onChange={handleChange}
          disabledDays={{ before: today }}
          modifiers={{
            filmstadendays: keys(sfDates || {}).map((s) => new Date(s)),
          }}
          modifiersStyles={{
            filmstadendays: {
              backgroundColor: "#fff",
              borderColor: "#d0021b",
              color: "#d0021b",
            },
          }}
        />
      </Field>
      <SfTimeSelector
        date={date}
        selectedValue={filmstadenRemoteEntityId || undefined}
        onSelect={onSelectShowing}
        filmstadenShowings={sfDates}
      />
    </>
  );
};
