import React, { Component } from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import { orderBy, groupBy } from "lodash";
import { compose } from "recompose";
import moment from "moment";
import Helmet from "react-helmet";

import { getTodaysDate } from "../lib/dateTools";

import Header from "../Header";
import Showing, { showingFragment } from "../Showing";
import { Link } from "../MainButton";

const showingDate = showing => showing.date + " " + showing.time;

const today = getTodaysDate();

class Showings extends Component {
  navigateToShowing = showing => {
    this.props.history.push(`/showings/${showing.id}`);
  };

  renderShowings = (showings, disabled) => {
    return orderBy(showings, [showingDate], ["asc"]).map(showing => (
      <Showing
        showingId={showing.id}
        key={showing.id}
        onClick={() => this.navigateToShowing(showing)}
        ticketsBought={showing.ticketsBought}
        movie={showing.movie}
        disabled={disabled}
        date={showingDate(showing)}
        adminId={showing.admin}
        location={showing.location.name}
      />
    ));
  };

  render() {
    const { className, data: { showings = [] } } = this.props;

    const { previous, upcoming } = groupBy(
      showings,
      s => (moment(showingDate(s)).isBefore(today) ? "previous" : "upcoming")
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

const data = graphql(gql`
  query ShowingsQuery {
    showings: publicShowings {
      ...Showing
      id
      admin
      date
      time
    }
  }
  ${showingFragment}
`);

export default compose(data)(Showings);
