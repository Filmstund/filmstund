import format from "date-fns/format";
import isAfter from "date-fns/is_after";
import React, { ChangeEvent, useState } from "react";
import { CreateShowingInput } from "../../__generated__/globalTypes";
import { formatLocalTime, formatYMD } from "../../lib/dateTools";
import { FilmstadenShowingSelector } from "../common/showing/FilmstadenShowingSelector";
import Showing from "../common/showing/Showing";
import Field from "../common/ui/Field";

import Header, { SmallHeader } from "../common/ui/Header";
import Input from "../common/ui/Input";
import { LocationSelect } from "../common/ui/LocationSelect";
import MainButton, { GrayButton } from "../common/ui/MainButton";
import { PageWidthWrapper } from "../common/ui/PageWidthWrapper";
import { CreateShowingQuery, CreateShowingQuery_me } from "./__generated__/CreateShowingQuery";
import { SfShowingsQuery_movie_showings } from "./hooks/__generated__/SfShowingsQuery";
import { useCreateShowingMutation } from "./hooks/useCreateShowingMutation";

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
  filmstadenScreen: { name: string; filmstadenId: string } | null;
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
    filmstadenScreen: null,
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
    data: { movie, filmstadenCities, previousLocations }
  } = props;

  const [showing, setShowingState] = useState<ShowingState>(() =>
    getInitialState(props)
  );

  const [createShowing] = useCreateShowingMutation();

  const setShowingValue = <K extends keyof ShowingState>(
    key: K,
    value: ShowingState[K]
  ) => {
    setShowingState(state => ({
      ...state,
      [key]: value
    }));
  };

  const setShowingTime = (sfTime: SfShowingsQuery_movie_showings) => {
    const { timeUtc, cinemaName, screen } = sfTime;

    const { name, filmstadenId } = screen!;

    setShowingState(state => {
      const newState: ShowingState = {
        ...state,
        time: formatLocalTime(timeUtc),
        location: cinemaName,
        filmstadenScreen: { name, filmstadenId }
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
    location,
    filmstadenScreen
  }: ShowingState) => {
    const showing: CreateShowingInput = {
      time,
      movieId,
      date: formatYMD(date),
      filmstadenScreen,
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
        <Field text="Filmstaden-stad (används för att hämta rätt tider):">
          <select
            value={city}
            onChange={({ target: { value } }) => setCity(value)}
          >
            {filmstadenCities.map(city => (
              <option key={city.alias} value={city.alias}>
                {city.name}
              </option>
            ))}
          </select>
        </Field>

        <FilmstadenShowingSelector
          date={showing.date}
          filmstadenRemoteEntityId={null}
          onChangeDate={value => setShowingValue("date", value)}
          onSelectShowing={setShowingTime}
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
