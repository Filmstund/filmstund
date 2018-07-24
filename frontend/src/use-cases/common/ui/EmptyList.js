import React from "react";
import styled from "styled-components";

const EmptyListStyling = styled.div`
  display: flex;
  font-size: 15px;
  font-family: Roboto, sans-serif;
  justify-content: center;
  align-items: center;
  color: #9b9b9b;
  height: 50px;
`;

export const EmptyList = () => <EmptyListStyling>Inga besök</EmptyListStyling>;
