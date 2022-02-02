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
import {
  formatTimeInstantInStockholmTz,
  formatYMD,
  parseDate,
} from "../../lib/dateTools";
import { FilmstadenShowingSelector } from "../common/showing/FilmstadenShowingSelector";
import SimpleShowing from "../common/showing/SimpleShowing";
import Field from "../common/ui/Field";

import Header, { SmallHeader } from "../common/ui/Header";
import Input from "../common/ui/Input";
import { LocationSelect } from "../common/ui/LocationSelect";
import MainButton, { GrayButton } from "../common/ui/MainButton";
import { useNavigate } from "react-router-dom";
import * as navigators from "../common/navigators";
import { Temporal } from "@js-temporal/polyfill";
import { useToaster } from "../../common/toast/ToastContext";
import { InputSpinner } from "../single-showing/InputSpinner";

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

const cleanFilmstadenScreen = ({
  id,
  name,
}: FilmstadenShowingFragment["screen"]): InputMaybe<CinemaScreenInput> => ({
  id,
  name,
});

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
    time: "19:00",
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
  const toast = useToaster();

  const [{ fetching: isLoading }, createShowing] = useCreateShowingMutation();

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

    const newState: ShowingState = {
      ...showing,
      filmstadenRemoteEntityID: id,
      time: formatTimeInstantInStockholmTz(timeUtc),
      location: cinema.name,
      filmstadenScreen: cleanFilmstadenScreen(screen),
    };

    handleSubmit(newState);
  };

  const handleSubmit = ({
    time,
    date,
    filmstadenRemoteEntityID,
    location,
    filmstadenScreen,
  }: ShowingState) => {
    const showing: CreateShowingInput = {
      time: Temporal.PlainTime.from(time).toString({
        smallestUnit: "minutes",
      }) as any,
      movieID,
      filmstadenRemoteEntityID: filmstadenRemoteEntityID ?? null,
      date: Temporal.PlainDate.from(date),
      filmstadenScreen,
      location,
    };

    createShowing({ showing })
      .then(({ data, error }) => {
        if (data) {
          navigators.navigateToShowing(navigate, data.showing);
          toast({ variant: "success", text: "Visning har sparats" });
        } else if (error) {
          toast({ variant: "danger", text: error.message });
        }
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
            onChange={(e) => setShowingValue("time", e.target.value)}
          />
        </Field>
        <Field text="Plats:">
          <LocationSelect
            previousLocations={previouslyUsedLocations}
            value={locationName}
            onChange={(value) => setShowingValue("location", value)}
          />
        </Field>
        {isLoading && <InputSpinner />}
        <GrayButton onClick={clearSelectedMovie}>Avbryt</GrayButton>
        <MainButton onClick={() => handleSubmit(showing)}>
          Skapa besök
        </MainButton>
      </div>
    </>
  );
};
