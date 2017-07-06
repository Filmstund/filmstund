import React, { Component } from "react";
import { connect } from "react-redux";
import moment from "moment";
import { values, orderBy } from "lodash";

import { Link } from "../MainButton";
import Showing from "../Showing";
import Header from "../Header";

import { getTodaysDate } from "../lib/dateTools";

import { showings, movies } from "../store/reducers/index";

const today = getTodaysDate();

class Home extends Component {
  componentWillMount() {
    this.props.dispatch(showings.actions.requestIndex());
    this.props.dispatch(movies.actions.requestIndex());
  }

  navigateToShowing = showing => {
    this.props.history.push(`/showings/${showing.id}`);
  };

  renderShowings = showings => {
    return orderBy(showings, ["date"], ["desc"]).map(showing =>
      <Showing
        onClick={() => this.navigateToShowing(showing)}
        disabled={moment(showing.date).isBefore(today)}
        movieId={showing.movieId}
        key={showing.id}
        date={showing.date}
        adminId={showing.admin}
        location={showing.location.name}
      />
    );
  };

  renderCreatedByMe = showings => {
    const { me } = this.props;
    const myShowings = showings.filter(s => s.admin === me.id);

    return this.renderShowings(myShowings);
  };

  renderParticipatedByMe = showings => {
    const { me } = this.props;
    const myShowings = showings.filter(
      s => s.participants.includes(me.id) && moment(s.date).isAfter(today)
    );

    return this.renderShowings(myShowings);
  };

  renderPrevParticipatedByMe = showings => {
    const { me } = this.props;
    const myShowings = showings.filter(
        s => s.participants.includes(me.id) && moment(s.date).isBefore(today)
    );

    return this.renderShowings(myShowings);
  };

  render() {
    const { className, showings = [] } = this.props;
    return (
      <div className={className}>
        <Link to="/showings/new">Skapa nytt besök</Link>
        <Header>Mina kommande besök</Header>
        {this.renderParticipatedByMe(showings)}
        <Header>Mina tidigare besök</Header>
        {this.renderPrevParticipatedByMe(showings)}
        <Header>Besök jag har skapat</Header>
        {this.renderCreatedByMe(showings)}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  showings: values(state.showings.data),
  me: state.me.data
});

export default connect(mapStateToProps)(Home);
