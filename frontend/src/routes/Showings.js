import React, { Component } from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import { orderBy, groupBy } from "lodash";
import { compose } from "recompose";
import moment from "moment";
import Helmet from "react-helmet";

import { getTodaysDate } from "../lib/dateTools";

import { RedHeader } from "../RedHeader";
import { ShowingNeue, showingFragment } from "../ShowingNeue";
import { Link } from "../MainButton";

const showingDate = showing => showing.date + " " + showing.time;

const today = getTodaysDate();

class Showings extends Component {
  navigateToShowing = showing => {
    this.props.history.push(`/showings/${showing.id}`);
  };

  navigateToTickets = showing => {
    this.props.history.push(`/showings/${showing.id}/tickets`);
  };

  renderShowings = (showings, disabled) => {
    return orderBy(showings, [showingDate], ["asc"]).map(showing => (
      <ShowingNeue
        key={showing.id}
        showing={showing}
        onClick={() => this.navigateToShowing(showing)}
        onClickTickets={() => this.navigateToTickets(showing)}
        disabled={disabled}
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
        <RedHeader>Aktuella besök</RedHeader>
        {this.renderShowings(upcoming, false)}
        <RedHeader>Tidigare besök</RedHeader>
        {this.renderShowings(previous, true)}
      </div>
    );
  }
}

const data = graphql(
  gql`
    query ShowingsQuery {
      showings: publicShowings {
        ...Showing
        id
        date
        time
      }
    }
    ${showingFragment}
  `,
  {
    options: { fetchPolicy: "cache-and-network" }
  }
);

export default compose(data)(Showings);
