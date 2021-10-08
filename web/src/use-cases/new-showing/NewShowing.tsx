import { gql, useQuery } from "@apollo/client";
import React, { useCallback } from "react";
import { useFetchMovies } from "../../apollo/queries/movies";
import { navigateToShowing } from "../common/navigators";

import { movieFragment } from "../common/showing/Movie";
import { NewShowingQuery } from "./__generated__/NewShowingQuery";
import { CreateShowingFormFetcher } from "./CreateShowingFormFetcher";
import MovieSelector from "./MovieSelector";
import { useParams, useNavigate } from "react-router-dom";

const NewShowing = () => {
  const navigate = useNavigate();
  const { movieId } = useParams<"movieId">();

  const { data } = useAllMovies();
  const [fetchMovies] = useFetchMovies();

  const movies = data ? data.movies : [];

  const handleNavigateToShowing = useCallback(
    (showing) => {
      navigateToShowing(navigate, showing);
    },
    [navigate]
  );

  const clearSelectedMovie = useCallback(() => {
    navigate("/showings/new");
  }, [navigate]);

  const setMovie = useCallback(
    (movie) => {
      navigate(`/showings/new/${movie.id}`);
    },
    [navigate]
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
