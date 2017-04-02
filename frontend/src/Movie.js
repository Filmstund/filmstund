import React from "react";
import styled from "styled-components";
import {formatShowingDate, getTodaysDate, showingDateToString} from "./lib/dateTools";
import PosterBox from "./PosterBox";

const VerticalPaddingContainer = styled.div`
  padding: 1em 0;
`;

const now = getTodaysDate();

const renderPremiereDate = (releaseDate) => {

    const showingDate = showingDateToString(releaseDate);
    const formattedDate = formatShowingDate(releaseDate);

    if (showingDate > now) {
        return "Premiär " + formattedDate;
    } else {
        return null;
    }
};



const Movie = ({ className, movie: { poster, title, releaseDate } }) => (
    <div className={className}>
        <PosterBox headerText={title} poster={poster}>
            <VerticalPaddingContainer>
                {renderPremiereDate(releaseDate)}
            </VerticalPaddingContainer>
        </PosterBox>
    </div>
);


export default styled(Movie)`
   &:not(:last-child) { margin-bottom: 1em; }
`;
