import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import {formatShowingDateTime} from "./lib/dateTools";
import PosterBox from "./PosterBox";

const VerticalPaddingContainer = styled.div`
  padding: 1em 0;
`;


const Showing = ({ movie = {}, movieId, date, admin, adminId, location, disabled, onClick, dispatch, ...props }) => (
    <div onClick={disabled ? () => {} : onClick} {...props}>
        <PosterBox headerText={movie.title} poster={movie.poster}>
            <VerticalPaddingContainer>
                {formatShowingDateTime(date)}<br/>
                {location}<br/>
            </VerticalPaddingContainer>
            {admin &&
                <span>Skapad av {admin.nick || admin.name}</span>
            }
        </PosterBox>
    </div>
);


const StyledShowing = styled(Showing)`
   &:not(:last-child) { margin-bottom: 1em; }
   opacity: ${props => props.disabled ? 0.5 : 1};
`;

const mapStateToProps = (state, { movie, movieId, adminId }) => ({
    movie: movie || state.movies.data[movieId],
    admin: state.users.data[adminId]
});

export default connect(mapStateToProps)(StyledShowing)