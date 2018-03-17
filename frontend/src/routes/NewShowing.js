import React, { Component } from "react";
import { orderBy } from "lodash";
import Helmet from "react-helmet";
import styled from "styled-components";
import { withRouter } from "react-router";

import Header from "../Header";
import { ShowingsGrid } from "../ShowingsGrid";
import Movie, { movieFragment } from "../Movie";
import CreateShowingForm from "../CreateShowingForm";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faSync from "@fortawesome/fontawesome-free-solid/faSyncAlt";

import Field from "../Field";
import Input from "../Input";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import { fetchMovies } from "../fragments/movies";
import { navigateToShowing } from "../navigators/index";
import { PageWidthWrapper } from "../PageWidthWrapper";

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
  width: 100%;

  @media (min-width: 610px) {
    max-width: 50%;
  }

  @media (min-width: 910px) {
    max-width: 18em;
  }
`;

class NewShowing extends Component {
  state = {
    searchTerm: ""
  };

  requestSFData = () => {
    this.setState({ requestingData: true });
    this.props.fetchMovies().then(() => {
      this.setState({ requestingData: false });
    });
  };

  setSearchTerm = term => {
    this.setState({
      searchTerm: term.target.value
    });
  };

  searchFilter(m) {
    const { searchTerm } = this.state;

    const lowerCaseTerm = searchTerm.toLowerCase();

    if (searchTerm && searchTerm.length > 0) {
      if (m.title.toLowerCase().search(lowerCaseTerm) > -1) {
        return true;
      }

      return false;
    }

    return true;
  }

  renderSelectMovie = movies => {
    const { searchTerm, requestingData } = this.state;

    return (
      <PageWidthWrapper>
        <Helmet title="Skapa besök" />
        <FlexHeader>
          <RefreshButton role="button" onClick={this.requestSFData}>
            <FontAwesomeIcon icon={faSync} spin={requestingData} />
          </RefreshButton>
          Skapa besök
        </FlexHeader>
        <SearchField>
          <Input
            type="text"
            onChange={this.setSearchTerm}
            placeholder="Vilken film vill du se?"
            value={searchTerm}
          />
        </SearchField>
        <ShowingsGrid>
          {orderBy(movies, ["popularity", "releaseDate"], ["desc", "asc"])
            .filter(m => this.searchFilter(m))
            .map(m => (
              <StyledMovie
                key={m.id}
                movie={m}
                onClick={() => this.setMovie(m)}
              />
            ))}
        </ShowingsGrid>
      </PageWidthWrapper>
    );
  };

  setMovie = movie => {
    this.props.history.push(`/showings/new/${movie.id}`);
  };

  navigateToShowing = showing => {
    navigateToShowing(this.props.history, showing);
  };

  clearSelectedMovie = () => {
    this.props.history.push(`/showings/new`);
  };

  render() {
    const {
      data: { movies = [] },
      match: { params: { movieId } }
    } = this.props;

    if (movieId) {
      return (
        <CreateShowingForm
          movieId={movieId}
          navigateToShowing={this.navigateToShowing}
          clearSelectedMovie={this.clearSelectedMovie}
        />
      );
    } else {
      return this.renderSelectMovie(movies);
    }
  }
}

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

export default compose(withRouter, data, fetchMovies)(NewShowing);
