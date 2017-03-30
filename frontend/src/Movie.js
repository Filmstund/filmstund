import React from "react";
import styled from "styled-components";
import {formatShowingDate} from "./lib/dateTools";
import PosterBox from "./PosterBox";

const VerticalPaddingContainer = styled.div`
  padding: 1em 0;
`;


const Movie = ({ className, movie: { poster, title, releaseDate } }) => (
    <div className={className}>
        <PosterBox headerText={title} poster={poster}>
            <VerticalPaddingContainer>
                Premiär {formatShowingDate(releaseDate)}
            </VerticalPaddingContainer>
        </PosterBox>
    </div>
);


export default styled(Movie)`
   &:not(:last-child) { margin-bottom: 1em; }
`;
