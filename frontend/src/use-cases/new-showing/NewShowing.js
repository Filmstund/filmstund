import React, { useCallback } from "react";
import { withRouter } from "react-router";

import { movieFragment } from "../common/showing/Movie";
import CreateShowingForm from "./CreateShowingForm";

import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import { fetchMovies } from "../../apollo/queries/movies";
import { navigateToShowing } from "../common/navigators/index";
import MovieSelector from "./MovieSelector";

const NewShowing = props => {
  const {
    data: { movies = [] },
    match: {
      params: { movieId }
    },
    fetchMovies,
    history
  } = props;

  const handleNavigateToShowing = useCallback(showing => {
    navigateToShowing(history, showing);
  });

  const clearSelectedMovie = useCallback(() => {
    history.push("/showings/new");
  });

  const setMovie = useCallback(movie => {
    history.push(`/showings/new/${movie.id}`);
  });

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
  withRouter,
  data,
  fetchMovies
)(NewShowing);
