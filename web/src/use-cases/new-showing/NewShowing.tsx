import { gql, useQuery } from "@apollo/client";
import React, { useCallback } from "react";
import { useFetchMovies } from "../../apollo/queries/movies";
import { navigateToShowing } from "../common/navigators";

import { movieFragment } from "../common/showing/Movie";
import { NewShowingQuery } from "./__generated__/NewShowingQuery";
import { CreateShowingFormFetcher } from "./CreateShowingFormFetcher";
import MovieSelector from "./MovieSelector";
import { useHistory, useParams } from "react-router-dom";

const NewShowing = () => {
  const history = useHistory();
  const { movieId } = useParams<{ movieId: string }>();

  const { data } = useAllMovies();
  const [fetchMovies] = useFetchMovies();

  const movies = data ? data.movies : [];

  const handleNavigateToShowing = useCallback(
    (showing) => {
      navigateToShowing(history, showing);
    },
    [history]
  );

  const clearSelectedMovie = useCallback(() => {
    history.push("/showings/new");
  }, [history]);

  const setMovie = useCallback(
    (movie) => {
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
      fetchPolicy: "cache-and-network",
    }
  );

export default NewShowing;
