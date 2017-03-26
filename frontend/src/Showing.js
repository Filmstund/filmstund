import React from "react";
import styled from "styled-components";
import moment from "moment";

const Poster = styled.div`
    background-image: url(${props => props.src});
    background-size: cover;
    height: 100%;
    width: 100px;
`;

const Header = styled.h3`
    font-weight: 300;
    padding: 0;
    margin: 0;
`;

const PaddingContainer = styled.div`
  padding: 1em;
`;
const VerticalPaddingContainer = styled.div`
  padding: 1em 0;
`;


const Showing = ({ className, poster, title, date, location, owner }) => (
    <div className={className}>
        <Poster src={poster}/>
        <PaddingContainer>
            <Header>{title}</Header>
            <VerticalPaddingContainer>
                {moment(date).format("D MMM HH:mm")}<br/>
                {location}<br/>
            </VerticalPaddingContainer>
            Bokat av {owner}
        </PaddingContainer>
    </div>
);


export default styled(Showing)`
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    display: flex;
    height: 150px;
    width: 100%;
`;
