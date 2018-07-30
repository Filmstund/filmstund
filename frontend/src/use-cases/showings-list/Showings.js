import React, { Component } from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import orderBy from "lodash/orderBy";
import groupBy from "lodash/groupBy";
import { compose } from "recompose";
import Helmet from "react-helmet";

import { getTodaysDate } from "../../lib/dateTools";

import { RedHeader } from "../common/ui/RedHeader";
import { ShowingNeue } from "../common/showing/ShowingNeue";
import { Link } from "../common/ui/MainButton";
import {
  navigateToShowing,
  navigateToShowingTickets
} from "../common/navigators/index";
import { PageWidthWrapper } from "../common/ui/PageWidthWrapper";
import { ShowingsGrid } from "../common/ui/ShowingsGrid";
import isBefore from "date-fns/is_before";
import { EmptyList } from "../common/ui/EmptyList";

const showingDate = showing => showing.date + " " + showing.time;

const today = getTodaysDate();

class Showings extends Component {
  navigateToShowing = showing => {
    navigateToShowing(this.props.history, showing);
  };

  navigateToTickets = showing => {
    navigateToShowingTickets(this.props.history, showing);
  };

  renderShowings = (showings, order, disabled) => {
    if (showings.length === 0) {
      return <EmptyList />;
    }
    return (
      <ShowingsGrid>
        {orderBy(showings, [showingDate], [order]).map(showing => (
          <ShowingNeue
            key={showing.id}
            showing={showing}
            onClick={() => this.navigateToShowing(showing)}
            onClickTickets={() => this.navigateToTickets(showing)}
            disabled={disabled}
          />
        ))}
      </ShowingsGrid>
    );
  };

  render() {
    const {
      data: { showings = [] }
    } = this.props;

    const { previous = [], upcoming = [] } = groupBy(
      showings,
      s => (isBefore(showingDate(s), today) ? "previous" : "upcoming")
    );

    return (
      <PageWidthWrapper>
        <Helmet title="Alla besök" />
        <Link to="/showings/new">Skapa nytt besök</Link>
        <RedHeader>Aktuella besök</RedHeader>
        {this.renderShowings(upcoming, "asc", false)}
        <RedHeader>Tidigare besök</RedHeader>
        {this.renderShowings(previous, "desc", true)}
      </PageWidthWrapper>
    );
  }
}

const data = graphql(
  gql`
    query ShowingsQuery {
      showings: publicShowings {
        ...ShowingNeue
        id
        webId
        slug
        date
        time
      }
    }
    ${ShowingNeue.fragments.showing}
  `,
  {
    options: { fetchPolicy: "cache-and-network" }
  }
);

export default compose(data)(Showings);