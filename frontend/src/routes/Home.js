import React, { Component } from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import styled from "styled-components";
import isAfter from "date-fns/is_after";
import isBefore from "date-fns/is_before";
import { compose } from "recompose";
import orderBy from "lodash-es/orderBy";
import Helmet from "react-helmet";

import { Link } from "../MainButton";
import { Jumbotron, JumbotronBackground } from "./Jumbotron";
import { ShowingNeue, showingFragment } from "../ShowingNeue";
import { RedHeader } from "../RedHeader";
import { getTodaysDate, formatYMD } from "../lib/dateTools";
import {
  navigateToShowing,
  navigateToShowingTickets
} from "../navigators/index";
import { PageWidthWrapper } from "../PageWidthWrapper";
import { ShowingsGrid } from "../ShowingsGrid";

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

const ItsHappeningTitle = styled.h1`
  color: #fff;
  font-size: 64px;
  font-weight: 300;
  font-family: Roboto;

  @media (max-width: 50rem) {
    font-size: 40px;
  }
  @media (max-width: 30rem) {
    display: none;
  }
`;

class Home extends Component {
  navigateToShowing = showing => {
    navigateToShowing(this.props.history, showing);
  };

  navigateToTickets = showing => {
    navigateToShowingTickets(this.props.history, showing);
  };

  renderShowings = (showings, order) => {
    if (showings.length === 0) {
      return <EmptyList>Inga besök</EmptyList>;
    }
    return (
      <ShowingsGrid>
        {orderBy(showings, [showingDate], [order]).map(showing => (
          <ShowingNeue
            showing={showing}
            onClick={() => this.navigateToShowing(showing)}
            onClickTickets={() => this.navigateToTickets(showing)}
            disabled={isBefore(showingDate(showing), today)}
            key={showing.id}
          />
        ))}
      </ShowingsGrid>
    );
  };

  renderCreatedByMe = showings => {
    const {
      data: { me }
    } = this.props;
    const myShowings = showings.filter(s => s.admin.id === me.id);

    return this.renderShowings(myShowings, "desc");
  };

  renderParticipatedByMe = showings => {
    const {
      data: { me }
    } = this.props;
    const myShowings = showings.filter(
      s =>
        s.participants.some(p => p.user.id === me.id) &&
        isAfter(showingDate(s), today)
    );

    return this.renderShowings(myShowings, "asc");
  };

  renderPrevParticipatedByMe = showings => {
    const {
      data: { me }
    } = this.props;
    const myShowings = showings.filter(
      s =>
        s.participants.some(p => p.user.id === me.id) &&
        isBefore(showingDate(s), today)
    );

    return this.renderShowings(myShowings, "desc");
  };

  render() {
    const {
      data: { showings = [] }
    } = this.props;

    const todayShowing = showings.filter(
      s => formatYMD(showingDate(s)) === formatYMD(today)
    );

    return (
      <React.Fragment>
        <Helmet title="Mina Besök" />
        {todayShowing.length > 0 && (
          <JumbotronBackground>
            <PageWidthWrapper>
              <Jumbotron>
                <ShowingNeue
                  showing={todayShowing[0]}
                  onClick={() => this.navigateToShowing(todayShowing[0])}
                />
                <ItsHappeningTitle>
                  It's happening!{" "}
                  <span role="img" aria-label="heart eyes emoji">
                    😍
                  </span>
                </ItsHappeningTitle>
              </Jumbotron>
            </PageWidthWrapper>
          </JumbotronBackground>
        )}
        <PageWidthWrapper>
          <Link to="/showings/new">Skapa nytt besök</Link>
          <RedHeader>Mina kommande besök</RedHeader>

          {this.renderParticipatedByMe(showings)}
          <RedHeader>Mina tidigare besök</RedHeader>
          {this.renderPrevParticipatedByMe(showings)}
          <RedHeader>Besök jag har skapat</RedHeader>
          {this.renderCreatedByMe(showings)}
        </PageWidthWrapper>
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
        webId
        slug
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
