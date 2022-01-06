import styled from "@emotion/styled";
import React from "react";

export const StatusBox = styled.div<{ error?: boolean }>`
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  margin: 1em 0;
  padding: 1em;
  pointer-events: auto;
  background-color: ${(props) => (props.error ? "#ef5353" : "#66bb6a")};
  color: ${(props) => (props.error ? "white" : "black")};
`;

const messageIsNotNullError = (message: string): boolean =>
  !message.includes("Cannot return null for non-nullable type");

const formatErrors = (errors: readonly Error[] | string): string => {
  if (Array.isArray(errors)) {
    return errors
      .map((e) => e.message)
      .filter(messageIsNotNullError)
      .join("\n");
  } else {
    return errors;
  }
};

interface Props {
  errors?: readonly Error[] | string | null | undefined;
  success?: boolean;
  successMessage?: string;
}

const StatusMessageBox: React.FC<Props> = ({
  errors,
  success,
  successMessage,
}) => {
  if (errors) {
    const message = formatErrors(errors);
    return <StatusBox error>{message}</StatusBox>;
  } else if (success) {
    return <StatusBox>{successMessage}</StatusBox>;
  } else {
    return null;
  }
};

export default StatusMessageBox;
