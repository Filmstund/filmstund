import { gql, useQuery } from "@apollo/client";
import React, { useCallback } from "react";
import { useFetchMovies } from "../../apollo/queries/movies";

import { movieFragment } from "../common/showing/Movie";
import { NewShowingQueryQuery } from "../../__generated__/types";
import MovieSelector from "./MovieSelector";
import { useSearchParams } from "react-router-dom";
import { CreateShowingForm } from "./CreateShowingForm";

const NewShowing = () => {
  const [searchParams, setSearchParams] = useSearchParams({ movieID: "" });

  const { data } = useAllMovies();
  const [fetchMovies] = useFetchMovies();

  const movies = data?.movies ?? [];

  const clearSelectedMovie = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const setMovie = useCallback(
    (movie) => {
      setSearchParams({ movieID: movie.id });
    },
    [setSearchParams]
  );

  const movieID = searchParams.get("movieID") || null;

  if (movieID) {
    return (
      <CreateShowingForm
        movieID={movieID}
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
  useQuery<NewShowingQueryQuery>(
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
      fetchPolicy: "cache-and-network",
    }
  );

export default NewShowing;
