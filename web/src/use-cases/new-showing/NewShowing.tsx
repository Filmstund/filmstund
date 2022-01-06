import React, { useCallback } from "react";
import MovieSelector from "./MovieSelector";
import { useSearchParams } from "react-router-dom";
import { CreateShowingForm } from "./CreateShowingForm";

const NewShowing = () => {
  const [searchParams, setSearchParams] = useSearchParams({ movieID: "" });

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
    return <MovieSelector setMovie={setMovie} />;
  }
};

export default NewShowing;
