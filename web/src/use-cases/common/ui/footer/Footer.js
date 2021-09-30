import React from "react";
import styled from "@emotion/styled";
import GitHubLogo from "./GithubLogo";
import Bioord from "./Bioord";
import { Row } from "../Layout";

const FooterBox = styled.footer`
  display: flex;
  align-items: center;
  background-color: #e3e3e3;
  color: #9b9b9b;
  padding: 1em;
  font-weight: 300;
`;

export const Footer = () => (
  <FooterBox>
    <Row flex={1}>
      <Bioord />
    </Row>
    <a
      href="https://github.com/Filmstund/filmstund"
      rel="noopener noreferrer"
      target="_blank"
    >
      <GitHubLogo />
    </a>
  </FooterBox>
);
