import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import styled from "styled-components";

import TopBar from "./TopBar";
import Footer from "./footer/Footer";
import Home from "./routes/Home";
import User from "./routes/User";

const PaddingContainer = styled.div`
  padding: 1em;
  flex: 1;
`;

const ScrollContainer = styled.div`
  overflow: scroll;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  height: 100vh;
`;

const App = React.createClass({
  render() {
    return (
      <Router>
        <Container>
          <TopBar/>
          <ScrollContainer>
            <PaddingContainer>
              <Route exact path="/" component={Home} />
              <Route path="/user" component={User} />
            </PaddingContainer>
            <Footer/>
          </ScrollContainer>
        </Container>
      </Router>
    );
  }
});

export default App
