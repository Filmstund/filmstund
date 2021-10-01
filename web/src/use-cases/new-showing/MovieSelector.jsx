import React, { useCallback, useMemo } from "react";

import { orderBy } from "lodash";
import Header from "../common/ui/Header";
import { ShowingsGrid } from "../common/ui/ShowingsGrid";
import Movie from "../common/showing/Movie";
import styled from "@emotion/styled";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons/faSyncAlt";

import Field from "../common/ui/Field";
import Input from "../common/ui/Input";
import { useStateWithHandleChange } from "../common/utils/useStateWithHandleChange";
import { useFetchingStatus } from "../common/utils/useFetchingStatus";
import { PageTitle } from "../common/utils/PageTitle";
import { MEDIUM_FONT_SIZE } from "../../lib/style-vars";

const SearchField = styled(Field)`
  max-width: 100%;
`;

const RefreshButton = styled.button`
  -webkit-appearance: none;
  background: none;
  border: 0;
  color: #b71c1c;
  font-size: ${MEDIUM_FONT_SIZE};
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
    (movie) => {
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
    [filterFn, movies]
  );

  return (
    <>
      <PageTitle title="Skapa besök" />
      <FlexHeader>
        <RefreshButton role="button" onClick={requestData}>
          <FontAwesomeIcon icon={faSyncAlt} spin={fetching} />
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
        {filteredAndOrderedMovies.map((m) => (
          <StyledMovie key={m.id} movie={m} onClick={() => setMovie(m)} />
        ))}
      </ShowingsGrid>
    </>
  );
};

export default MovieSelector;
