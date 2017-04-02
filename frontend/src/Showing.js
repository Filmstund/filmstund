import React from "react";
import styled from "styled-components";
import {formatShowingDateTime} from "./lib/dateTools";
import PosterBox from "./PosterBox";

const VerticalPaddingContainer = styled.div`
  padding: 1em 0;
`;


const Showing = ({ movie, showing: { date, admin, location }, ...props }) => (
    <div {...props}>
        <PosterBox headerText={movie.title} poster={movie.poster}>
            <VerticalPaddingContainer>
                {formatShowingDateTime(date)}<br/>
                {location.name}<br/>
            </VerticalPaddingContainer>
            {admin &&
                <span>Bokat av {admin.nick}</span>
            }
        </PosterBox>
    </div>
);


export default styled(Showing)`
   &:not(:last-child) { margin-bottom: 1em; }
`;
