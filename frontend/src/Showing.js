import React from "react";
import styled from "styled-components";
import Helmet from "react-helmet";
import { formatShowingDateTime } from "./lib/dateTools";
import PosterBox from "./PosterBox";
import withShowingLoader from "./loaders/ShowingLoader";

const VerticalPaddingContainer = styled.div`padding: 1em 0;`;

const Status = styled.div`
  position: absolute;
  right: 1em;
  top: 1em;
`;

const capitilized = s => s.substring(0, 1).toUpperCase() + s.substring(1);

export const getStatus = showing => {
  if (showing.ticketsBought) {
    return "bokad";
  } else {
    return "planeras";
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
  status,
  location,
  disabled,
  onClick
}) =>
  <StyledShowing disabled={disabled}>
    {setTitleTag &&
      <Helmet title={`${movie.title} ${formatShowingDateTime(date)}`} />}
    <PosterBox headerText={movie.title} poster={movie.poster} onClick={onClick}>
      {status &&
        <Status>
          {capitilized(status)}
        </Status>}
      <VerticalPaddingContainer>
        {formatShowingDateTime(date)}
        <br />
        {location}
        <br />
      </VerticalPaddingContainer>
      {admin &&
        <span>
          Skapad av {admin.nick || admin.name}
        </span>}
    </PosterBox>
  </StyledShowing>;

export default withShowingLoader(Showing);
