import React from "react";
import styled from "styled-components";
import { SMALL_FONT_SIZE } from "../../../lib/style-vars";

const Label = styled.label`
  display: inline-block;
  border-radius: 3px;
  font-size: ${SMALL_FONT_SIZE};
  padding: 0.5em 0;
`;

const UnstyledField = ({ children, text, ...props }) => (
  <div {...props}>
    <Label>{text}</Label>
    <br />
    {children}
  </div>
);

export const FieldWithoutMaxWidth = styled(UnstyledField)`
  margin-bottom: 1em;
  > div {
    width: 100%;
  }
  > input,
  select {
    border-radius: 4px;
    border: 1px solid gray;
    font-size: ${SMALL_FONT_SIZE};
    padding: 0.5em 1em;
    width: 100%;
  }
`;

export default styled(FieldWithoutMaxWidth)`
  max-width: 25rem;
`;
