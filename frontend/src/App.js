import React from "react";
import Container from "./Container";
import TopBar from "./TopBar";

const App = React.createClass({
  render() {
    return (
      <Container>
        <TopBar/>
        <div>this is didish</div>
      </Container>
    );
  }
});

export default App
