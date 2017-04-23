import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import {formatShowingDateTime} from "./lib/dateTools";
import PosterBox from "./PosterBox";

const VerticalPaddingContainer = styled.div`
  padding: 1em 0;
`;


const Showing = ({ movie = {}, movieId, date, admin, location, dispatch, ...props }) => (
    <div {...props}>
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
`;

const mapStateToProps = (state, { movie, movieId }) => ({
    movie: movie || state.movies.data[movieId]
});

export default connect(mapStateToProps)(StyledShowing)