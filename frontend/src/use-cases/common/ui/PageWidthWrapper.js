import styled from "styled-components";
import { nest } from "recompose";

const ContentWrapper = styled.div`
  max-width: 960px;
  width: 100%;
`;

const OuterWrapper = styled.div`
  display: flex;
  height: 100%;
  flex-direction: row;
  justify-content: center;
`;

export const PageWidthWrapper = nest(OuterWrapper, ContentWrapper);
