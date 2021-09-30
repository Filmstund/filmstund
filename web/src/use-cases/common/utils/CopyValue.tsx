import React, { useCallback, useState } from "react";
import styled from "@emotion/styled";

import copy from "../../../lib/copy";
import { SMALL_FONT_SIZE } from "../../../lib/style-vars";

const Hover = styled.span<{ strikethrough: boolean }>`
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
  text-decoration: ${(props) =>
    props.strikethrough ? "line-through" : "none"};
`;

interface Props {
  text: string;
  useStricken?: boolean;
}

const CopyValue: React.FC<Props> = (props) => {
  const [isStricken, setIsStricken] = useState(false);

  const onClick = useCallback(() => {
    copy(props.text);

    if (props.useStricken) {
      setIsStricken(!isStricken);
    }
  }, [isStricken, props.text, props.useStricken]);

  return (
    <div>
      <Hover onClick={onClick} strikethrough={isStricken}>
        {props.text}
      </Hover>
    </div>
  );
};

export default CopyValue;
