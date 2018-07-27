import React from "react";
import styled from "styled-components";

export const StatusBox = styled.div`
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  margin: 1em 0;
  padding: 1em;
  background-color: ${props => (props.error ? "#ef5353" : "#66bb6a")};
  color: ${props => (props.error ? "white" : "black")};
`;

const StatusMessageBox = ({ errors, success, successMessage }) => {
    if (errors) {
        console.log(errors);
    }

  if (success) {
    return <StatusBox>{successMessage}</StatusBox>;
  } else if (errors) {
    return <StatusBox error>{errors.map(e => e.message).join(", ")}</StatusBox>;
  } else {
    return null;
  }
};

export default StatusMessageBox;
