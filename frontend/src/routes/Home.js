import React, { Component } from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import styled from "styled-components";
import moment from "moment";
import { compose } from "recompose";
import { orderBy } from "lodash";
import Helmet from "react-helmet";

import { Link } from "../MainButton";
import { ShowingNeue, showingFragment } from "../ShowingNeue";
import { RedHeader } from "../RedHeader";
import { getTodaysDate } from "../lib/dateTools";

const showingDate = showing => showing.date + " " + showing.time;

const today = getTodaysDate();

const EmptyList = styled.div`
  display: flex;
  font-size: 15px;
  font-family: Roboto, sans-serif;
  justify-content: center;
  align-items: center;
  color: #9b9b9b;
  height: 50px;
`;

class Home extends Component {
  navigateToShowing = showing => {
    this.props.history.push(`/showings/${showing.id}`);
  };

  navigateToTickets = showing => {
    this.props.history.push(`/showings/${showing.id}/tickets`);
  };

  renderShowings = showings => {
    if (showings.length === 0) {
      return <EmptyList>Inga visningar</EmptyList>;
    }
    return orderBy(showings, [showingDate], ["asc"]).map(showing => (
      <ShowingNeue
        showing={showing}
        onClick={() => this.navigateToShowing(showing)}
        onClickTickets={() => this.navigateToTickets(showing)}
        disabled={moment(showingDate(showing)).isBefore(today)}
        key={showing.id}
      />
    ));
  };

  renderCreatedByMe = showings => {
    const { data: { me } } = this.props;
    const myShowings = showings.filter(s => s.admin.id === me.id);

    return this.renderShowings(myShowings);
  };

  renderParticipatedByMe = showings => {
    const { data: { me } } = this.props;
    const myShowings = showings.filter(
      s =>
        s.participants.some(p => p.user.id === me.id) &&
        moment(showingDate(s)).isAfter(today)
    );

    return this.renderShowings(myShowings);
  };

  renderPrevParticipatedByMe = showings => {
    const { data: { me } } = this.props;
    const myShowings = showings.filter(
      s =>
        s.participants.some(p => p.user.id === me.id) &&
        moment(showingDate(s)).isBefore(today)
    );

    return this.renderShowings(myShowings);
  };

  render() {
    const { data: { showings = [] } } = this.props;
    return (
      <React.Fragment>
        <Helmet title="Mina Besök" />
        <Link to="/showings/new">Skapa nytt besök</Link>
        <RedHeader>Mina kommande besök</RedHeader>
        {this.renderParticipatedByMe(showings)}
        <RedHeader>Mina tidigare besök</RedHeader>
        {this.renderPrevParticipatedByMe(showings)}
        <RedHeader>Besök jag har skapat</RedHeader>
        {this.renderCreatedByMe(showings)}
      </React.Fragment>
    );
  }
}

const data = graphql(
  gql`
    query HomeQuery {
      showings: publicShowings {
        ...Showing
        id
        date
        time
        admin {
          id
        }
        participants {
          user {
            id
          }
        }
      }
      me: currentUser {
        id
      }
    }
    ${showingFragment}
  `,
  {
    options: { fetchPolicy: "cache-and-network" }
  }
);

export default compose(data)(Home);
