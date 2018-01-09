import React, { Component } from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import moment from "moment";
import { compose } from "recompose";
import { orderBy } from "lodash";
import Helmet from "react-helmet";

import { Link } from "../MainButton";
import Showing, { showingFragment } from "../Showing";
import Header from "../Header";

import { getTodaysDate } from "../lib/dateTools";
const showingDate = showing => showing.date + " " + showing.time;

const today = getTodaysDate();

class Home extends Component {
  navigateToShowing = showing => {
    this.props.history.push(`/showings/${showing.id}`);
  };

  renderShowings = showings => {
    return orderBy(showings, [showingDate], ["asc"]).map(showing => (
      <Showing
        showingId={showing.id}
        onClick={() => this.navigateToShowing(showing)}
        ticketsBought={showing.ticketsBought}
        disabled={moment(showingDate(showing)).isBefore(today)}
        movie={showing.movie}
        key={showing.id}
        date={showingDate(showing)}
        adminId={showing.admin}
        location={showing.location.name}
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
    const { className, data: { showings = [] } } = this.props;
    return (
      <div className={className}>
        <Helmet title="Mina Besök" />
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
