import styled from "@emotion/styled";

const FlexComponent = styled.div({
  display: "flex",
  flex: props => props.flex && 1,
  justifyContent: props => props.justifyContent && props.justifyContent,
  alignItems: props => props.alignItems && props.alignItems
});

export const Row = styled(FlexComponent)({
  flexDirection: "row"
});

export const Column = styled(FlexComponent)({
  flexDirection: "column"
});
