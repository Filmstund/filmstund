import React from "react";
import styled from "styled-components";
import GitHubLogo from "./GithubLogo";
import Bioord from "./Bioord";
import { PageWidthWrapper } from "../PageWidthWrapper";

const BottomContainer = styled.div`
  background-color: #e3e3e3;
  color: #9b9b9b;
  padding: 1em;
  font-weight: 100;
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
      <PageWidthWrapper>
        <FlexBox>
          <FlexGrow>
            <Bioord />
          </FlexGrow>
          <a
            href="https://github.com/cthdidIT/itbio"
            rel="noopener noreferrer"
            target="_blank"
          >
            <GitHubLogo />
          </a>
        </FlexBox>
      </PageWidthWrapper>
    </BottomContainer>
  );
};

export default Footer;
