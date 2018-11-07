import React, { useState, useCallback } from "react";
import styled from "styled-components";

import copy from "../../../lib/copy";
import { SMALL_FONT_SIZE } from "../../../lib/style-vars";

const Hover = styled.span`
  &:hover {
    cursor: pointer;
    color: gray;
    &:after {
      padding-left: 1em;
      color: #222;
      content: "(Kopiera)";
      font-size: ${SMALL_FONT_SIZE};
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
