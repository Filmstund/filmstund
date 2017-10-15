import React from "react";
import styled from "styled-components";
import alfons from "./assets/alfons.jpg";

const pointerHover = `
  &:hover {
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 1);    
  }
`;

const PaddingContainer = styled.div`
  flex: 1;
  padding: 1em;
`;

const Poster = styled.div`
  background-image: url(${props => props.src}), url(${alfons});
  background-size: cover;
  height: 100%;
  width: 100px;
`;

const Header = styled.h3`
  font-weight: 300;
  padding: 0;
  margin: 0;
  overflow: hidden;
`;

const filterEnterKey = (event, callback) => {
  if (event.which === 13) {
    callback && callback();
  }
};

const PosterBox = ({ className, poster, onClick, headerText, children }) =>
  <div
    tabIndex={onClick ? "0" : "-1"}
    className={className}
    onClick={onClick}
    onKeyDown={e => filterEnterKey(e, onClick)}
  >
    <Poster src={poster} />
    <PaddingContainer>
      <Header>
        {headerText}
      </Header>
      {children}
    </PaddingContainer>
  </div>;

export default styled(PosterBox)`
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    display: flex;
    height: 150px;
    width: 100%;
    ${props => props.onClick && pointerHover}
`;
