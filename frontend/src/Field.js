import React from "react";
import styled from "styled-components";

const Label = styled.label`
  display: inline-block;
  border-radius: 3px;
  font-size: 1.1em;
  padding: 0.5em 0;
`;

const Field = ({ children, text, ...props }) =>
  <div {...props}>
    <Label>{text}</Label><br />
    {children}
  </div>;

export default styled(Field)`
  margin-bottom: 1em;
  
  >  div { width: 100%; }
  input {
      border-radius: 4px;
      border: 1px solid gray;
      font-size: 1.1em;
      padding: 0.5em 1em;
      width: 100%;
  }
  
`;
