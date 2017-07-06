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
import { GrayButton } from "../MainButton";

import Field from "../Field";
import Input from "../Input";

const Debugging = styled.div`
  background-color: #f5f5f5;
  padding: 1em;
  border: solid 1px #e0e0e0;
  margin: 0 1em 1em;
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
      return <Loader size={70} color="#b71c1c" />;
    } else {
      return <GrayButton onClick={this.requestSFData}>Uppdatera data från SF</GrayButton>;
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
    const { meta } = this.props;
    const { searchTerm } = this.state;

    return (
      <div>
        <Header>Skapa besök</Header>
        <Debugging>
          {this.renderRequestButton()}
          Senaste uppdatering:{" "}
          {(!meta.timestamp && "aldrig") ||
          moment(meta.timestamp).format("YYYY-MM-DD HH:mm")}
        </Debugging>
        <Field text="Sök:">
          <Input type="text" onChange={this.setSearchTerm} placeholder="Vilken film vill du se?" value={searchTerm} />
        </Field>
        {orderBy(movies, ["popularity", "releaseDate"], ["desc", "asc"])
          .filter(m => this.searchFilter(m))
          .map(m =>
            <Movie
              key={m.id}
              movie={m}
              onClick={() => this.setState({ movieId: m.id })}
            />
          )}
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
