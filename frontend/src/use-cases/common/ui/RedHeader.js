import React from "react";
import styled from "styled-components";
import { margin } from "../../../lib/style-vars";

const Box = styled.div`
  border-bottom: 4px solid #d0021b;
  margin: ${margin} 0;
`;

export const Header = styled.h2`
  color: #4a4a4a;
  margin: 0 0 ${margin};
  font-size: 18px;
  font-weight: 500;
  font-family: Roboto, sans-serif;
`;

export const RedHeader = ({ children }) => (
  <Box>
    <Header>{children}</Header>
  </Box>
);
