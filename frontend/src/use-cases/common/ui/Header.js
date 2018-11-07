import styled from "styled-components";
import { MEDIUM_FONT_SIZE, LARGE_FONT_SIZE } from "../../../lib/style-vars";

const Header = styled.h2`
  font-weight: 300;
  padding: 1em 0;
  margin: 0;
  font-size: ${LARGE_FONT_SIZE};
`;

export const SmallHeader = styled.h3`
  font-weight: 300;
  padding: 1em 0;
  font-size: ${MEDIUM_FONT_SIZE};
  margin: 0;
`;

export default Header;
