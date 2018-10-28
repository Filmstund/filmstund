import React, { useState, useCallback } from "react";
import styled from "styled-components";

import copy from "../../../lib/copy";

const Hover = styled.span`
  &:hover {
    cursor: pointer;
    color: gray;
    &:after {
      padding-left: 1em;
      color: #222;
      content: "(Kopiera)";
      font-size: 0.8em;
    }
  }
  text-decoration: ${props => (props.strikethrough ? "line-through" : "none")};
`;

const CopyValue = props => {
  const [isStricken, setIsStricken] = useState(false);

  const onClick = useCallback(() => {
    copy(props.text);

    if (props.useStricken) {
      setIsStricken(!isStricken);
    }
  });

  return (
    <div>
      <Hover onClick={onClick} strikethrough={isStricken}>
        {props.text}
      </Hover>
    </div>
  );
};

export default CopyValue;
