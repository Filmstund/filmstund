import React, { Component } from "react";
import { connect } from "react-redux";
import { values, orderBy, groupBy } from "lodash";
import moment from "moment";
import Helmet from "react-helmet";

import { getTodaysDate } from "../lib/dateTools";
import {
  showings as showingActions,
  movies as movieActions
} from "../store/reducers";

import Header from "../Header";
import Showing from "../Showing";
import { Link } from "../MainButton";

const today = getTodaysDate();

class Showings extends Component {
  componentWillMount() {
    this.props.dispatch(showingActions.actions.requestIndex());
    this.props.dispatch(movieActions.actions.requestIndex());
  }

  navigateToShowing = showing => {
    this.props.history.push(`/showings/${showing.id}`);
  };

  renderShowings = (showings, disabled) => {
    return orderBy(showings, ["date"], ["asc"]).map(showing =>
      <Showing
        showingId={showing.id}
        key={showing.id}
        onClick={() => this.navigateToShowing(showing)}
        ticketsBought={showing.ticketsBought}
        movieId={showing.movieId}
        disabled={disabled}
        date={showing.date}
        adminId={showing.admin}
        location={showing.location.name}
      />
    );
  };

  render() {
    const { className, showings = [] } = this.props;

    const { previous, upcoming } = groupBy(
      showings,
      s => (moment(s.date).isBefore(today) ? "previous" : "upcoming")
    );

    return (
      <div className={className}>
        <Helmet title="Alla besök" />
        <Link to="/showings/new">Skapa nytt besök</Link>
        <Header>Aktuella besök</Header>
        {this.renderShowings(upcoming, false)}
        <Header>Tidigare besök</Header>
        {this.renderShowings(previous, true)}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  showings: values(state.showings.data)
});

export default connect(mapStateToProps)(Showings);
