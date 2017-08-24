import React, { PureComponent } from "react";
import { connect } from "react-redux";

import {
  showings as showingActions,
  movies as movieActions,
  users as userActions
} from "../../store/reducers";
import { getShowing } from "../../store/reducers/showings";

import Loader from "../../ProjectorLoader";
import SingleShowing from "./SingleShowing";

class ShowingLoader extends PureComponent {
  componentWillMount() {
    let { admin: adminId, movieId } = this.props.showing || {};

    if (adminId) {
      this.props.requestUser(adminId);
    }
    if (movieId) {
      this.props.requestMovie(movieId);
    }

    this.props.requestShowing(this.props.showingId).then(showing => {
      if (showing.adminId !== adminId) {
        this.props.requestUser(showing.adminId);
      }
      if (showing.movieId !== movieId) {
        this.props.requestMovie(showing.movieId);
      }
    });
  }
  render() {
    const { admin, showing, movie } = this.props;

    if (admin && showing && movie) {
      return <SingleShowing {...this.props} />;
    } else {
      return <Loader />;
    }
  }
}

export default connect(
  (state, props) => {
    const { showingId } = props.match.params;
    const showing = getShowing(state, showingId);

    const adminId = showing && showing.admin;
    const movieId = showing && showing.movieId;

    return {
      showingId,
      adminId,
      showing,
      movie: state.movies.data[movieId],
      admin: state.users.data[adminId],
      me: state.me.data
    };
  },
  {
    requestShowing: showingActions.actions.requestSingle,
    requestMovie: movieActions.actions.requestSingle,
    requestUser: userActions.actions.requestSingle
  }
)(ShowingLoader);
