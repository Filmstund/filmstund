import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import {formatShowingDateTime} from "./lib/dateTools";
import PosterBox from "./PosterBox";

const VerticalPaddingContainer = styled.div`
  padding: 1em 0;
`;


const Showing = ({ movie = {}, showing: { date, admin, location }, dispatch, ...props }) => (
    <div {...props}>
        <PosterBox headerText={movie.title} poster={movie.poster}>
            <VerticalPaddingContainer>
                {formatShowingDateTime(date)}<br/>
                {location.name}<br/>
            </VerticalPaddingContainer>
            {admin &&
                <span>Skapad av {admin.nick}</span>
            }
        </PosterBox>
    </div>
);


const StyledShowing = styled(Showing)`
   &:not(:last-child) { margin-bottom: 1em; }
`;

const mapStateToProps = (state, { showing }) => ({
    movie: state.movies.data[showing.movieId]
});

export default connect(mapStateToProps)(StyledShowing)