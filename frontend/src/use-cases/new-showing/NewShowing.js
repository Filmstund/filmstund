import React, { useCallback } from "react";

import { movieFragment } from "../common/showing/Movie";
import CreateShowingForm from "./CreateShowingForm";

import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import { fetchMovies } from "../../apollo/queries/movies";
import { navigateToShowing } from "../common/navigators/index";
import MovieSelector from "./MovieSelector";
import { useRouter } from "../../lib/useRouter";

const NewShowing = props => {
  const { history } = useRouter();
  const {
    data: { movies = [] },
    match: {
      params: { movieId }
    },
    fetchMovies
  } = props;

  const handleNavigateToShowing = useCallback(
    showing => {
      navigateToShowing(history, showing);
    },
    [history]
  );

  const clearSelectedMovie = useCallback(() => {
    history.push("/showings/new");
  }, [history]);

  const setMovie = useCallback(
    movie => {
      history.push(`/showings/new/${movie.id}`);
    },
    [history]
  );

  if (movieId) {
    return (
      <CreateShowingForm
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

const data = graphql(
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
    options: {
      fetchPolicy: "cache-and-network"
    }
  }
);

export default compose(
  data,
  fetchMovies
)(NewShowing);
