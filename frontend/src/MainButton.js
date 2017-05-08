import styled, { css } from "styled-components";
import { Link as RouterLink } from "react-router-dom";

const MainButtonStyles = css`
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  background-color: gold;
  color: black;
  border: 0;
  height: 3em;
  margin: 1em 0;
  font-size: 1.1em;
  font-weight: 400;
  width: 100%;
  font-family: "Roboto", sans-serif;
`;

export const Link = styled(RouterLink)(MainButtonStyles);

const MainButton = styled.button(MainButtonStyles);

export const GrayButton = styled(MainButton)`
  background-color: #bdbdbd;
  color: rgba(0, 0, 0, 0.87);
`
export const GreenButton = styled(MainButton)`
  background-color: #66bb6a;
  color: rgba(0, 0, 0, 0.87);
`
export const RedButton = styled(MainButton)`
  background-color: #ef5350;
  color: rgba(255, 255, 255, 0.87);
`
export default MainButton
