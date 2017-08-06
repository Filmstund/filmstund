import React, { Component } from "react";
import styled from "styled-components";

import copy from "./lib/copy";

const Hover = styled.span`
  &:hover {
    cursor: pointer;
    color: gray;
    &:after {
      padding-left: 1em;
      color: #222;
      content: '(Kopiera)';
      font-size: 0.8em;
    }
  }
`;

class CopyValue extends Component {
  constructor(props) {
    super(props);
    this.state = {isStricken: false};
  }

  onClick = () => {
    copy(this.props.text);
    this.setState({isStricken: !this.state.isStricken});
  };

  render() {
    return (
      <div>
        <Hover onClick={this.onClick}>
          <span style={{textDecoration: this.state.isStricken ? "line-through" : "none"}}>{this.props.text}</span>
        </Hover>
      </div>
    );
  }
}

export default CopyValue;
