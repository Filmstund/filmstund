import parseISO from "date-fns/parseISO";
import { keys } from "lodash-es";
import React, { lazy } from "react";
import { formatYMD } from "../../../lib/dateTools";
import { SfShowingsQuery_movie_showings } from "../../new-showing/hooks/__generated__/SfShowingsQuery";
import { useSfShowings } from "../../new-showing/hooks/useSfShowings";
import { SfTimeSelector } from "../../new-showing/SfTimeSelector";
import Field from "../ui/Field";

const DatePicker = lazy(() => import("../ui/date-picker/DatePicker"));

const today = new Date();

interface FilmstadenShowingSelectorProps {
  date: string;
  filmstadenRemoteEntityId: string | null;
  onChangeDate: (value: string) => void;
  onSelectShowing: (sfShowing: SfShowingsQuery_movie_showings) => void;
  city: string;
  movieId: string;
}

export const FilmstadenShowingSelector: React.FC<FilmstadenShowingSelectorProps> =
  ({
    city,
    movieId,
    date,
    filmstadenRemoteEntityId,
    onChangeDate,
    onSelectShowing,
  }) => {
    const [sfDates] = useSfShowings(movieId, city);

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
