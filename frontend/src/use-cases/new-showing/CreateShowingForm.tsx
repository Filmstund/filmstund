import { parse } from "date-fns";
import format from "date-fns/format";
import isAfter from "date-fns/is_after";
import { keys } from "lodash-es";
import React, { ChangeEvent, lazy, useState } from "react";
import { CreateShowingInput } from "../../../__generated__/globalTypes";
import { formatLocalTime, formatYMD } from "../../lib/dateTools";
import Showing from "../common/showing/Showing";
import Field from "../common/ui/Field";

import Header, { SmallHeader } from "../common/ui/Header";
import Input from "../common/ui/Input";
import { LocationSelect } from "../common/ui/LocationSelect";
import MainButton, { GrayButton } from "../common/ui/MainButton";
import { PageWidthWrapper } from "../common/ui/PageWidthWrapper";
import { SfShowings_movie_sfShowings } from "../single-showing/components/__generated__/SfShowings";
import {
  CreateShowingQuery,
  CreateShowingQuery_me
} from "./__generated__/CreateShowingQuery";
import { useCreateShowingMutation } from "./hooks/useCreateShowingMutation";
import { useSfShowings } from "./hooks/useSfShowings";
import { SfTimeSelector } from "./SfTimeSelector";

const DatePicker = lazy(() => import("../common/ui/date-picker/DatePicker"));

const now = new Date();

interface Props {
  data: CreateShowingQuery;
  movieId: string;
  navigateToShowing: (s: { webId: string; slug: string }) => void;
  clearSelectedMovie: () => void;
}

interface ShowingState {
  date: string;
  time: string;
  location: string;
  sfScreen: { name: string; sfId: string } | null;
  movieId: string;
  admin: CreateShowingQuery_me;
}

const getInitialState = (props: Props): ShowingState => {
  const {
    data: { me, movie },
    movieId
  } = props;

  let date = now;

  if (movie && isAfter(movie.releaseDate, now)) {
    date = new Date(movie.releaseDate);
  }

  return {
    date: formatYMD(date),
    time: format(now, "HH:mm"),
    location: "",
    sfScreen: null,
    movieId: movieId,
    admin: me!
  };
};

export const CreateShowingForm: React.FC<Props> = props => {
  const [city, setCity] = useState("GB");
  const {
    movieId,
    navigateToShowing,
    clearSelectedMovie,
    data: { movie, sfCities, previousLocations }
  } = props;

  const [showing, setShowingState] = useState<ShowingState>(() =>
    getInitialState(props)
  );

  const [createShowing] = useCreateShowingMutation();
  const [sfdates] = useSfShowings(movieId, city);

  const setShowingValue = <K extends keyof ShowingState>(
    key: K,
    value: ShowingState[K]
  ) => {
    setShowingState(state => ({
      ...state,
      [key]: value
    }));
  };

  const setShowingTime = (sfTime: SfShowings_movie_sfShowings) => {
    const { timeUtc, cinemaName, screen } = sfTime;

    const { name, sfId } = screen!;

    setShowingState(state => {
      const newState: ShowingState = {
        ...state,
        time: formatLocalTime(timeUtc!),
        location: cinemaName!,
        sfScreen: { name, sfId }
      };

      handleSubmit(state);

      return newState;
    });
  };

  const setShowingValueFromEvent = (
    key: keyof ShowingState,
    { target: { value } }: ChangeEvent<HTMLInputElement>
  ) => {
    setShowingValue(key, value);
  };

  const handleSubmit = ({ time, date, location, sfScreen }: ShowingState) => {
    const showing: CreateShowingInput = {
      time,
      movieId,
      date: formatYMD(date),
      sfScreen,
      location
    };

    createShowing({ variables: { showing } })
      .then(resp => {
        const { showing } = resp.data!;
        navigateToShowing(showing);
      })
      .catch(errors => {
        console.log(errors);
      });
  };

  const locationName = showing.location;

  return (
    <PageWidthWrapper>
      <Header>Skapa besök</Header>
      <div>
        <Showing
          date={formatYMD(showing.date) + " " + showing.time}
          admin={showing.admin}
          location={locationName}
          movie={movie || undefined}
        />
        <Field text="SF-stad (används för att hämta rätt tider):">
          <select
            value={city}
            onChange={({ target: { value } }) => setCity(value)}
          >
            {sfCities.map(city => (
              <option key={city.alias} value={city.alias}>
                {city.name}
              </option>
            ))}
          </select>
        </Field>
        <Field text="Datum:">
          <DatePicker
            value={parse(showing.date)}
            onChange={(value: Date) => {
              setShowingValue("date", formatYMD(value));
            }}
            disabledDays={{ before: now }}
            modifiers={{ sfdays: keys(sfdates).map(s => new Date(s)) }}
            modifiersStyles={{
              sfdays: {
                backgroundColor: "#fff",
                borderColor: "#d0021b",
                color: "#d0021b"
              }
            }}
          />
        </Field>
        <SfTimeSelector
          date={showing.date}
          onSelect={setShowingTime}
          city={city}
          movieId={movieId}
        />
        <SmallHeader>...eller skapa egen tid</SmallHeader>
        <Field text="Tid:">
          <Input
            type="time"
            value={showing.time}
            onChange={v => setShowingValueFromEvent("time", v)}
          />
        </Field>
        <Field text="Plats:">
          <LocationSelect
            previousLocations={previousLocations}
            value={locationName}
            onChange={(value: string) => setShowingValue("location", value)}
          />
        </Field>
        <GrayButton onClick={clearSelectedMovie}>Avbryt</GrayButton>
        <MainButton onClick={() => handleSubmit(showing)}>
          Skapa besök
        </MainButton>
      </div>
    </PageWidthWrapper>
  );
};
