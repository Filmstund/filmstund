import styled from "styled-components";
import { Link as RouterLink } from "react-router-dom";
import { MEDIUM_FONT_SIZE } from "../../../lib/style-vars";

const MainButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  background-color: #fdd835;
  color: black;
  border: 0;
  height: 3em;
  margin: 0.4rem 0 1.6rem 0;
  font-size: ${MEDIUM_FONT_SIZE};
  font-weight: 400;
  width: 100%;
  font-family: "Roboto", sans-serif;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  @media (min-width: 30rem) {
    max-width: 12rem;
  }
  &:hover {
    cursor: pointer;
    background-color: #ffeb3b;
  }
  &:disabled {
    background-color: #ccc;
    color: rgba(0, 0, 0, 0.87);
  }
`;

export const Link = MainButton.withComponent(RouterLink);

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

export const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
`;

export default MainButton;
