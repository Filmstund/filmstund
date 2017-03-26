import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import styled from "styled-components";

import TopBar from "./TopBar";
import Container from "./Container";
import Home from "./routes/Home";
import Showings from "./routes/Showings";
import User from "./routes/User";

const PaddingContainer = styled.div`
  padding: 1em;
`;

const App = React.createClass({
  render() {
    return (
      <Router>
        <Container>
          <TopBar/>
          <PaddingContainer>
            <Route exact path="/" component={Home} />
            <Route path="/showings" component={Showings} />
            <Route path="/user" component={User} />
          </PaddingContainer>
        </Container>
      </Router>
    );
  }
});

export default App
