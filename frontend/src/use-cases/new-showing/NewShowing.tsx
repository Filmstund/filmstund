import gql from "graphql-tag";
import React, { useCallback } from "react";
import { useQuery } from "react-apollo";
import { useFetchMovies } from "../../apollo/queries/movies";
import { useRouter } from "../../lib/useRouter";
import { navigateToShowing } from "../common/navigators";

import { movieFragment } from "../common/showing/Movie";
import { NewShowingQuery } from "./__generated__/NewShowingQuery";
import { CreateShowingFormFetcher } from "./CreateShowingFormFetcher";
import MovieSelector from "./MovieSelector";

const NewShowing = () => {
  const {
    history,
    match: {
      params: { movieId }
    }
  } = useRouter();

  const { data } = useAllMovies();
  const [fetchMovies] = useFetchMovies();

  const movies = data ? data.movies : [];

  const handleNavigateToShowing = useCallback(
    showing => {
      navigateToShowing(history, showing);
    },
    [history]
  );

  const clearSelectedMovie = useCallback(
    () => {
      history.push("/showings/new");
    },
    [history]
  );

  const setMovie = useCallback(
    movie => {
      history.push(`/showings/new/${movie.id}`);
    },
    [history]
  );

  if (movieId) {
    return (
      <CreateShowingFormFetcher
        movieId={movieId}
        navigateToShowing={handleNavigateToShowing}
        clearSelectedMovie={clearSelectedMovie}
      />
    );
  } else {
    return (
      <MovieSelector
        fetchMovies={fetchMovies}
        setMovie={setMovie}
        movies={movies}
      />
    );
  }
};

const useAllMovies = () =>
  useQuery<NewShowingQuery>(
    gql`
      query NewShowingQuery {
        movies: allMovies {
          ...Movie
          id
          popularity
          releaseDate
        }
      }
      ${movieFragment}
    `,
    {
      fetchPolicy: "cache-and-network"
    }
  );

export default NewShowing;
