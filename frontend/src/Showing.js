import React from "react";
import styled from "styled-components";
import gql from "graphql-tag";
import Helmet from "react-helmet";
import { formatShowingDateTime } from "./lib/dateTools";
import PosterBox from "./PosterBox";

const VerticalPaddingContainer = styled.div`
  padding: 1em 0;
`;

const Status = styled.div`
  position: absolute;
  right: 1em;
  top: 1em;
  font-style: ${props => (props.ticketsBought ? "" : "italic")};
`;

const capitilized = s => s.substring(0, 1).toUpperCase() + s.substring(1);

const getStatus = ticketsBought => {
  if (ticketsBought) {
    return "bokad";
  } else {
    return "preliminär";
  }
};

const StyledShowing = styled.div`
  position: relative;
  &:not(:last-child) {
    margin-bottom: 1em;
  }
  opacity: ${props => (props.disabled ? 0.5 : 1)};
`;

const Showing = ({
  movie = {},
  date,
  admin,
  setTitleTag = false,
  ticketsBought,
  location,
  disabled,
  onClick
}) => (
  <StyledShowing disabled={disabled}>
    {setTitleTag && (
      <Helmet title={`${movie.title} ${formatShowingDateTime(date)}`} />
    )}
    <PosterBox headerText={movie.title} poster={movie.poster} onClick={onClick}>
      {ticketsBought !== undefined && (
        <Status ticketsBought={ticketsBought}>
          {capitilized(getStatus(ticketsBought))}
        </Status>
      )}
      <VerticalPaddingContainer>
        {formatShowingDateTime(date)}
        <br />
        {location}
        <br />
      </VerticalPaddingContainer>
      {admin && <span>Skapad av {admin.nick || admin.name}</span>}
    </PosterBox>
  </StyledShowing>
);

export const movieFragment = gql`
  fragment ShowingMovie on Movie {
    id
    title
    poster
  }
`;

export const showingFragment = gql`
  fragment Showing on Showing {
    id
    webId
    slug
    date
    time
    location {
      name
    }
    ticketsBought
    movie {
      ...ShowingMovie
    }
    admin {
      id
      name
      nick
    }
  }
  ${movieFragment}
`;

export default Showing;
