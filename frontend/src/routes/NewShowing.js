import React from "react";
import { connect } from "react-redux";
import { values, sortBy } from "lodash";
import moment from "moment";

import { jsonRequest } from "../lib/fetch";
import { withBaseURL } from "../lib/withBaseURL";

import { movies, meta } from "../store/reducers";

import Header from "../Header";
import Loader from "../ProjectorLoader";
import Movie from "../Movie";
import CreateShowingForm from "../CreateShowingForm";

import Field from "../Field";
import Input from "../Input";

class NewShowing extends React.Component {
  constructor(props) {
    super(props);
    const { match: { params: { movieId } } } = props;

    this.state = { movieId,
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
      return <Loader size={70} color="maroon" />;
    } else {
      return <div onClick={this.requestSFData}>Uppdatera data från SF</div>;
    }
  };

  setSearchTerm = (term) => {
    this.setState({
      searchTerm: term.target.value
    })
  }

  searchFilter(m) {

    const { searchTerm } = this.state;

    const lowerCaseTerm = searchTerm.toLowerCase()

    if(searchTerm && searchTerm.length > 0) {
      if(m.title.toLowerCase().search(lowerCaseTerm) > -1) {
        return true
      }

      return false
    }

    return true

  }

  renderSelectMovie = movies => {
    const { meta } = this.props;
    const { searchTerm } = this.state


    return (
      <div>
        <Header>Skapa besök</Header>
        <Field text="Namn:">
          <Input
            type="text"
            onChange={this.setSearchTerm}
            value={searchTerm}
          />
        </Field>
        Senaste uppdatering från SF:{" "}
        {(!meta.timestamp && "aldrig") ||
          moment(meta.timestamp).format("YYYY-MM-DD HH:mm")}
        {this.renderRequestButton()}
        {sortBy(movies, "releaseDate").filter((m) => this.searchFilter(m)).map(m =>
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
