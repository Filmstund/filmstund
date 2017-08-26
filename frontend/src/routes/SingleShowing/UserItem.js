import React from "react";
import styled from "styled-components";

import withUserLoader from "../../loaders/UserLoader";

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
  background-image: url(${props => props.src});
  background-size: cover;
  height: 96px;
  width: 96px;
`;

const Header = styled.h3`
  font-weight: 300;
  padding: 0;
  margin: 0;
  overflow: hidden;
`;
const UserItem = withUserLoader(({ className, showPhone, user, children }) =>
  <div className={className}>
    <Poster src={user.avatar} />
    <PaddingContainer>
      <Header>
        {user.firstName} '{user.nick}' {user.lastName}
      </Header>
      {showPhone &&
        user.phone &&
        <span>
          {user.phone}
        </span>}
      {children}
    </PaddingContainer>
  </div>
);

export default styled(UserItem)`
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    display: flex;
    height: 96px;
    width: 100%;
    margin-bottom: 0.5em;
    margin-left: 0.5em;
    @media (min-width: 500px) {
      max-width: 100%;
    }
    @media (min-width: 700px) {
      max-width: 48%;
    }
    ${props => props.onClick && pointerHover}
`;
