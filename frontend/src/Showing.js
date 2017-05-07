import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import _ from "lodash";
import { movies as movieActions, users as userActions } from "./store/reducers"
import {formatShowingDateTime} from "./lib/dateTools";
import withLoader from "./lib/withLoader"
import PosterBox from "./PosterBox";

const VerticalPaddingContainer = styled.div`
  padding: 1em 0;
`;


const Showing = ({ movie = {}, movieId, date, admin, adminId, location, disabled, onClick, dispatch, ...props }) => (
    <div {...props}>
        <PosterBox headerText={movie.title} poster={movie.poster} onClick={disabled ? () => {} : onClick}>
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

const mapStateToProps = (state, { movieId, adminId }) => ({
    movie: { ...state.movies, data: state.movies.data[movieId] },
    admin: { ...state.users, data: state.users.data[adminId] }
});


export default connect(mapStateToProps)(withLoader({
    movie: ['movieId', movieActions.actions.requestSingle],
    admin: ['adminId', userActions.actions.requestSingle]
})(StyledShowing))