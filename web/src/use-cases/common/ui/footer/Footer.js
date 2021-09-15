import React from "react";
import styled from "@emotion/styled";
import GitHubLogo from "./GithubLogo";
import Bioord from "./Bioord";

const BottomContainer = styled.div`
  grid-area: footer;
  background-color: #e3e3e3;
  color: #9b9b9b;
  padding: 1em;
  font-weight: 300;
`;

const FlexBox = styled.div`
  display: flex;
  align-items: center;
`;

const FlexGrow = styled.div`
  flex: 1;
`;

const Footer = () => {
  return (
    <BottomContainer>
      <FlexBox>
        <FlexGrow>
          <Bioord />
        </FlexGrow>
        <a
          href="https://github.com/Filmstund/filmstund"
          rel="noopener noreferrer"
          target="_blank"
        >
          <GitHubLogo />
        </a>
      </FlexBox>
    </BottomContainer>
  );
};

export default Footer;
