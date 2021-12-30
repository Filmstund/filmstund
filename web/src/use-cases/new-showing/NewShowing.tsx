import { gql, useQuery } from "@apollo/client";
import React, { useCallback } from "react";
import { useFetchMovies } from "../../apollo/queries/movies";

import { movieFragment } from "../common/showing/Movie";
import { NewShowingQuery } from "./__generated__/NewShowingQuery";
import MovieSelector from "./MovieSelector";
import { useSearchParams } from "react-router-dom";
import { CreateShowingForm } from "./CreateShowingForm";

const NewShowing = () => {
  const [searchParams, setSearchParams] = useSearchParams({ movieId: "" });

  const { data } = useAllMovies();
  const [fetchMovies] = useFetchMovies();

  const movies = data?.movies ?? [];

  const clearSelectedMovie = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const setMovie = useCallback(
    (movie) => {
      setSearchParams({ movieId: movie.id });
    },
    [setSearchParams]
  );

  const movieId = searchParams.get("movieId") || null;

  if (movieId) {
    return (
      <CreateShowingForm
        movieId={movieId}
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
      fetchPolicy: "cache-and-network",
    }
  );

export default NewShowing;
