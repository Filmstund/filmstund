import styled, { css } from "styled-components";

const FlexComponent = styled.div`
  display: flex;
  ${props =>
    props.flex === true &&
    css`
      flex: 1;
    `};
  ${props =>
    props.justifyContent &&
    css`
      justify-content: ${props.justifyContent};
    `};
  ${props =>
    props.alignItems &&
    css`
      align-items: ${props.alignItems};
    `};
`;

export const Row = FlexComponent.extend`
  flex-direction: row;
`;

export const Column = FlexComponent.extend`
  flex-direction: column;
`;
