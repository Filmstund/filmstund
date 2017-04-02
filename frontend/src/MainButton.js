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

export default styled.button(MainButtonStyles);
