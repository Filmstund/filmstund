import React, { Component } from "react";
import { graphql } from "react-apollo";
import { withRouter } from "react-router";
import gql from "graphql-tag";
import { compose } from "recompose";
import { orderBy } from "lodash-es";

import { Link } from "../common/ui/MainButton";
import { Jumbotron, JumbotronBackground } from "./Jumbotron";
import { ShowingNeue } from "../common/showing/ShowingNeue";
import { RedHeader } from "../common/ui/RedHeader";
import { getTodaysDate } from "../../lib/dateTools";
import parseISO from "date-fns/parseISO";
import isAfter from "date-fns/isAfter";
import isBefore from "date-fns/isBefore";
import isSameDay from "date-fns/isSameDay";
import subMinutes from "date-fns/subMinutes";
import {
  navigateToShowing,
  navigateToShowingTickets
} from "../common/navigators/index";
import {
  FullWidthWrapper,
  PageWidthWrapper
} from "../common/ui/PageWidthWrapper";
import { ShowingsGrid } from "../common/ui/ShowingsGrid";
import { ItsHappeningTitle } from "./ItsHappeningTitle";
import { EmptyList } from "../common/ui/EmptyList";
import { PageTitle } from "../common/utils/PageTitle";

const showingDate = showing => parseISO(showing.date + " " + showing.time);

const today = getTodaysDate();

class Home extends Component {
  navigateToShowing = showing => {
    navigateToShowing(this.props.history, showing);
  };

  navigateToTickets = showing => {
    navigateToShowingTickets(this.props.history, showing);
  };

  renderShowings = (showings, order) => {
    if (showings.length === 0) {
      return <EmptyList />;
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

    const compareTime = subMinutes(today, 30);

    const todayShowings = showings.filter(
      s =>
        isBefore(compareTime, showingDate(s)) &&
        isSameDay(compareTime, showingDate(s))
    );

    const featuredShowing = orderBy(todayShowings, [showingDate], ["asc"])[0];

    return (
      <>
        <PageTitle title="Mina Besök" />
        {featuredShowing && (
          <FullWidthWrapper>
            <JumbotronBackground>
              <Jumbotron>
                <ShowingNeue
                  showing={featuredShowing}
                  onClick={() => this.navigateToShowing(featuredShowing)}
                  onClickTickets={() => this.navigateToTickets(featuredShowing)}
                />
                <ItsHappeningTitle>
                  It's happening!{" "}
                  <span role="img" aria-label="heart eyes emoji">
                    😍
                  </span>
                </ItsHappeningTitle>
              </Jumbotron>
            </JumbotronBackground>
          </FullWidthWrapper>
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
      </>
    );
  }
}

const data = graphql(
  gql`
    query HomeQuery {
      showings: publicShowings {
        ...ShowingNeue
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
    ${ShowingNeue.fragments.showing}
  `,
  {
    options: { fetchPolicy: "cache-and-network" }
  }
);

export default compose(
  data,
  withRouter
)(Home);
