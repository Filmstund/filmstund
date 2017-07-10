import React from "react";
import { connect } from "react-redux";
import { values, orderBy } from "lodash";
import moment from "moment";
import styled from "styled-components";

import { jsonRequest } from "../lib/fetch";
import { withBaseURL } from "../lib/withBaseURL";

import { movies, meta } from "../store/reducers";

import Header from "../Header";
import Loader from "../ProjectorLoader";
import Movie from "../Movie";
import CreateShowingForm from "../CreateShowingForm";

import Field from "../Field";
import Input from "../Input";

const SearchField = styled(Field)`
  max-width: 100%;
`;

const RefreshButton = styled.span`
  color: #b71c1c;
  mouse: pointer;
  font-size: 16pt;
  padding: 0 0.5em;
  cursor: pointer;
`;

const LoaderContainer = styled.div`
  display: inline;
  padding: 0 0.5em;
`;

const FlexHeader = styled(Header)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledMovie = styled(Movie)`
  max-width: 18em;
  min-width: 18em;
  padding: 0.5em;
`;

const MovieContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

class NewShowing extends React.Component {
  constructor(props) {
    super(props);
    const { match: { params: { movieId } } } = props;

    this.state = {
      movieId,
      searchTerm: ""
    };
  }

  componentWillMount() {
    this.props.dispatch(movies.actions.requestIndex());
  }

  requestSFData = () => {
    this.setState({ requestingData: true });
    jsonRequest(withBaseURL("/movies/sf/populate")).then(data => {
      this.props.dispatch(movies.actions.requestIndex());
      this.props.dispatch(meta.actions.requestSingle());
      this.setState({ requestingData: false });
    });
  };

  renderRequestButton = () => {
    if (this.state.requestingData) {
      return (
        <LoaderContainer>
          <Loader height={30} />
        </LoaderContainer>
      );
    } else {
      const { meta } = this.props;
      const lastUpdateMessage =
        "Senaste uppdatering: " +
        ((!meta.timestamp && "aldrig") ||
          moment(meta.timestamp).format("YYYY-MM-DD HH:mm"));
      return (
        <RefreshButton
          onClick={this.requestSFData}
          title={"Uppdatera data från SF.\n" + lastUpdateMessage}
        >
          <i className="fa fa-refresh" aria-hidden="true" />
        </RefreshButton>
      );
    }
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
    const { searchTerm } = this.state;

    return (
      <div>
        <FlexHeader>
          Skapa besök {this.renderRequestButton()}
        </FlexHeader>
        <SearchField>
          <Input
            type="text"
            onChange={this.setSearchTerm}
            placeholder="Vilken film vill du se?"
            value={searchTerm}
          />
        </SearchField>
        <MovieContainer>
          {orderBy(movies, ["popularity", "releaseDate"], ["desc", "asc"])
            .filter(m => this.searchFilter(m))
            .map(m =>
              <StyledMovie
                key={m.id}
                movie={m}
                onClick={() => this.setState({ movieId: m.id })}
              />
            )}
        </MovieContainer>
      </div>
    );
  };

  clearSelectedMovie = () => {
    this.setState({ movieId: null });
  };

  render() {
    const { movieId } = this.state;
    const { movies = [] } = this.props;

    if (movieId) {
      return (
        <CreateShowingForm
          movieId={movieId}
          clearSelectedMovie={this.clearSelectedMovie}
        />
      );
    } else {
      return this.renderSelectMovie(movies);
    }
  }
}

const mapStateToProps = state => ({
  movies: values(state.movies.data),
  meta: state.meta.data
});

export default connect(mapStateToProps)(NewShowing);
