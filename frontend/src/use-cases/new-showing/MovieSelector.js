import React, { useState, useCallback, useMemo } from "react";

import { orderBy } from "lodash-es";
import Helmet from "react-helmet";
import Header from "../common/ui/Header";
import { ShowingsGrid } from "../common/ui/ShowingsGrid";
import Movie from "../common/showing/Movie";
import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import faSync from "@fortawesome/fontawesome-free-solid/faSyncAlt";

import Field from "../common/ui/Field";
import Input from "../common/ui/Input";
import { PageWidthWrapper } from "../common/ui/PageWidthWrapper";

const SearchField = styled(Field)`
  max-width: 100%;
`;

const RefreshButton = styled.button`
  -webkit-appearance: none;
  background: none;
  border: 0;
  color: #b71c1c;
  font-size: 16pt;
  padding: 0 0.5em;
  cursor: pointer;
`;

const FlexHeader = styled(Header)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledMovie = styled(Movie)`
  padding: 0.5em;
`;

const MovieSelector = ({ movies, setMovie, fetchMovies }) => {
  const [searchTerm, handleChangeSearchTerm] = useStateWithHandleChange("");
  const [fetching, requestData] = useFetchingStatus(fetchMovies);

  const filterFn = useCallback(
    movie => {
      const lowerCaseTerm = searchTerm.toLowerCase();
      if (searchTerm && searchTerm.length > 0) {
        return movie.title.toLowerCase().indexOf(lowerCaseTerm) !== -1;
      }
      return true;
    },
    [searchTerm]
  );

  const filteredAndOrderedMovies = useMemo(
    () =>
      orderBy(movies, ["popularity", "releaseDate"], ["desc", "asc"]).filter(
        filterFn
      ),
    [movies, searchTerm]
  );

  return (
    <PageWidthWrapper>
      <Helmet title="Skapa besök" />
      <FlexHeader>
        <RefreshButton role="button" onClick={requestData}>
          <FontAwesomeIcon icon={faSync} spin={fetching} />
        </RefreshButton>
        Skapa besök
      </FlexHeader>
      <SearchField>
        <Input
          type="text"
          onChange={handleChangeSearchTerm}
          placeholder="Vilken film vill du se?"
          value={searchTerm}
        />
      </SearchField>
      <ShowingsGrid>
        {filteredAndOrderedMovies.map(m => (
          <StyledMovie key={m.id} movie={m} onClick={() => setMovie(m)} />
        ))}
      </ShowingsGrid>
    </PageWidthWrapper>
  );
};

const useStateWithHandleChange = initialValue => {
  const [value, setValue] = useState(initialValue);
  const handleChange = useCallback(event => {
    setValue(event.target.value);
  }, []);

  return [value, handleChange, setValue];
};

const useFetchingStatus = perform => {
  const [fetching, setFetching] = useState(false);

  const requestData = useCallback((...args) => {
    setFetching(true);
    return perform(...args).then(result => {
      setFetching(false);
      return result;
    });
  });

  return [fetching, requestData];
};

export default MovieSelector;
