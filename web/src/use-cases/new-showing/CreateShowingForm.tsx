import isAfter from "date-fns/isAfter";
import React, { ChangeEvent, useState } from "react";
import {
  CinemaScreenInput,
  CreateShowingInput,
  CreateShowingQuery,
  FilmstadenShowingFragment,
  InputMaybe,
  Scalars,
  useCreateShowingMutation,
  useCreateShowingQuery,
} from "../../__generated__/types";
import { formatLocalTime, formatYMD, parseDate } from "../../lib/dateTools";
import { FilmstadenShowingSelector } from "../common/showing/FilmstadenShowingSelector";
import SimpleShowing from "../common/showing/SimpleShowing";
import Field from "../common/ui/Field";

import Header, { SmallHeader } from "../common/ui/Header";
import Input from "../common/ui/Input";
import { LocationSelect } from "../common/ui/LocationSelect";
import MainButton, { GrayButton } from "../common/ui/MainButton";
import { useNavigate } from "react-router-dom";
import { navigateToShowing } from "../common/navigators";
import { Temporal } from "@js-temporal/polyfill";

const now = new Date();

interface Props {
  movieID: Scalars["UUID"];
  clearSelectedMovie: () => void;
}

interface ShowingState {
  date: string;
  time: string;
  location: string;
  filmstadenRemoteEntityID: string | undefined | null;
  filmstadenScreen: InputMaybe<CinemaScreenInput>;
  movieID: string;
  admin: CreateShowingQuery["me"];
}

const getInitialState = (
  { me, movie }: Pick<CreateShowingQuery, "me" | "movie">,
  movieID: string
): ShowingState => {
  let date = now;

  if (movie && isAfter(parseDate(movie.releaseDate), now)) {
    date = new Date(movie.releaseDate);
  }

  return {
    date: formatYMD(date),
    time: formatLocalTime(now),
    location: "",
    filmstadenRemoteEntityID: null,
    filmstadenScreen: null,
    movieID: movieID,
    admin: me!,
  };
};

export const CreateShowingForm: React.FC<Props> = ({
  clearSelectedMovie,
  movieID,
}) => {
  const navigate = useNavigate();

  const [{ data }] = useCreateShowingQuery({
    variables: {
      movieID,
    },
  });

  const { movie, filmstadenCities, previouslyUsedLocations, me } = data!;

  const [city, setCity] = useState("GB");

  const [showing, setShowingState] = useState<ShowingState>(() =>
    getInitialState({ movie, me }, movieID)
  );

  const [, createShowing] = useCreateShowingMutation();

  const setShowingValue = <K extends keyof ShowingState>(
    key: K,
    value: ShowingState[K]
  ) => {
    setShowingState((state) => ({
      ...state,
      [key]: value,
    }));
  };

  const setShowingTime = (sfTime: FilmstadenShowingFragment) => {
    const { timeUtc, cinema, id, screen } = sfTime;

    setShowingState((state) => {
      const newState: ShowingState = {
        ...state,
        filmstadenRemoteEntityID: id,
        time: Temporal.PlainDateTime.from(timeUtc).toPlainTime().toString(),
        location: cinema.name,
        filmstadenScreen: screen,
      };

      handleSubmit(newState);

      return newState;
    });
  };

  const setShowingValueFromEvent = (
    key: keyof ShowingState,
    { target: { value } }: ChangeEvent<HTMLInputElement>
  ) => {
    setShowingValue(key, value);
  };

  const handleSubmit = ({
    time,
    date,
    filmstadenRemoteEntityID,
    location,
    filmstadenScreen,
  }: ShowingState) => {
    const showing: CreateShowingInput = {
      time: Temporal.PlainTime.from(time),
      movieID,
      filmstadenRemoteEntityID: filmstadenRemoteEntityID ?? null,
      date: Temporal.PlainDate.from(date),
      filmstadenScreen,
      location,
    };

    createShowing({ showing })
      .then((resp) => {
        const { showing } = resp.data!;
        navigateToShowing(navigate, showing);
      })
      .catch((errors) => {
        console.log(errors);
      });
  };

  const locationName = showing.location;

  return (
    <>
      <Header>Skapa besök</Header>
      <div>
        <SimpleShowing
          date={formatYMD(showing.date) + " " + showing.time}
          admin={showing.admin}
          location={locationName}
          movie={movie || undefined}
        />
        <Field text="Filmstaden-stad (används för att hämta rätt tider):">
          <select
            value={city}
            onChange={({ target: { value } }) => setCity(value)}
          >
            {filmstadenCities.map((city) => (
              <option key={city.alias} value={city.alias}>
                {city.name}
              </option>
            ))}
          </select>
        </Field>

        <FilmstadenShowingSelector
          date={showing.date}
          filmstadenRemoteEntityId={null}
          onChangeDate={(value) => setShowingValue("date", value)}
          onSelectShowing={setShowingTime}
          city={city}
          movieID={movieID}
        />
        <SmallHeader>...eller skapa egen tid</SmallHeader>
        <Field text="Tid:">
          <Input
            type="time"
            value={showing.time}
            onChange={(v) => setShowingValueFromEvent("time", v)}
          />
        </Field>
        <Field text="Plats:">
          <LocationSelect
            previousLocations={previouslyUsedLocations}
            value={locationName}
            onChange={(value: string) => setShowingValue("location", value)}
          />
        </Field>
        <GrayButton onClick={clearSelectedMovie}>Avbryt</GrayButton>
        <MainButton onClick={() => handleSubmit(showing)}>
          Skapa besök
        </MainButton>
      </div>
    </>
  );
};
