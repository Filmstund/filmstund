import React from "react";
import styled from "@emotion/styled";
import { MEDIUM_FONT_SIZE } from "../../../lib/style-vars";

const EmptyListStyling = styled.div`
  display: flex;
  font-size: ${MEDIUM_FONT_SIZE};
  font-family: Roboto, sans-serif;
  justify-content: center;
  align-items: center;
  color: #9b9b9b;
  height: 50px;
`;

export const EmptyList = () => <EmptyListStyling>Inga besök</EmptyListStyling>;
