import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import Helmet from "react-helmet";
import { movies as movieActions, users as userActions } from "./store/reducers";
import { formatShowingDateTime } from "./lib/dateTools";
import withLoader from "./lib/withLoader";
import PosterBox from "./PosterBox";

const VerticalPaddingContainer = styled.div`padding: 1em 0;`;

const Status = styled.div`
  position: absolute;
  right: 1em;
  top: 1em;
`

const capitilized = (s) => s.substring(0, 1).toUpperCase() + s.substring(1);

export const getStatus = (showing) => {
  if (showing.ticketsBought) {
    return 'bokad'
  } else {
    return 'planeras'
  }
};


const Showing = ({
  movie = {},
  movieId,
  date,
  admin,
  setTitleTag = false,
  adminId,
  status,
  location,
  disabled,
  onClick,
  dispatch,
  ...props
}) =>
  <div {...props}>
    {setTitleTag &&
      <Helmet title={`${movie.title} ${formatShowingDateTime(date)}`} />}
    <PosterBox headerText={movie.title} poster={movie.poster} onClick={onClick}>
      {status && <Status>{capitilized(status)}</Status>}
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
  </div>;

const StyledShowing = styled(Showing)`
   position: relative;
   &:not(:last-child) { margin-bottom: 1em; }
   opacity: ${props => (props.disabled ? 0.5 : 1)};
`;

const mapStateToProps = (state, { movieId, adminId }) => ({
  movie: { ...state.movies, data: state.movies.data[movieId] },
  admin: { ...state.users, data: state.users.data[adminId] }
});

export default connect(mapStateToProps)(
  withLoader({
    movie: ["movieId", movieActions.actions.requestSingle],
    admin: ["adminId", userActions.actions.requestSingle]
  })(StyledShowing)
);
