import React from "react";
import styled from "styled-components";
import {formatShowingDateTime} from "./lib/dateTools";
import PosterBox from "./PosterBox";

const VerticalPaddingContainer = styled.div`
  padding: 1em 0;
`;


const Showing = ({ className, poster, showing: { date, time, admin, movie, location } }) => (
    <div className={className}>
        <PosterBox headerText={movie.title} poster={poster}>
            <VerticalPaddingContainer>
                {formatShowingDateTime(date, time)}<br/>
                {location.name}<br/>
            </VerticalPaddingContainer>
            Bokat av {admin.nick}
        </PosterBox>
    </div>
);

Showing.defaultProps = {
    poster: "https://images-na.ssl-images-amazon.com/images/M/MV5BMjI1MjkzMjczMV5BMl5BanBnXkFtZTgwNDk4NjYyMTI@._V1_SY1000_CR0"
};


export default styled(Showing)`
   &:not(:last-child) { margin-bottom: 1em; }
`;
