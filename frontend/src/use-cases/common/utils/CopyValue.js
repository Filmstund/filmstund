import React, { Component } from "react";
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

class CopyValue extends Component {
  state = { isStricken: false };

  onClick = () => {
    const { useStricken = false } = this.props;
    copy(this.props.text);

    if (useStricken) {
      this.setState(state => ({ isStricken: !state.isStricken }));
    }
  };

  render() {
    const { isStricken } = this.state;
    return (
      <div>
        <Hover onClick={this.onClick} strikethrough={isStricken}>
          {this.props.text}
        </Hover>
      </div>
    );
  }
}

export default CopyValue;
