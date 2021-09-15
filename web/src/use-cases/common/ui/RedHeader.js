import React from "react";
import styled from "@emotion/styled";
import { margin, MEDIUM_FONT_SIZE } from "../../../lib/style-vars";

const Box = styled.div`
  border-bottom: 4px solid #d0021b;
  margin: ${margin} 0;
`;

export const Header = styled.h2`
  color: #4a4a4a;
  margin: 0 0 ${margin};
  font-size: ${MEDIUM_FONT_SIZE};
  font-weight: 500;
  font-family: Roboto, sans-serif;
`;

export const RedHeader = ({ children }) => (
  <Box>
    <Header>{children}</Header>
  </Box>
);
