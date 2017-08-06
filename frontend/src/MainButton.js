import styled, { css } from "styled-components";
import { Link as RouterLink } from "react-router-dom";

const MainButtonStyles = css`
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  background-color: #fdd835;
  color: black;
  border: 0;
  height: 3em;
  margin: 0.25em 0;
  font-size: 1.1em;
  font-weight: 400;
  width: 100%;
  font-family: "Roboto", sans-serif;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  max-width: 12em;
  &:hover { 
    cursor: pointer;
    background-color: #ffeb3b;
  }
  &:disabled {
    background-color: #ccc;
    color: rgba(0, 0, 0, 0.87);
  }
`;

export const Link = styled(RouterLink)(MainButtonStyles);

const MainButton = styled.button(MainButtonStyles);

export const GrayButton = styled(MainButton)`
  background-color: #bdbdbd;
  color: rgba(0, 0, 0, 0.87);
  &:hover { 
    background-color: #9e9e9e;
  }
`;
export const RedButton = styled(MainButton)`
  background-color: #e53935;
  color: rgba(255, 255, 255, 0.87);
  &:hover { 
    background-color: #f44336;
  }
`;
export default MainButton;
