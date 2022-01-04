import isAfter from "date-fns/isAfter";
import React, { ChangeEvent, useState } from "react";
import {
  CinemaScreenInput,
  CreateShowingInput,
  InputMaybe,
  Scalars,
} from "../../__generated__/types";
import { formatLocalTime, formatYMD, parseDate } from "../../lib/dateTools";
import { FilmstadenShowingSelector } from "../common/showing/FilmstadenShowingSelector";
import Showing from "../common/showing/Showing";
import Field from "../common/ui/Field";

import Header, { SmallHeader } from "../common/ui/Header";
import Input from "../common/ui/Input";
import { LocationSelect } from "../common/ui/LocationSelect";
import MainButton, { GrayButton } from "../common/ui/MainButton";
import {
  CreateShowingQueryQuery,
  CreateShowingQueryQueryVariables,
  FilmstadenShowing,
} from "../../__generated__/types";
import { useCreateShowingMutation } from "./hooks/useCreateShowingMutation";
import { suspend } from "suspend-react";
import { createShowingFormQuery } from "./CreateShowingFormFetcher";
import { client } from "../../store/apollo";
import { useNavigate } from "react-router-dom";
import { navigateToShowing } from "../common/navigators";

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
  admin: CreateShowingQueryQuery["me"];
}

const getInitialState = (
  data: CreateShowingQueryQuery,
  movieID: string
): ShowingState => {
  const { me, movie } = data;

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

export const CreateShowingForm: React.FC<Props> = (props) => {
  const { movieID, clearSelectedMovie } = props;
  const navigate = useNavigate();

  const { data } = suspend(
    () =>
      client.query<CreateShowingQueryQuery, CreateShowingQueryQueryVariables>({
        query: createShowingFormQuery,
        fetchPolicy: "network-only",
        variables: {
          movieID,
        },
      }),
    ["movie", movieID]
  );

  const { movie, filmstadenCities, previouslyUsedLocations } = data;

  const [city, setCity] = useState("GB");

  const [showing, setShowingState] = useState<ShowingState>(() =>
    getInitialState(data, movieID)
  );

  const [createShowing] = useCreateShowingMutation();

  const setShowingValue = <K extends keyof ShowingState>(
    key: K,
    value: ShowingState[K]
  ) => {
    setShowingState((state) => ({
      ...state,
      [key]: value,
    }));
  };

  const setShowingTime = (sfTime: FilmstadenShowing) => {
    const { timeUtc, cinemaName, filmstadenRemoteEntityID, screen } = sfTime;

    const { name, filmstadenID } = screen!;

    setShowingState((state) => {
      const newState: ShowingState = {
        ...state,
        filmstadenRemoteEntityID,
        time: formatLocalTime(timeUtc),
        location: cinemaName,
        filmstadenScreen: { name, id: filmstadenID },
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
      time,
      movieID,
      filmstadenRemoteEntityID,
      date: formatYMD(date),
      filmstadenScreen,
      location,
    };

    createShowing({ variables: { showing } })
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
        <Showing
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
          movieId={movieID}
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
